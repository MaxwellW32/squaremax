import { describe, expect, it } from "vitest"
import { effectiveStatus, isPubliclyVisible, GRACE_DAYS } from "@/lib/sites/status"

const days = (count: number) => count * 24 * 60 * 60 * 1000

describe("effective tenant status (computed, no cron)", () => {
    it("draft stays draft regardless of period", () => {
        expect(effectiveStatus({ status: "draft", currentPeriodEnd: new Date(Date.now() + days(10)) })).toBe("draft")
    })

    it("live + future period end = active", () => {
        expect(effectiveStatus({ status: "live", currentPeriodEnd: new Date(Date.now() + days(1)) })).toBe("active")
    })

    it("live + lapsed within grace = grace (page stays up)", () => {
        const status = effectiveStatus({ status: "live", currentPeriodEnd: new Date(Date.now() - days(GRACE_DAYS - 1)) })
        expect(status).toBe("grace")
        expect(isPubliclyVisible(status)).toBe(true)
    })

    it("live + lapsed past grace = suspended (paused page)", () => {
        const status = effectiveStatus({ status: "live", currentPeriodEnd: new Date(Date.now() - days(GRACE_DAYS + 1)) })
        expect(status).toBe("suspended")
        expect(isPubliclyVisible(status)).toBe(false)
    })

    it("live with no period at all = suspended", () => {
        expect(effectiveStatus({ status: "live", currentPeriodEnd: null })).toBe("suspended")
    })

    it("cancelled is never publicly visible", () => {
        const status = effectiveStatus({ status: "cancelled", currentPeriodEnd: new Date(Date.now() + days(10)) })
        expect(status).toBe("cancelled")
        expect(isPubliclyVisible(status)).toBe(false)
    })
})
