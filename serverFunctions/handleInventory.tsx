"use server"
import { z } from "zod"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantProducts, tenantSales, SaleItem } from "@/db/schema"
import { getOwnedTenant, bustTenant } from "@/lib/sites/owner"

//============================================================
// Store & inventory add-on (owner-gated). Products carry price
// in integer cents and tax as basis points; recorded sales
// snapshot both so reports stay correct after edits. Stock is
// decremented inside a per-tenant advisory-locked transaction.
//============================================================

const productInputSchema = z.object({
    name: z.string().min(1).max(140),
    description: z.string().max(2000).default(""),
    priceCents: z.number().int().min(0).max(100_000_000),
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
    customerName: z.string().max(120).default(""),
    customerId: z.string().nullable().default(null),
    note: z.string().max(1000).default(""),
})

//record a sale at the counter: price/tax read from the product rows server-side,
//stock decremented atomically, receipt snapshot stored on the sale row
export async function recordSale(tenantId: string, input: z.infer<typeof saleInputSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validated = saleInputSchema.parse(input)

    const sale = await db.transaction(async tx => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenant.id + ":inventory"}))`)

        const products = await tx.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenant.id) })
        const productsById = new Map(products.map(product => [product.id, product]))

        const items: SaleItem[] = []
        let subtotalCents = 0
        let taxCents = 0

        for (const line of validated.items) {
            const product = productsById.get(line.productId)
            if (product === undefined) throw new Error("product not found")
            if (product.trackStock && product.stock < line.qty) {
                throw new Error(`not enough stock for ${product.name} (${product.stock} left)`)
            }

            const lineSubtotal = product.priceCents * line.qty
            const lineTax = Math.round(lineSubtotal * product.taxRateBps / 10_000)
            subtotalCents += lineSubtotal
            taxCents += lineTax
            items.push({
                productId: product.id,
                name: product.name,
                qty: line.qty,
                unitPriceCents: product.priceCents,
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
            taxCents,
            totalCents: subtotalCents + taxCents,
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

export async function getSales(tenantId: string, limit: number = 100) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantSales.findMany({
        where: eq(tenantSales.tenantId, tenant.id),
        orderBy: [desc(tenantSales.createdAt)],
        limit: z.number().int().min(1).max(500).parse(limit),
    })
}

//month-to-date report: revenue, tax collected, receipts, top items, low stock
export async function getSalesSummary(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [sales, products] = await Promise.all([
        db.query.tenantSales.findMany({
            where: and(eq(tenantSales.tenantId, tenant.id), gte(tenantSales.createdAt, monthStart)),
        }),
        db.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenant.id) }),
    ])

    const qtyByProduct = new Map<string, { name: string; qty: number; revenueCents: number }>()
    for (const sale of sales) {
        for (const item of sale.items) {
            const entry = qtyByProduct.get(item.productId) ?? { name: item.name, qty: 0, revenueCents: 0 }
            entry.qty += item.qty
            entry.revenueCents += item.unitPriceCents * item.qty
            qtyByProduct.set(item.productId, entry)
        }
    }

    return {
        monthStartISO: monthStart.toISOString(),
        receipts: sales.length,
        revenueCents: sales.reduce((sum, sale) => sum + sale.totalCents, 0),
        taxCents: sales.reduce((sum, sale) => sum + sale.taxCents, 0),
        topItems: [...qtyByProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5),
        lowStock: products
            .filter(product => product.active && product.trackStock && product.stock <= 3)
            .map(product => ({ id: product.id, name: product.name, stock: product.stock })),
    }
}
