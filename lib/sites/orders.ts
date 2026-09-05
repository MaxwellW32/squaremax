import type { OrderFulfillment, OrderItem, OrderStatus } from "@/db/schema"
import { formatMoney, orderRef } from "./saleMath"

//============================================================
// Online-order types shared by the shop island, the dashboard
// Orders tab and the customer account page (pure — no DB).
//============================================================

export type OrderRow = {
    id: string
    ref: string
    items: OrderItem[]
    subtotalCents: number
    taxCents: number
    totalCents: number
    status: OrderStatus
    fulfillment: OrderFulfillment
    customerName: string
    customerEmail: string
    customerPhone: string
    address: string
    note: string
    saleId: string | null
    createdAt: string
    updatedAt: string
}

export const orderStatusLabels: Record<OrderStatus, string> = {
    new: "New",
    paid: "Paid",
    fulfilled: "Done",
    cancelled: "Cancelled",
}

export const fulfillmentLabels: Record<OrderFulfillment, string> = {
    pickup: "Pickup",
    delivery: "Delivery",
}

export function orderLinesText(items: OrderItem[]): string {
    return items.map(item => `• ${item.qty}× ${item.name}`).join("\n")
}

//the message a customer sends the business on WhatsApp right after ordering
export function orderWhatsappText(input: {
    businessName: string
    orderId: string
    items: OrderItem[]
    totalCents: number
    fulfillment: OrderFulfillment
    customerName: string
}): string {
    return [
        `Hi ${input.businessName}! I just placed order ${orderRef(input.orderId)} on your website:`,
        orderLinesText(input.items),
        `Total ${formatMoney(input.totalCents)} · ${fulfillmentLabels[input.fulfillment]}`,
        `— ${input.customerName}`,
    ].join("\n")
}

export function whatsappLink(digitsRaw: string, text: string): string | null {
    const digits = digitsRaw.replace(/\D/g, "")
    if (digits === "") return null
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
