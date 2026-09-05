import { describe, expect, it } from "vitest"
import {
    MAX_MONTHS_AHEAD, PERIOD_DAYS, checkoutAmountCents, daysRemaining,
    monthChoices, periodEndAfter, planLines,
} from "@/lib/sites/billing"
import { BASE_MONTHLY_PRICE } from "@/lib/sites/addons"
import { effectiveStatus } from "@/lib/sites/status"

const days = (count: number) => count * 24 * 60 * 60 * 1000
const now = new Date("2026-06-01T12:00:00.000Z")

describe("prepaid subscription math", () => {
    it("charges months × the monthly price, in cents", () => {
        expect(checkoutAmountCents([], 1)).toBe(BASE_MONTHLY_PRICE * 100)
        //a year is charged as ten months (2 free)
        expect(checkoutAmountCents([], 12)).toBe(BASE_MONTHLY_PRICE * 100 * 10)
        //booking + notifications = the $15 service bundle, three months = $45.00
        expect(checkoutAmountCents(["booking", "notifications"], 3)).toBe(4500)
    })

    it("prices unknown add-on ids on old rows at zero instead of NaN", () => {
        expect(checkoutAmountCents(["nope" as never], 1)).toBe(BASE_MONTHLY_PRICE * 100)
    })

    it("stacks new months on top of unexpired time — paying early never burns days", () => {
        const end = new Date(now.getTime() + days(10))
        expect(periodEndAfter(end, 1, now).getTime()).toBe(end.getTime() + days(PERIOD_DAYS))
        expect(periodEndAfter(end, 6, now).getTime()).toBe(end.getTime() + days(6 * PERIOD_DAYS))
    })

    it("restarts from now once the period has lapsed", () => {
        const lapsed = new Date(now.getTime() - days(40))
        expect(periodEndAfter(lapsed, 1, now).getTime()).toBe(now.getTime() + days(PERIOD_DAYS))
        expect(periodEndAfter(null, 1, now).getTime()).toBe(now.getTime() + days(PERIOD_DAYS))
    })

    it("normalizes ISO strings — unstable_cache serializes Date columns", () => {
        const end = new Date(now.getTime() + days(10))
        expect(periodEndAfter(end.toISOString(), 1, now).getTime()).toBe(periodEndAfter(end, 1, now).getTime())
        expect(daysRemaining(end.toISOString(), now)).toBe(10)
    })

    it("a 12-month payment buys 360 days of cover, not 30", () => {
        expect(daysRemaining(periodEndAfter(null, 12, now), now)).toBe(12 * PERIOD_DAYS)

        //paid a year ago: one month would have lapsed long since, twelve still holds
        const lastYear = new Date(Date.now() - days(300))
        expect(effectiveStatus({ status: "live", currentPeriodEnd: periodEndAfter(null, 1, lastYear) })).toBe("suspended")
        expect(effectiveStatus({ status: "live", currentPeriodEnd: periodEndAfter(null, 12, lastYear) })).toBe("active")
    })

    it("days remaining floors at zero and never goes negative", () => {
        expect(daysRemaining(null, now)).toBe(0)
        expect(daysRemaining(new Date(now.getTime() - days(5)), now)).toBe(0)
        expect(daysRemaining("not a date", now)).toBe(0)
    })

    it("every offered duration is within what the server accepts", () => {
        for (const choice of monthChoices) {
            expect(choice).toBeGreaterThanOrEqual(1)
            expect(choice).toBeLessThanOrEqual(MAX_MONTHS_AHEAD)
        }
    })
})

describe("plan breakdown shown to the client", () => {
    it("leads with the base website line, then one line per add-on", () => {
        const lines = planLines(["booking", "inventory"])
        expect(lines).toHaveLength(3)
        expect(lines[0].monthlyPrice).toBe(BASE_MONTHLY_PRICE)
        expect(lines.map(line => line.monthlyPrice).reduce((sum, price) => sum + price, 0)).toBe(20)
    })

    it("skips retired add-on ids rather than rendering a blank row", () => {
        expect(planLines(["gone" as never])).toHaveLength(1)
    })
})
