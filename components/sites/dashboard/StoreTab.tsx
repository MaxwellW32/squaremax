"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { addProduct, deleteProduct, getProducts, getSales, getSalesSummary, recordSale, updateProduct } from "@/serverFunctions/handleInventory"

//============================================================
// Store & inventory add-on tab: product list with stock + tax,
// a quick "record sale" counter flow, and the month-to-date
// numbers (revenue, tax collected, top items, low stock).
//============================================================

export type ProductRow = {
    id: string
    name: string
    description: string
    priceCents: number
    taxRateBps: number
    stock: number
    trackStock: boolean
    imageSrc: string
    active: boolean
}

export type SaleRow = {
    id: string
    items: { productId: string; name: string; qty: number; unitPriceCents: number; taxCents: number }[]
    subtotalCents: number
    taxCents: number
    totalCents: number
    customerName: string
    note: string
    createdAt: Date | string
}

export type SalesSummary = {
    receipts: number
    revenueCents: number
    taxCents: number
    topItems: { name: string; qty: number; revenueCents: number }[]
    lowStock: { id: string; name: string; stock: number }[]
}

const input = "rounded-md border border-line bg-surface px-3 py-2 text-sm font-normal"
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`

const emptyProductForm = { name: "", description: "", price: "", taxPct: "", stock: "0", trackStock: true, imageSrc: "" }

export default function StoreTab(props: {
    tenantId: string
    enabled: boolean
    initialProducts: ProductRow[]
    initialSales: SaleRow[]
    initialSummary: SalesSummary | null
}) {
    const [products, productsSet] = useState<ProductRow[]>(props.initialProducts)
    const [sales, salesSet] = useState<SaleRow[]>(props.initialSales)
    const [summary, summarySet] = useState<SalesSummary | null>(props.initialSummary)
    const [busy, busySet] = useState(false)

    const [form, formSet] = useState(emptyProductForm)
    const [editingId, editingIdSet] = useState<string | null>(null)

    //record-sale cart: productId -> qty
    const [cart, cartSet] = useState<Record<string, number>>({})
    const [saleCustomer, saleCustomerSet] = useState("")

    const run = async (work: () => Promise<unknown>, success?: string) => {
        if (busy) return
        busySet(true)
        try {
            await work()
            if (success !== undefined) toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    const refreshAll = async () => {
        const [nextProducts, nextSales, nextSummary] = await Promise.all([
            getProducts(props.tenantId), getSales(props.tenantId, 50), getSalesSummary(props.tenantId),
        ])
        productsSet(nextProducts)
        salesSet(nextSales)
        summarySet(nextSummary)
    }

    if (!props.enabled) {
        return (
            <p className="max-w-xl rounded-lg border border-line bg-surface p-5 text-sm text-mist">
                The <strong>Store &amp; inventory</strong> add-on tracks products, stock and taxes, records sales,
                and can show a shop section on your site. Turn it on in the Add-ons tab — $5/month.
            </p>
        )
    }

    const submitProduct = () => run(async () => {
        const priceCents = Math.round(Number(form.price) * 100)
        const taxRateBps = Math.round(Number(form.taxPct || "0") * 100)
        const stock = Math.round(Number(form.stock) || 0)
        if (form.name.trim() === "") throw new Error("name the product")
        if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("price must be a number")

        const payload = {
            name: form.name.trim(), description: form.description, priceCents,
            taxRateBps: Number.isFinite(taxRateBps) ? taxRateBps : 0,
            stock, trackStock: form.trackStock, imageSrc: form.imageSrc, active: true,
        }
        if (editingId === null) await addProduct(props.tenantId, payload)
        else await updateProduct(props.tenantId, editingId, payload)

        formSet(emptyProductForm)
        editingIdSet(null)
        await refreshAll()
    }, editingId === null ? "Product added" : "Product updated")

    const cartLines = Object.entries(cart).filter(([, qty]) => qty > 0)
    const cartTotalCents = cartLines.reduce((sum, [productId, qty]) => {
        const product = products.find(candidate => candidate.id === productId)
        if (product === undefined) return sum
        const lineSubtotal = product.priceCents * qty
        return sum + lineSubtotal + Math.round(lineSubtotal * product.taxRateBps / 10_000)
    }, 0)

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid content-start gap-5">
                {/* month-to-date */}
                {summary !== null && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-line bg-surface p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">This month</p>
                            <p className="font-display text-2xl font-bold">{money(summary.revenueCents)}</p>
                            <p className="text-xs text-mist">{summary.receipts} sale{summary.receipts === 1 ? "" : "s"}</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">Tax collected</p>
                            <p className="font-display text-2xl font-bold">{money(summary.taxCents)}</p>
                            <p className="text-xs text-mist">set aside for filing</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">Low stock</p>
                            {summary.lowStock.length === 0
                                ? <p className="text-sm text-mist">All good ✓</p>
                                : summary.lowStock.slice(0, 3).map(item => (
                                    <p key={item.id} className="text-sm"><span className="font-semibold">{item.name}</span> — {item.stock} left</p>
                                ))}
                        </div>
                    </div>
                )}

                {/* product form */}
                <div className="grid gap-3 rounded-xl border border-line bg-surface p-4">
                    <p className="font-display font-bold">{editingId === null ? "Add a product" : "Edit product"}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <input className={input} placeholder="Product name" value={form.name} onChange={e => formSet({ ...form, name: e.target.value })} />
                        <input className={input} placeholder="Image URL (optional)" value={form.imageSrc} onChange={e => formSet({ ...form, imageSrc: e.target.value })} />
                    </div>
                    <input className={input} placeholder="Short description (optional)" value={form.description} onChange={e => formSet({ ...form, description: e.target.value })} />
                    <div className="grid gap-2 sm:grid-cols-3">
                        <label className="grid gap-1 text-xs font-semibold">Price ($)
                            <input className={input} type="number" min={0} step="0.01" value={form.price} onChange={e => formSet({ ...form, price: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold">Tax rate (%)
                            <input className={input} type="number" min={0} step="0.5" value={form.taxPct} onChange={e => formSet({ ...form, taxPct: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold">Stock on hand
                            <input className={input} type="number" min={0} step={1} value={form.stock} onChange={e => formSet({ ...form, stock: e.target.value })} />
                        </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="size-4 accent-cobalt" checked={form.trackStock} onChange={e => formSet({ ...form, trackStock: e.target.checked })} />
                        Track stock (sales reduce it; sold-out hides the order button)
                    </label>
                    <div className="flex gap-2">
                        <button type="button" disabled={busy} onClick={submitProduct}
                            className="rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            {editingId === null ? "Add product" : "Save changes"}
                        </button>
                        {editingId !== null && (
                            <button type="button" className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-mist"
                                onClick={() => { editingIdSet(null); formSet(emptyProductForm) }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* product list */}
                <div className="grid gap-2">
                    {products.length === 0 && <p className="text-sm text-mist">No products yet — add your first one above.</p>}
                    {products.map(product => (
                        <div key={product.id} className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${product.active ? "border-line bg-surface" : "border-line bg-surface/50 opacity-60"}`}>
                            <div className="grid grow gap-0.5">
                                <p className="text-sm font-semibold">{product.name} <span className="font-normal text-cobalt">{money(product.priceCents)}</span>
                                    {product.taxRateBps > 0 && <span className="ml-1 text-xs text-mist">+{(product.taxRateBps / 100).toFixed(1)}% tax</span>}
                                </p>
                                <p className="text-xs text-mist">
                                    {product.trackStock ? `${product.stock} in stock` : "stock not tracked"}
                                    {!product.active ? " · hidden from site" : ""}
                                </p>
                            </div>
                            <button type="button" className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:text-ink"
                                onClick={() => {
                                    editingIdSet(product.id)
                                    formSet({
                                        name: product.name, description: product.description,
                                        price: (product.priceCents / 100).toFixed(2), taxPct: (product.taxRateBps / 100).toString(),
                                        stock: String(product.stock), trackStock: product.trackStock, imageSrc: product.imageSrc,
                                    })
                                }}>
                                Edit
                            </button>
                            <button type="button" disabled={busy} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:text-ink"
                                onClick={() => run(async () => {
                                    await updateProduct(props.tenantId, product.id, {
                                        name: product.name, description: product.description, priceCents: product.priceCents,
                                        taxRateBps: product.taxRateBps, stock: product.stock, trackStock: product.trackStock,
                                        imageSrc: product.imageSrc, active: !product.active,
                                    })
                                    await refreshAll()
                                }, product.active ? "Hidden from site" : "Shown on site")}>
                                {product.active ? "Hide" : "Show"}
                            </button>
                            <button type="button" disabled={busy} className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:text-brand"
                                onClick={() => {
                                    if (!window.confirm(`Delete ${product.name}? Past sales keep their records.`)) return
                                    run(async () => { await deleteProduct(props.tenantId, product.id); await refreshAll() }, "Deleted")
                                }}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* right rail: record a sale + recent sales */}
            <div className="grid h-fit content-start gap-4">
                <div className="grid gap-3 rounded-xl border border-line bg-surface p-4">
                    <p className="font-display font-bold">Record a sale</p>
                    {products.filter(product => product.active).map(product => (
                        <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
                            <span>{product.name} <span className="text-xs text-mist">{money(product.priceCents)}</span></span>
                            <input type="number" min={0} max={product.trackStock ? product.stock : undefined} step={1}
                                className="w-16 rounded-md border border-line bg-paper px-2 py-1 text-sm"
                                value={cart[product.id] ?? 0}
                                onChange={e => cartSet({ ...cart, [product.id]: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />
                        </div>
                    ))}
                    <input className={input} placeholder="Customer name (optional)" value={saleCustomer} onChange={e => saleCustomerSet(e.target.value)} />
                    <button type="button" disabled={busy || cartLines.length === 0}
                        className="rounded-lg bg-cobalt px-4 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50"
                        onClick={() => run(async () => {
                            await recordSale(props.tenantId, {
                                items: cartLines.map(([productId, qty]) => ({ productId, qty })),
                                customerName: saleCustomer, customerId: null, note: "",
                            })
                            cartSet({})
                            saleCustomerSet("")
                            await refreshAll()
                        }, "Sale recorded")}>
                        Record {cartLines.length > 0 ? `— ${money(cartTotalCents)}` : "sale"}
                    </button>
                </div>

                <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist">Recent sales</p>
                    {sales.length === 0 && <p className="text-sm text-mist">Nothing yet.</p>}
                    {sales.slice(0, 12).map(sale => (
                        <div key={sale.id} className="grid gap-0.5 border-b border-line/60 pb-2 text-sm last:border-b-0">
                            <div className="flex justify-between gap-2">
                                <span className="font-semibold">{money(sale.totalCents)}</span>
                                <span className="text-xs text-mist">{new Date(sale.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                            </div>
                            <p className="text-xs text-mist">
                                {sale.items.map(item => `${item.qty}× ${item.name}`).join(", ")}
                                {sale.customerName !== "" ? ` — ${sale.customerName}` : ""}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
