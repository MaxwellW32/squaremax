//============================================================
// Pure receipt math shared by counter sales, online orders and
// the dashboard cart preview, so every total agrees to the cent.
//
//  - money is integer cents, tax rate is basis points (1500 = 15%)
//  - a receipt-level discount is capped at the subtotal and
//    apportioned across lines in proportion to their subtotal
//  - tax is computed per line on the DISCOUNTED amount
//============================================================

export type PriceableProduct = {
    id: string
    name: string
    priceCents: number
    costCents?: number
    taxRateBps: number
    stock: number
    trackStock: boolean
}

export type LineRequest = { productId: string; qty: number }

export type PricedLine = {
    productId: string
    name: string
    qty: number
    unitPriceCents: number
    unitCostCents: number
    taxCents: number
}

export type PricedReceipt = {
    lines: PricedLine[]
    subtotalCents: number
    discountCents: number //the applied (capped) discount
    taxCents: number
    totalCents: number
}

export type PricingProblem =
    | { kind: "unknown-product"; productId: string }
    | { kind: "out-of-stock"; productId: string; name: string; available: number; wanted: number }

export function priceReceipt(
    products: PriceableProduct[],
    requested: LineRequest[],
    discountCentsRaw: number = 0,
): { ok: true; receipt: PricedReceipt } | { ok: false; problem: PricingProblem } {
    const byId = new Map(products.map(product => [product.id, product]))

    //merge duplicate lines so stock checks see the true quantity
    const wanted = new Map<string, number>()
    for (const line of requested) {
        if (line.qty <= 0) continue
        wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + line.qty)
    }

    //pass 1: subtotal (to cap + apportion the discount)
    let subtotalCents = 0
    for (const [productId, qty] of wanted) {
        const product = byId.get(productId)
        if (product === undefined) return { ok: false, problem: { kind: "unknown-product", productId } }
        if (product.trackStock && product.stock < qty) {
            return { ok: false, problem: { kind: "out-of-stock", productId, name: product.name, available: product.stock, wanted: qty } }
        }
        subtotalCents += product.priceCents * qty
    }

    const discountCents = Math.min(Math.max(0, Math.round(discountCentsRaw)), subtotalCents)

    //pass 2: per-line tax on the discounted amount
    const lines: PricedLine[] = []
    let taxCents = 0
    for (const [productId, qty] of wanted) {
        const product = byId.get(productId)!
        const lineSubtotal = product.priceCents * qty
        const lineDiscounted = subtotalCents === 0 ? 0 : lineSubtotal - Math.round(discountCents * lineSubtotal / subtotalCents)
        const lineTax = Math.round(lineDiscounted * product.taxRateBps / 10_000)
        taxCents += lineTax
        lines.push({
            productId: product.id,
            name: product.name,
            qty,
            unitPriceCents: product.priceCents,
            unitCostCents: product.costCents ?? 0,
            taxCents: lineTax,
        })
    }

    return {
        ok: true,
        receipt: { lines, subtotalCents, discountCents, taxCents, totalCents: subtotalCents - discountCents + taxCents },
    }
}

export function describeProblem(problem: PricingProblem): string {
    if (problem.kind === "unknown-product") return "one of those products is no longer available"
    return `not enough stock for ${problem.name} (${problem.available} left)`
}

//short human order reference from a uuid: "#7F3A2C"
export function orderRef(id: string): string {
    return `#${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

export function formatMoney(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}
