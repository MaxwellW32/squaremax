import { eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantProducts, tenantSales, SalePaymentMethod } from "@/db/schema"
import { describeProblem, priceReceipt } from "@/lib/sites/saleMath"

//============================================================
// The one routine that puts a sale on the books — used by the
// counter "record a sale" flow AND by marking an online order
// paid. Runs inside the caller's transaction under the tenant's
// inventory advisory lock: prices/costs/tax come from the
// product rows at that moment, stock is decremented atomically,
// and the full receipt is snapshotted on the sale row.
//============================================================

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function lockInventory(tx: Tx, tenantId: string) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenantId + ":inventory"}))`)
}

export async function createSaleInTx(tx: Tx, tenantId: string, input: {
    items: { productId: string; qty: number }[]
    paymentMethod: SalePaymentMethod
    discountCents: number
    customerId: string | null
    customerName: string
    note: string
}) {
    const products = await tx.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenantId) })
    const priced = priceReceipt(products, input.items, input.discountCents)
    if (!priced.ok) throw new Error(describeProblem(priced.problem))
    const { receipt } = priced

    for (const line of receipt.lines) {
        const product = products.find(candidate => candidate.id === line.productId)
        if (product !== undefined && product.trackStock) {
            await tx.update(tenantProducts)
                .set({ stock: product.stock - line.qty })
                .where(eq(tenantProducts.id, product.id))
        }
    }

    const [inserted] = await tx.insert(tenantSales).values({
        tenantId,
        items: receipt.lines.map(line => ({
            productId: line.productId,
            name: line.name,
            qty: line.qty,
            unitPriceCents: line.unitPriceCents,
            unitCostCents: line.unitCostCents,
            taxCents: line.taxCents,
        })),
        subtotalCents: receipt.subtotalCents,
        discountCents: receipt.discountCents,
        taxCents: receipt.taxCents,
        totalCents: receipt.totalCents,
        paymentMethod: input.paymentMethod,
        customerId: input.customerId,
        customerName: input.customerName,
        note: input.note,
    }).returning()

    return inserted
}
