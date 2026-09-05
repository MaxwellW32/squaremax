"use client"
import React, { useMemo, useState } from "react"
import { placeOrder } from "@/serverFunctions/handleOrdersPublic"
import { ProductLite } from "@/lib/sites/sectionProps"
import { formatMoney, priceReceipt } from "@/lib/sites/saleMath"

//============================================================
// The shop island: product cards with quantity steppers, a cart
// bar that follows the customer on mobile, and a short order
// form. No card entry — the business confirms and takes payment
// its own way. Styled with --t-* tokens only.
//============================================================

export type ShopSettings = {
    allowPickup: boolean
    allowDelivery: boolean
    deliveryNote: string
    orderNote: string
}

const field: React.CSSProperties = { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }
const fieldClass = "w-full rounded-[var(--t-radius)] px-3 py-2.5 text-[length:var(--t-text-m)]"
const primary: React.CSSProperties = { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }

function Stepper({ qty, max, onChange, disabled }: { qty: number; max: number | null; onChange: (next: number) => void; disabled: boolean }) {
    const atMax = max !== null && qty >= max
    if (qty === 0) {
        return (
            <button
                type="button" disabled={disabled}
                onClick={() => onChange(1)}
                className="w-full rounded-[var(--t-radius)] px-4 py-2.5 text-[length:var(--t-text-s)] font-semibold disabled:opacity-50"
                style={primary}
            >
                Add
            </button>
        )
    }
    return (
        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-stretch overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-primary)" }}>
            <button type="button" aria-label="Remove one" disabled={disabled} onClick={() => onChange(qty - 1)} className="py-2 text-[length:var(--t-text-m)] font-bold" style={primary}>−</button>
            <span className="grid place-items-center text-[length:var(--t-text-m)] font-semibold tabular-nums text-[var(--t-text)]">{qty}</span>
            <button type="button" aria-label="Add one" disabled={disabled || atMax} onClick={() => onChange(qty + 1)} className="py-2 text-[length:var(--t-text-m)] font-bold disabled:opacity-40" style={primary}>+</button>
        </div>
    )
}

export default function ShopOrderForm({ slug, businessName, products, settings, preview }: {
    slug: string
    businessName: string
    products: ProductLite[]
    settings: ShopSettings
    preview: boolean
}) {
    const [cart, cartSet] = useState<Record<string, number>>({})
    const [reviewing, reviewingSet] = useState(false)
    const [fulfillment, fulfillmentSet] = useState<"pickup" | "delivery">(settings.allowPickup ? "pickup" : "delivery")
    const [customerName, customerNameSet] = useState("")
    const [customerPhone, customerPhoneSet] = useState("")
    const [customerEmail, customerEmailSet] = useState("")
    const [address, addressSet] = useState("")
    const [note, noteSet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "error">("idle")
    const [errorText, errorTextSet] = useState("")
    const [placed, placedSet] = useState<{ ref: string; totalCents: number; whatsappUrl: string | null; emailed: boolean } | null>(null)

    const lines = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0).map(([productId, qty]) => ({ productId, qty })), [cart])
    const priced = useMemo(() => priceReceipt(products, lines, 0), [products, lines])
    const receipt = priced.ok ? priced.receipt : null
    const itemCount = lines.reduce((sum, line) => sum + line.qty, 0)

    const setQty = (productId: string, qty: number) => cartSet(prev => {
        const next = { ...prev }
        if (qty <= 0) delete next[productId]
        else next[productId] = qty
        return next
    })

    const submit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (preview || status === "sending" || lines.length === 0) return
        statusSet("sending")
        errorTextSet("")
        try {
            const result = await placeOrder({ slug, items: lines, fulfillment, customerName, customerPhone, customerEmail, address, note })
            placedSet({ ref: result.ref, totalCents: result.totalCents, whatsappUrl: result.whatsappUrl, emailed: result.emailed })
            cartSet({})
            reviewingSet(false)
            statusSet("idle")
        } catch (error) {
            statusSet("error")
            errorTextSet(error instanceof Error ? error.message : "something went wrong")
        }
    }

    if (placed !== null) {
        return (
            <div className="grid justify-items-center gap-3 rounded-[var(--t-radius)] p-6 text-center" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <p className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Order {placed.ref} received ✓</p>
                <p className="max-w-md text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                    {formatMoney(placed.totalCents)} · {businessName} will confirm {placed.emailed ? "by email or WhatsApp" : "by phone or WhatsApp"} shortly.
                </p>
                {placed.whatsappUrl !== null && (
                    <a href={placed.whatsappUrl} target="_blank" rel="noreferrer" className="rounded-[var(--t-radius)] px-5 py-3 font-semibold" style={primary}>
                        Send the order on WhatsApp
                    </a>
                )}
                <button type="button" onClick={() => placedSet(null)} className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">
                    Place another order
                </button>
            </div>
        )
    }

    return (
        <div className="grid gap-[calc(var(--t-space)*1.5)]">
            {/* products */}
            <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                {products.map(product => {
                    const soldOut = product.trackStock && product.stock <= 0
                    const qty = cart[product.id] ?? 0
                    return (
                        <li key={product.id} className="grid content-start gap-2 overflow-hidden rounded-[var(--t-radius)]" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                            {product.imageSrc !== "" && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageSrc} alt={product.name} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                            )}
                            <div className="grid gap-2 p-[calc(var(--t-space)*1.25)]">
                                <div className="flex items-baseline justify-between gap-3">
                                    <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{product.name}</h3>
                                    <p className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{formatMoney(product.priceCents)}</p>
                                </div>
                                {product.description !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{product.description}</p>}
                                {product.trackStock && product.stock > 0 && product.stock <= 3 && (
                                    <p className="text-[length:var(--t-text-s)] font-semibold" style={{ color: "var(--t-accent)" }}>Only {product.stock} left</p>
                                )}
                                {soldOut ? (
                                    <p className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Sold out</p>
                                ) : (
                                    <Stepper qty={qty} max={product.trackStock ? product.stock : null} disabled={preview} onChange={next => setQty(product.id, next)} />
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>

            {/* cart bar — sticks to the bottom on phones so the order is always one tap away */}
            {itemCount > 0 && !reviewing && (
                <div className="sticky bottom-3 z-30 flex items-center justify-between gap-3 rounded-[var(--t-radius)] p-3 shadow-lg" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                    <p className="grid text-[var(--t-text)]">
                        <span className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                        <span className="font-semibold">{receipt !== null ? formatMoney(receipt.totalCents) : "—"}</span>
                    </p>
                    <button type="button" onClick={() => reviewingSet(true)} className="rounded-[var(--t-radius)] px-5 py-2.5 font-semibold" style={primary}>
                        Review order →
                    </button>
                </div>
            )}

            {/* the order form */}
            {itemCount > 0 && reviewing && receipt !== null && (
                <form onSubmit={submit} className="grid gap-4 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                    <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Your order</h3>
                        <button type="button" onClick={() => reviewingSet(false)} className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">← Keep shopping</button>
                    </div>

                    <ul className="grid gap-1.5 text-[length:var(--t-text-s)] text-[var(--t-text)]">
                        {receipt.lines.map(line => (
                            <li key={line.productId} className="flex items-baseline justify-between gap-3">
                                <span>{line.qty}× {line.name}</span>
                                <span className="tabular-nums">{formatMoney(line.unitPriceCents * line.qty)}</span>
                            </li>
                        ))}
                        {receipt.taxCents > 0 && (
                            <li className="flex items-baseline justify-between gap-3 text-[var(--t-text-muted)]"><span>Tax</span><span className="tabular-nums">{formatMoney(receipt.taxCents)}</span></li>
                        )}
                        <li className="flex items-baseline justify-between gap-3 border-t pt-1.5 font-semibold" style={{ borderColor: "var(--t-border)" }}>
                            <span>Total</span><span className="tabular-nums">{formatMoney(receipt.totalCents)}</span>
                        </li>
                    </ul>

                    {settings.allowPickup && settings.allowDelivery && (
                        <div className="grid grid-cols-2 gap-2">
                            {(["pickup", "delivery"] as const).map(option => (
                                <button
                                    key={option} type="button" onClick={() => fulfillmentSet(option)} aria-pressed={fulfillment === option}
                                    className="rounded-[var(--t-radius)] px-3 py-2.5 text-[length:var(--t-text-s)] font-semibold"
                                    style={fulfillment === option ? primary : field}
                                >
                                    {option === "pickup" ? "Pickup" : "Delivery"}
                                </button>
                            ))}
                        </div>
                    )}
                    {fulfillment === "delivery" && settings.deliveryNote !== "" && (
                        <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{settings.deliveryNote}</p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <input required placeholder="Your name" autoComplete="name" value={customerName} onChange={e => customerNameSet(e.target.value)} className={fieldClass} style={field} />
                        <input required type="tel" inputMode="tel" placeholder="Phone / WhatsApp" autoComplete="tel" value={customerPhone} onChange={e => customerPhoneSet(e.target.value)} className={fieldClass} style={field} />
                        <input type="email" inputMode="email" placeholder="Email (optional)" autoComplete="email" value={customerEmail} onChange={e => customerEmailSet(e.target.value)} className={`${fieldClass} sm:col-span-2`} style={field} />
                        {fulfillment === "delivery" && (
                            <input required placeholder="Delivery address" autoComplete="street-address" value={address} onChange={e => addressSet(e.target.value)} className={`${fieldClass} sm:col-span-2`} style={field} />
                        )}
                        <textarea rows={2} placeholder="Anything we should know? (optional)" value={note} onChange={e => noteSet(e.target.value)} className={`${fieldClass} sm:col-span-2`} style={field} />
                    </div>

                    {settings.orderNote !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{settings.orderNote}</p>}

                    {status === "error" && <p className="text-[length:var(--t-text-s)] font-semibold" style={{ color: "var(--t-accent)" }}>{errorText}</p>}

                    <button type="submit" disabled={preview || status === "sending"} className="rounded-[var(--t-radius)] px-5 py-3 font-semibold disabled:opacity-50" style={primary}>
                        {status === "sending" ? "Placing order…" : `Place order · ${formatMoney(receipt.totalCents)}`}
                    </button>
                </form>
            )}
        </div>
    )
}
