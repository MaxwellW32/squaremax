import { describe, expect, it } from "vitest"
import { describeProblem, orderRef, priceReceipt, PriceableProduct } from "@/lib/sites/saleMath"

const products: PriceableProduct[] = [
    { id: "sauce", name: "Jerk sauce", priceCents: 899, costCents: 300, taxRateBps: 1500, stock: 10, trackStock: true },
    { id: "rub", name: "Dry rub", priceCents: 650, costCents: 200, taxRateBps: 1500, stock: 2, trackStock: true },
    { id: "tee", name: "T-shirt", priceCents: 2000, costCents: 800, taxRateBps: 0, stock: 0, trackStock: false },
]

describe("priceReceipt", () => {
    it("totals lines with per-line tax and snapshots prices and costs", () => {
        const result = priceReceipt(products, [{ productId: "sauce", qty: 2 }, { productId: "tee", qty: 1 }])
        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.receipt.subtotalCents).toBe(899 * 2 + 2000)
        expect(result.receipt.taxCents).toBe(Math.round(899 * 2 * 0.15))
        expect(result.receipt.totalCents).toBe(result.receipt.subtotalCents + result.receipt.taxCents)
        expect(result.receipt.lines[0]).toMatchObject({ productId: "sauce", qty: 2, unitPriceCents: 899, unitCostCents: 300 })
    })

    it("caps the discount at the subtotal and taxes the discounted amount", () => {
        const result = priceReceipt(products, [{ productId: "sauce", qty: 1 }], 5000)
        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.receipt.discountCents).toBe(899)
        expect(result.receipt.taxCents).toBe(0)
        expect(result.receipt.totalCents).toBe(0)
    })

    it("apportions a discount across lines in proportion to their subtotal", () => {
        //sauce 899 + tee 2000 = 2899; $10 off → sauce gets 310, tee gets 690
        const result = priceReceipt(products, [{ productId: "sauce", qty: 1 }, { productId: "tee", qty: 1 }], 1000)
        expect(result.ok).toBe(true)
        if (!result.ok) return
        const sauceTax = Math.round((899 - Math.round(1000 * 899 / 2899)) * 0.15)
        expect(result.receipt.lines.find(line => line.productId === "sauce")?.taxCents).toBe(sauceTax)
        expect(result.receipt.totalCents).toBe(2899 - 1000 + sauceTax)
    })

    it("merges duplicate lines before checking stock", () => {
        const result = priceReceipt(products, [{ productId: "rub", qty: 1 }, { productId: "rub", qty: 2 }])
        expect(result.ok).toBe(false)
        if (result.ok) return
        expect(result.problem).toMatchObject({ kind: "out-of-stock", productId: "rub", available: 2, wanted: 3 })
        expect(describeProblem(result.problem)).toContain("Dry rub")
    })

    it("ignores stock when the product doesn't track it", () => {
        const result = priceReceipt(products, [{ productId: "tee", qty: 25 }])
        expect(result.ok).toBe(true)
    })

    it("rejects unknown products and skips zero quantities", () => {
        expect(priceReceipt(products, [{ productId: "ghost", qty: 1 }]).ok).toBe(false)
        const result = priceReceipt(products, [{ productId: "sauce", qty: 0 }])
        expect(result.ok && result.receipt.lines).toEqual([])
    })
})

describe("orderRef", () => {
    it("makes a short uppercase reference from a uuid", () => {
        expect(orderRef("7f3a2c10-1234-5678-9abc-def012345678")).toBe("#7F3A2C")
    })
})
