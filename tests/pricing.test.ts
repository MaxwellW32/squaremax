import { describe, expect, it } from "vitest"
import { computeQuote, computeSubtotal, deriveTier, tierPresets, services, ServiceId } from "@/lib/pricing/catalog"

describe("tier band mapping", () => {
    it("maps subtotal of exactly $2,500 to Launch", () => {
        expect(deriveTier(2500).id).toBe("launch")
    })

    it("maps $2,501 to Business", () => {
        expect(deriveTier(2501).id).toBe("business")
    })

    it("maps exactly $5,000 to Business", () => {
        expect(deriveTier(5000).id).toBe("business")
    })

    it("maps $5,001 to Pro", () => {
        expect(deriveTier(5001).id).toBe("pro")
    })

    it("maps $0 and tiny subtotals to Launch", () => {
        expect(deriveTier(0).id).toBe("launch")
        expect(deriveTier(150).id).toBe("launch")
    })
})

describe("discount math", () => {
    it("discount = max(0, subtotal - tierPrice)", () => {
        //launch preset sits exactly on the band edge: 1500+250+200+250+300 = 2500
        const quote = computeQuote(tierPresets.launch)
        expect(quote.subtotal).toBe(2500)
        expect(quote.tierId).toBe("launch")
        expect(quote.tierPrice).toBe(1000)
        expect(quote.discount).toBe(1500)
    })

    it("never produces a negative discount when subtotal < tier price", () => {
        //design alone: 1500 -> launch tier 1000 flat -> discount 500
        //single small service: forms 200 -> launch 1000 flat, subtotal BELOW price
        const quote = computeQuote(["forms"])
        expect(quote.subtotal).toBe(200)
        expect(quote.discount).toBe(0)
        expect(quote.tierPrice).toBe(1000)
    })

    it("dedupes repeated selections before pricing", () => {
        const quote = computeQuote(["design", "design", "forms"] as ServiceId[])
        expect(quote.subtotal).toBe(1700)
    })

    it("business preset lands in the business band", () => {
        const quote = computeQuote(tierPresets.business)
        expect(quote.subtotal).toBe(4500)
        expect(quote.tierId).toBe("business")
        expect(quote.discount).toBe(1000)
    })

    it("pro preset lands in the pro band with a non-negative discount", () => {
        const quote = computeQuote(tierPresets.pro)
        expect(quote.subtotal).toBe(6550)
        expect(quote.tierId).toBe("pro")
        expect(quote.discount).toBe(50)
    })

    it("selecting every service prices consistently", () => {
        const allIds = services.map(service => service.id)
        const quote = computeQuote(allIds)
        expect(quote.subtotal).toBe(computeSubtotal(allIds))
        expect(quote.tierId).toBe("pro")
        expect(quote.discount).toBe(quote.subtotal - 6500)
    })

    it("rejects unknown service ids", () => {
        expect(() => computeQuote(["not-a-service"] as unknown as ServiceId[])).toThrow()
    })
})
