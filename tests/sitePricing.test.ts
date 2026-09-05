import { describe, expect, it } from "vitest"
import {
    ADDON_MONTHLY_PRICE, BASE_MONTHLY_PRICE, addonsForBundle, bundles, itemizedMonthly, monthlyTotal, priceQuote,
} from "@/lib/sites/addons"
import { FREE_MONTHS_PER_YEAR, chargeableMonths, checkoutAmountCents, freeMonthsFor, planLines } from "@/lib/sites/billing"

//============================================================
// Squaremax Sites list pricing: $10 base, $5 add-ons, bundles
// auto-applied, annual prepay gets 2 months free.
//============================================================

describe("list prices", () => {
    it("base is $10 and add-ons are $5", () => {
        expect(BASE_MONTHLY_PRICE).toBe(10)
        expect(ADDON_MONTHLY_PRICE).toBe(5)
        expect(monthlyTotal([])).toBe(10)
        expect(monthlyTotal(["custom-domain"])).toBe(15)
    })

    it("every bundle is cheaper than its add-ons à la carte", () => {
        for (const bundle of bundles) {
            expect(bundle.monthlyPrice).toBeLessThan(itemizedMonthly(bundle.addons))
        }
    })
})

describe("bundles apply themselves", () => {
    it("website + booking + notifications is the $15 service bundle", () => {
        const quote = priceQuote(["booking", "notifications"])
        expect(quote.monthly).toBe(15)
        expect(quote.itemized).toBe(20)
        expect(quote.savings).toBe(5)
        expect(quote.bundle?.id).toBe("service")
        expect(quote.extras).toEqual([])
    })

    it("all four add-ons is the $20 storefront bundle", () => {
        const quote = priceQuote(["booking", "notifications", "inventory", "custom-domain"])
        expect(quote.monthly).toBe(20)
        expect(quote.itemized).toBe(30)
        expect(quote.bundle?.id).toBe("storefront")
    })

    it("a bundle plus an extra add-on charges the extra on top", () => {
        const quote = priceQuote(["booking", "notifications", "inventory"])
        expect(quote.monthly).toBe(20) //service bundle $15 + store $5
        expect(quote.bundle?.id).toBe("service")
        expect(quote.extras).toEqual(["inventory"])
    })

    it("add-ons that don't complete a bundle stay à la carte", () => {
        const quote = priceQuote(["booking", "inventory"])
        expect(quote.monthly).toBe(20)
        expect(quote.bundle).toBeNull()
        expect(quote.savings).toBe(0)
    })

    it("order and duplicates never change the price", () => {
        expect(monthlyTotal(["notifications", "booking", "booking"])).toBe(15)
    })

    it("tolerates retired add-on ids from old tenant rows", () => {
        expect(monthlyTotal(["booking", "email-notifications" as never])).toBe(15)
    })

    it("addonsForBundle returns a fresh copy of the bundle's add-ons", () => {
        const picked = addonsForBundle("service")
        picked.push("inventory")
        expect(addonsForBundle("service")).toEqual(["booking", "notifications"])
    })
})

describe("annual prepay", () => {
    it("charges 10 months for 12, 20 for 24, and full price below a year", () => {
        expect(FREE_MONTHS_PER_YEAR).toBe(2)
        expect(chargeableMonths(1)).toBe(1)
        expect(chargeableMonths(6)).toBe(6)
        expect(chargeableMonths(11)).toBe(11)
        expect(chargeableMonths(12)).toBe(10)
        expect(chargeableMonths(24)).toBe(20)
        expect(freeMonthsFor(12)).toBe(2)
    })

    it("checkout amount reflects the discount", () => {
        expect(checkoutAmountCents([], 12)).toBe(BASE_MONTHLY_PRICE * 100 * 10)
        expect(checkoutAmountCents(["booking", "notifications"], 12)).toBe(15 * 100 * 10)
        expect(checkoutAmountCents(["booking", "notifications"], 3)).toBe(15 * 100 * 3)
    })
})

describe("plan lines shown to the client", () => {
    it("shows a single bundle line plus extras when a bundle applies", () => {
        const lines = planLines(["booking", "notifications", "inventory"])
        expect(lines).toHaveLength(2)
        expect(lines[0].label).toContain("Service bundle")
        expect(lines[0].monthlyPrice).toBe(15)
        expect(lines[1].label).toContain("store")
        expect(lines.reduce((sum, line) => sum + line.monthlyPrice, 0)).toBe(20)
    })

    it("falls back to base + one line per add-on", () => {
        const lines = planLines(["booking", "inventory"])
        expect(lines).toHaveLength(3)
        expect(lines[0].monthlyPrice).toBe(BASE_MONTHLY_PRICE)
    })
})
