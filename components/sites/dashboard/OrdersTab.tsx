"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import type { SalePaymentMethod } from "@/db/schema"
import { OrderRow, fulfillmentLabels, orderStatusLabels } from "@/lib/sites/orders"
import { formatMoney } from "@/lib/sites/saleMath"
import { cancelOrder, getOrders, markOrderFulfilled, markOrderPaid } from "@/serverFunctions/handleOrders"

//============================================================
// Orders tab: everything customers ordered from the website.
// New → Paid (becomes a sale, stock comes off) → Done. Designed
// for a phone in one hand: big status pills, tap-to-call and
// tap-to-WhatsApp on every order.
//============================================================

const filters = ["new", "paid", "fulfilled", "cancelled", "all"] as const
type Filter = (typeof filters)[number]

const statusStyle: Record<OrderRow["status"], string> = {
    new: "bg-cobalt text-white",
    paid: "bg-amber-100 text-amber-800",
    fulfilled: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-line text-mist",
}

const paymentMethods: { id: SalePaymentMethod; label: string }[] = [
    { id: "cash", label: "Cash" },
    { id: "card", label: "Card" },
    { id: "transfer", label: "Bank transfer / Lynk" },
    { id: "whatsapp", label: "Paid via WhatsApp" },
    { id: "other", label: "Other" },
]

function when(iso: string): string {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Jamaica" })
}

export default function OrdersTab(props: {
    tenantId: string
    enabled: boolean
    hasShopSection: boolean
    initialOrders: OrderRow[]
    onOrdersChange?: (orders: OrderRow[]) => void
    onOpenStore: () => void
}) {
    const [orders, ordersSet] = useState<OrderRow[]>(props.initialOrders)
    const [filter, filterSet] = useState<Filter>("new")
    const [busyId, busyIdSet] = useState<string | null>(null)
    const [payingId, payingIdSet] = useState<string | null>(null)
    const [method, methodSet] = useState<SalePaymentMethod>("cash")

    const update = (next: OrderRow[]) => {
        ordersSet(next)
        props.onOrdersChange?.(next)
    }

    const run = async (orderId: string, work: () => Promise<OrderRow>, success: string) => {
        if (busyId !== null) return
        busyIdSet(orderId)
        try {
            const updated = await work()
            update(orders.map(order => order.id === updated.id ? updated : order))
            toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busyIdSet(null)
            payingIdSet(null)
        }
    }

    const refresh = async () => {
        try {
            update(await getOrders(props.tenantId))
            toast.success("Up to date")
        } catch {
            toast.error("couldn't refresh")
        }
    }

    if (!props.enabled) {
        return (
            <div className="grid max-w-xl gap-3 rounded-xl border border-line bg-surface p-5 text-sm text-mist">
                <p>
                    Turn on the <strong className="text-ink">Online store &amp; inventory</strong> add-on and customers can order straight from your
                    website. Every order lands here, you confirm it, and payment happens your way — cash on pickup, bank transfer, Lynk.
                </p>
                <button type="button" onClick={props.onOpenStore} className="w-fit rounded-lg bg-cobalt px-4 py-2 font-display text-sm font-bold text-white hover:bg-ink">
                    See add-ons
                </button>
            </div>
        )
    }

    const counts = {
        new: orders.filter(order => order.status === "new").length,
        paid: orders.filter(order => order.status === "paid").length,
        fulfilled: orders.filter(order => order.status === "fulfilled").length,
        cancelled: orders.filter(order => order.status === "cancelled").length,
        all: orders.length,
    }
    const shown = orders.filter(order => filter === "all" || order.status === filter)

    return (
        <div className="grid gap-4">
            {!props.hasShopSection && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Your site has no <strong>Products</strong> section yet, so visitors can&apos;t order. Add one from the Website tab (Selling &amp; converting → Products).
                </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
                {filters.map(option => (
                    <button key={option} type="button" onClick={() => filterSet(option)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === option ? "bg-ink text-white" : "border border-line text-mist hover:text-ink"}`}>
                        {option === "fulfilled" ? "Done" : option} {counts[option] > 0 && <span className="opacity-70">· {counts[option]}</span>}
                    </button>
                ))}
                <button type="button" onClick={refresh} className="ml-auto rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:text-ink">
                    Refresh
                </button>
            </div>

            {shown.length === 0 && (
                <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-mist">
                    {orders.length === 0 ? "No orders yet — share your shop link and they'll show up here the moment someone orders." : "Nothing here."}
                </p>
            )}

            <div className="grid gap-3">
                {shown.map(order => {
                    const busy = busyId === order.id
                    const phoneDigits = order.customerPhone.replace(/\D/g, "")
                    return (
                        <article key={order.id} className={`grid gap-3 rounded-xl border bg-surface p-4 ${order.status === "new" ? "border-cobalt/50" : "border-line"}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle[order.status]}`}>{orderStatusLabels[order.status]}</span>
                                    <span className="font-mono text-sm font-bold">{order.ref}</span>
                                    <span className="rounded-full border border-line px-2 py-0.5 text-xs text-mist">{fulfillmentLabels[order.fulfillment]}</span>
                                </div>
                                <span className="text-xs text-mist">{when(order.createdAt)}</span>
                            </div>

                            <div className="grid gap-1 text-sm sm:grid-cols-[1fr_auto] sm:items-start">
                                <div className="grid gap-0.5">
                                    <p className="font-semibold">{order.customerName}</p>
                                    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                        {order.customerPhone !== "" && <a className="text-cobalt hover:underline" href={`tel:${order.customerPhone}`}>📞 {order.customerPhone}</a>}
                                        {phoneDigits !== "" && <a className="text-emerald-700 hover:underline" href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hi ${order.customerName}, about your order ${order.ref}:`)}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
                                        {order.customerEmail !== "" && <a className="text-cobalt hover:underline" href={`mailto:${order.customerEmail}`}>✉️ {order.customerEmail}</a>}
                                    </p>
                                    {order.address !== "" && <p className="text-xs text-mist">📍 {order.address}</p>}
                                    {order.note !== "" && <p className="text-xs italic text-mist">“{order.note}”</p>}
                                </div>
                                <p className="font-display text-xl font-bold">{formatMoney(order.totalCents)}</p>
                            </div>

                            <ul className="grid gap-0.5 rounded-lg bg-paper px-3 py-2 text-sm">
                                {order.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex justify-between gap-3">
                                        <span>{item.qty}× {item.name}</span>
                                        <span className="tabular-nums text-mist">{formatMoney(item.unitPriceCents * item.qty)}</span>
                                    </li>
                                ))}
                                {order.taxCents > 0 && <li className="flex justify-between gap-3 text-xs text-mist"><span>Tax</span><span>{formatMoney(order.taxCents)}</span></li>}
                            </ul>

                            {order.status === "new" && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {payingId === order.id ? (
                                        <>
                                            <select className="rounded-md border border-line bg-surface px-3 py-2 text-sm" value={method} onChange={e => methodSet(e.target.value as SalePaymentMethod)} aria-label="How was it paid?">
                                                {paymentMethods.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                                            </select>
                                            <button type="button" disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                                                onClick={() => run(order.id, () => markOrderPaid(props.tenantId, order.id, method), "Paid — stock updated, receipt recorded")}>
                                                {busy ? "Saving…" : "Confirm paid"}
                                            </button>
                                            <button type="button" className="text-xs font-semibold text-mist" onClick={() => payingIdSet(null)}>Back</button>
                                        </>
                                    ) : (
                                        <>
                                            <button type="button" disabled={busy} className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"
                                                onClick={() => payingIdSet(order.id)}>
                                                Mark paid
                                            </button>
                                            <button type="button" disabled={busy} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-mist hover:border-brand hover:text-brand disabled:opacity-50"
                                                onClick={() => {
                                                    if (!window.confirm(`Cancel order ${order.ref}?`)) return
                                                    run(order.id, () => cancelOrder(props.tenantId, order.id), "Order cancelled")
                                                }}>
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {order.status === "paid" && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button type="button" disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                                        onClick={() => run(order.id, () => markOrderFulfilled(props.tenantId, order.id), order.fulfillment === "delivery" ? "Delivered ✓" : "Collected ✓")}>
                                        {order.fulfillment === "delivery" ? "Mark delivered" : "Mark collected"}
                                    </button>
                                    <span className="text-xs text-mist">Need to undo? Refund the sale from the Store tab.</span>
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}
