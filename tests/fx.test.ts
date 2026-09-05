import { describe, expect, it } from "vitest"
import { chargeRateFromMid, isSaneJmdRate, usdCentsToJmdCents } from "@/lib/payments/fxMath"

describe("USD→JMD charge rate", () => {
    it("adds the margin and rounds UP to a whole J$ per US$1", () => {
        expect(chargeRateFromMid(157.3, 3)).toBe(163) //157.3 × 1.03 = 162.02 → 163
        expect(chargeRateFromMid(160, 0)).toBe(160)
        expect(chargeRateFromMid(160.01, 0)).toBe(161)
    })

    it("rejects broken feeds", () => {
        expect(isSaneJmdRate(157.3)).toBe(true)
        expect(isSaneJmdRate(0)).toBe(false)
        expect(isSaneJmdRate(Number.NaN)).toBe(false)
        expect(isSaneJmdRate(15)).toBe(false) //a USD→EUR-shaped number, not JMD
        expect(isSaneJmdRate(5000)).toBe(false)
    })

    it("converts list-price cents to JMD cents", () => {
        expect(usdCentsToJmdCents(1000, 160)).toBe(160000) //US$10 → J$1,600.00
        expect(usdCentsToJmdCents(1500, 163)).toBe(244500) //US$15 → J$2,445.00
    })
})
