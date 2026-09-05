import type { tenantOrders } from "@/db/schema"
import { orderRef } from "./saleMath"
import type { OrderRow } from "./orders"

//DB row -> the serialisable shape the dashboard and account page render
export function toOrderRow(row: typeof tenantOrders.$inferSelect): OrderRow {
    return {
        id: row.id,
        ref: orderRef(row.id),
        items: row.items,
        subtotalCents: row.subtotalCents,
        taxCents: row.taxCents,
        totalCents: row.totalCents,
        status: row.status,
        fulfillment: row.fulfillment,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
        customerPhone: row.customerPhone,
        address: row.address,
        note: row.note,
        saleId: row.saleId,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    }
}
