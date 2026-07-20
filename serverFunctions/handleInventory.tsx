"use server"
import { z } from "zod"
import { and, desc, eq, gte, lte, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantExpenses, tenantProducts, tenantSales, SaleItem, SalePaymentMethod } from "@/db/schema"
import { getOwnedTenant, bustTenant } from "@/lib/sites/owner"

//============================================================
// Store & inventory add-on (owner-gated). Accounting-grade:
//  - prices, COSTS (COGS) and tax in integer cents / basis points
//  - sales snapshot price+cost+tax per line; receipt-level
//    discount applied proportionally BEFORE tax
//  - refunds keep the row (audit trail) and restock items
//  - an expenses ledger + date-range report for tax filing
//============================================================

const paymentMethodSchema = z.enum(["cash", "card", "transfer", "whatsapp", "other"])

const productInputSchema = z.object({
    name: z.string().min(1).max(140),
    description: z.string().max(2000).default(""),
    priceCents: z.number().int().min(0).max(100_000_000),
    costCents: z.number().int().min(0).max(100_000_000).default(0),
    taxRateBps: z.number().int().min(0).max(10_000), //0–100%
    stock: z.number().int().min(0).max(1_000_000),
    trackStock: z.boolean(),
    imageSrc: z.string().max(1000).default(""),
    active: z.boolean(),
})

export async function getProducts(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantProducts.findMany({
        where: eq(tenantProducts.tenantId, tenant.id),
        orderBy: [desc(tenantProducts.createdAt)],
    })
}

export async function addProduct(tenantId: string, input: z.infer<typeof productInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = productInputSchema.parse(input)

    const [created] = await db.insert(tenantProducts).values({ ...validated, tenantId: tenant.id }).returning()
    bustTenant(tenant.slug, tenant.customDomain)
    return created
}

export async function updateProduct(tenantId: string, productId: string, input: z.infer<typeof productInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = productInputSchema.parse(input)

    await db.update(tenantProducts)
        .set(validated)
        .where(and(eq(tenantProducts.id, z.string().parse(productId)), eq(tenantProducts.tenantId, tenant.id)))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function deleteProduct(tenantId: string, productId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    await db.delete(tenantProducts)
        .where(and(eq(tenantProducts.id, z.string().parse(productId)), eq(tenantProducts.tenantId, tenant.id)))
    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//------------------------------------------------------------
// sales
//------------------------------------------------------------

const saleInputSchema = z.object({
    items: z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(10_000),
    }).array().min(1).max(50),
    paymentMethod: paymentMethodSchema.default("cash"),
    discountCents: z.number().int().min(0).max(100_000_000).default(0),
    customerName: z.string().max(120).default(""),
    customerId: z.string().nullable().default(null),
    note: z.string().max(1000).default(""),
})

//record a sale at the counter: price/cost/tax read from the product rows
//server-side, discount applied proportionally before tax, stock decremented
//atomically, full receipt snapshot stored on the sale row
export async function recordSale(tenantId: string, input: z.infer<typeof saleInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = saleInputSchema.parse(input)

    const sale = await db.transaction(async tx => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenant.id + ":inventory"}))`)

        const products = await tx.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenant.id) })
        const productsById = new Map(products.map(product => [product.id, product]))

        //pass 1: subtotal (to cap + apportion the discount)
        let subtotalCents = 0
        for (const line of validated.items) {
            const product = productsById.get(line.productId)
            if (product === undefined) throw new Error("product not found")
            subtotalCents += product.priceCents * line.qty
        }
        const discountCents = Math.min(validated.discountCents, subtotalCents)

        //pass 2: per-line tax on the discounted amount + stock decrement
        const items: SaleItem[] = []
        let taxCents = 0
        for (const line of validated.items) {
            const product = productsById.get(line.productId)!
            if (product.trackStock && product.stock < line.qty) {
                throw new Error(`not enough stock for ${product.name} (${product.stock} left)`)
            }

            const lineSubtotal = product.priceCents * line.qty
            const lineDiscounted = subtotalCents === 0 ? 0 : lineSubtotal - Math.round(discountCents * lineSubtotal / subtotalCents)
            const lineTax = Math.round(lineDiscounted * product.taxRateBps / 10_000)
            taxCents += lineTax
            items.push({
                productId: product.id,
                name: product.name,
                qty: line.qty,
                unitPriceCents: product.priceCents,
                unitCostCents: product.costCents,
                taxCents: lineTax,
            })

            if (product.trackStock) {
                await tx.update(tenantProducts)
                    .set({ stock: product.stock - line.qty })
                    .where(eq(tenantProducts.id, product.id))
            }
        }

        const [inserted] = await tx.insert(tenantSales).values({
            tenantId: tenant.id,
            items,
            subtotalCents,
            discountCents,
            taxCents,
            totalCents: subtotalCents - discountCents + taxCents,
            paymentMethod: validated.paymentMethod,
            customerId: validated.customerId,
            customerName: validated.customerName,
            note: validated.note,
        }).returning()

        return inserted
    })

    //stock badges on the public shop section change with every sale
    bustTenant(tenant.slug, tenant.customDomain)
    return sale
}

//refund keeps the receipt on the books (status flips) and restocks items
export async function refundSale(tenantId: string, saleId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    await db.transaction(async tx => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenant.id + ":inventory"}))`)

        const sale = await tx.query.tenantSales.findFirst({
            where: and(eq(tenantSales.id, z.string().parse(saleId)), eq(tenantSales.tenantId, tenant.id)),
        })
        if (sale === undefined) throw new Error("sale not found")
        if (sale.status === "refunded") throw new Error("already refunded")

        await tx.update(tenantSales).set({ status: "refunded" }).where(eq(tenantSales.id, sale.id))

        for (const item of sale.items) {
            const product = await tx.query.tenantProducts.findFirst({
                where: and(eq(tenantProducts.id, item.productId), eq(tenantProducts.tenantId, tenant.id)),
            })
            if (product !== undefined && product.trackStock) {
                await tx.update(tenantProducts).set({ stock: product.stock + item.qty }).where(eq(tenantProducts.id, product.id))
            }
        }
    })

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

export async function getSales(tenantId: string, limit: number = 100) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantSales.findMany({
        where: eq(tenantSales.tenantId, tenant.id),
        orderBy: [desc(tenantSales.createdAt)],
        limit: z.number().int().min(1).max(500).parse(limit),
    })
}

//------------------------------------------------------------
// expenses ledger
//------------------------------------------------------------

const expenseInputSchema = z.object({
    label: z.string().min(1).max(160),
    category: z.string().max(60).default("general"),
    amountCents: z.number().int().min(1).max(1_000_000_000),
    incurredAtISO: z.string(), //"2026-07-20"
    note: z.string().max(1000).default(""),
})

export async function addExpense(tenantId: string, input: z.infer<typeof expenseInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = expenseInputSchema.parse(input)

    const incurredAt = new Date(validated.incurredAtISO)
    if (Number.isNaN(incurredAt.getTime())) throw new Error("invalid date")

    const [created] = await db.insert(tenantExpenses).values({
        tenantId: tenant.id,
        label: validated.label,
        category: validated.category !== "" ? validated.category : "general",
        amountCents: validated.amountCents,
        incurredAt,
        note: validated.note,
    }).returning()
    return created
}

export async function deleteExpense(tenantId: string, expenseId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    await db.delete(tenantExpenses)
        .where(and(eq(tenantExpenses.id, z.string().parse(expenseId)), eq(tenantExpenses.tenantId, tenant.id)))
    return { ok: true }
}

export async function getExpenses(tenantId: string, limit: number = 100) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantExpenses.findMany({
        where: eq(tenantExpenses.tenantId, tenant.id),
        orderBy: [desc(tenantExpenses.incurredAt)],
        limit: z.number().int().min(1).max(500).parse(limit),
    })
}

//------------------------------------------------------------
// reporting — pick a range, get everything an accountant asks for
//------------------------------------------------------------

const rangeSchema = z.object({
    fromISO: z.string(),
    toISO: z.string(),
})

export async function getReport(tenantId: string, rangeRaw: z.infer<typeof rangeSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const range = rangeSchema.parse(rangeRaw)

    const from = new Date(range.fromISO)
    const to = new Date(range.toISO)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) throw new Error("invalid date range")
    //make the end date inclusive (whole day)
    const toEnd = new Date(to.getTime() + 24 * 60 * 60 * 1000)

    const [sales, expenses, products] = await Promise.all([
        db.query.tenantSales.findMany({
            where: and(eq(tenantSales.tenantId, tenant.id), gte(tenantSales.createdAt, from), lte(tenantSales.createdAt, toEnd)),
            orderBy: [desc(tenantSales.createdAt)],
        }),
        db.query.tenantExpenses.findMany({
            where: and(eq(tenantExpenses.tenantId, tenant.id), gte(tenantExpenses.incurredAt, from), lte(tenantExpenses.incurredAt, toEnd)),
            orderBy: [desc(tenantExpenses.incurredAt)],
        }),
        db.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenant.id) }),
    ])

    const completed = sales.filter(sale => sale.status === "completed")

    const byProduct = new Map<string, { name: string; qty: number; revenueCents: number; cogsCents: number }>()
    let cogsCents = 0
    for (const sale of completed) {
        for (const item of sale.items) {
            const unitCost = item.unitCostCents ?? 0
            const entry = byProduct.get(item.productId) ?? { name: item.name, qty: 0, revenueCents: 0, cogsCents: 0 }
            entry.qty += item.qty
            entry.revenueCents += item.unitPriceCents * item.qty
            entry.cogsCents += unitCost * item.qty
            byProduct.set(item.productId, entry)
            cogsCents += unitCost * item.qty
        }
    }

    const byPayment = new Map<SalePaymentMethod, { count: number; totalCents: number }>()
    for (const sale of completed) {
        const entry = byPayment.get(sale.paymentMethod) ?? { count: 0, totalCents: 0 }
        entry.count += 1
        entry.totalCents += sale.totalCents
        byPayment.set(sale.paymentMethod, entry)
    }

    const byExpenseCategory = new Map<string, number>()
    for (const expense of expenses) {
        byExpenseCategory.set(expense.category, (byExpenseCategory.get(expense.category) ?? 0) + expense.amountCents)
    }

    const revenueCents = completed.reduce((sum, sale) => sum + sale.totalCents, 0)
    const taxCents = completed.reduce((sum, sale) => sum + sale.taxCents, 0)
    const discountCents = completed.reduce((sum, sale) => sum + sale.discountCents, 0)
    const expensesCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0)
    const netSalesCents = revenueCents - taxCents //what's actually yours pre-costs
    const grossProfitCents = netSalesCents - cogsCents

    return {
        fromISO: range.fromISO,
        toISO: range.toISO,
        receipts: completed.length,
        refunds: sales.length - completed.length,
        revenueCents, //gross takings incl. tax
        taxCents, //collected for the tax office
        discountCents,
        netSalesCents,
        cogsCents,
        grossProfitCents,
        expensesCents,
        netProfitCents: grossProfitCents - expensesCents,
        byProduct: [...byProduct.values()].sort((a, b) => b.revenueCents - a.revenueCents),
        byPayment: [...byPayment.entries()].map(([method, entry]) => ({ method, ...entry })),
        byExpenseCategory: [...byExpenseCategory.entries()].map(([category, totalCents]) => ({ category, totalCents })),
        sales, //full rows for CSV export (includes refunded, marked)
        expenses,
        lowStock: products
            .filter(product => product.active && product.trackStock && product.stock <= 3)
            .map(product => ({ id: product.id, name: product.name, stock: product.stock })),
    }
}

//kept for the dashboard overview card (month-to-date snapshot)
export async function getSalesSummary(tenantId: string) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const report = await getReport(tenantId, {
        fromISO: monthStart.toISOString().slice(0, 10),
        toISO: now.toISOString().slice(0, 10),
    })
    return {
        monthStartISO: monthStart.toISOString(),
        receipts: report.receipts,
        revenueCents: report.revenueCents,
        taxCents: report.taxCents,
        topItems: report.byProduct.slice(0, 5),
        lowStock: report.lowStock,
    }
}
