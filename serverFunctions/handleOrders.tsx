"use server"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantOrders, SalePaymentMethod } from "@/db/schema"
import { bustTenant, getOwnedTenant } from "@/lib/sites/owner"
import { orderRef } from "@/lib/sites/saleMath"
import { createSaleInTx, lockInventory } from "@/lib/sites/salesCore"
import { OrderRow } from "@/lib/sites/orders"
import { toOrderRow } from "@/lib/sites/orderRows"

//============================================================
// Owner-side order management (dashboard). Customers place
// orders through handleOrdersPublic.tsx; here the business
// works them: New → Paid (becomes a sale, stock comes off,
// receipt lands in the reports) → Done, or cancelled.
//============================================================

export async function getOrders(tenantId: string): Promise<OrderRow[]> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const rows = await db.query.tenantOrders.findMany({
        where: eq(tenantOrders.tenantId, tenant.id),
        orderBy: [desc(tenantOrders.createdAt)],
        limit: 200,
    })
    return rows.map(toOrderRow)
}

const paymentMethodSchema = z.enum(["cash", "card", "transfer", "whatsapp", "other"])

//the order becomes a sale: stock comes off, the receipt joins the reports
export async function markOrderPaid(tenantId: string, orderId: string, paymentMethodRaw: SalePaymentMethod): Promise<OrderRow> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const paymentMethod = paymentMethodSchema.parse(paymentMethodRaw)

    const updated = await db.transaction(async tx => {
        await lockInventory(tx, tenant.id)

        const order = await tx.query.tenantOrders.findFirst({
            where: and(eq(tenantOrders.id, z.string().parse(orderId)), eq(tenantOrders.tenantId, tenant.id)),
        })
        if (order === undefined) throw new Error("order not found")
        if (order.status !== "new") throw new Error(`this order is already ${order.status}`)

        const sale = await createSaleInTx(tx, tenant.id, {
            items: order.items.map(item => ({ productId: item.productId, qty: item.qty })),
            paymentMethod,
            discountCents: 0,
            customerId: order.customerId,
            customerName: order.customerName,
            note: `Online order ${orderRef(order.id)}`,
        })

        const [row] = await tx.update(tenantOrders)
            .set({ status: "paid", saleId: sale.id, updatedAt: new Date() })
            .where(eq(tenantOrders.id, order.id))
            .returning()
        return row
    })

    //stock badges on the public shop change with every sale
    bustTenant(tenant.slug, tenant.customDomain)
    return toOrderRow(updated)
}

export async function markOrderFulfilled(tenantId: string, orderId: string): Promise<OrderRow> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const [row] = await db.update(tenantOrders)
        .set({ status: "fulfilled", updatedAt: new Date() })
        .where(and(eq(tenantOrders.id, z.string().parse(orderId)), eq(tenantOrders.tenantId, tenant.id), eq(tenantOrders.status, "paid")))
        .returning()
    if (row === undefined) throw new Error("mark the order paid first")
    return toOrderRow(row)
}

//only unpaid orders can be cancelled here — a paid one is refunded from the
//Store tab so the stock and the books stay right
export async function cancelOrder(tenantId: string, orderId: string): Promise<OrderRow> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const [row] = await db.update(tenantOrders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(tenantOrders.id, z.string().parse(orderId)), eq(tenantOrders.tenantId, tenant.id), eq(tenantOrders.status, "new")))
        .returning()
    if (row === undefined) throw new Error("only new orders can be cancelled — refund a paid order from the Store tab")
    return toOrderRow(row)
}
