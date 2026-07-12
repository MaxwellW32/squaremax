import { describe, expect, it } from "vitest"
import { businessDayAnchor, businessDateISO, computeSlots, rangesOverlap, BUSINESS_TZ } from "@/lib/sites/bookingLogic"

//2026-07-15 is a Wednesday; anchor = business-local (Jamaica, UTC-5) midnight
const dateISO = "2026-07-15"
const { dayStart } = businessDayAnchor(dateISO)
const past = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000) //"now" the day before

const rules = [{ dayOfWeek: 3, openTime: "09:00", closeTime: "12:00", slotMinutes: 30 }]

//instant at HH:MM business-local time on the target day
function slotAt(hours: number, minutes: number): Date {
    return new Date(dayStart.getTime() + (hours * 60 + minutes) * 60_000)
}

function label(slot: Date): string {
    return slot.toLocaleTimeString("en-US", { timeZone: BUSINESS_TZ, hour: "numeric", minute: "2-digit" })
}

describe("business-day anchoring", () => {
    it("anchors the calendar day at business-local midnight (UTC-5), not server midnight", () => {
        expect(dayStart.toISOString()).toBe("2026-07-15T05:00:00.000Z")
    })

    it("derives the weekday from the calendar date itself", () => {
        expect(businessDayAnchor("2026-07-15").dayOfWeek).toBe(3) //Wednesday
        expect(businessDayAnchor("2026-07-13").dayOfWeek).toBe(1) //Monday
    })

    it("businessDateISO formats an instant as a Jamaica calendar date", () => {
        //03:00 UTC on the 16th is still 22:00 on the 15th in Jamaica
        expect(businessDateISO(new Date("2026-07-16T03:00:00Z"))).toBe("2026-07-15")
        expect(businessDateISO(new Date("2026-07-16T03:00:00Z"), 1)).toBe("2026-07-16")
    })
})

describe("rangesOverlap", () => {
    it("detects genuine overlap", () => {
        expect(rangesOverlap(slotAt(9, 0), slotAt(9, 30), slotAt(9, 15), slotAt(9, 45))).toBe(true)
    })

    it("back-to-back bookings do not overlap", () => {
        expect(rangesOverlap(slotAt(9, 0), slotAt(9, 30), slotAt(9, 30), slotAt(10, 0))).toBe(false)
    })
})

describe("computeSlots", () => {
    it("generates slots inside opening hours only, in business-local time", () => {
        const slots = computeSlots({ dateISO, rules, existing: [], durationMinutes: 30, now: past })
        expect(slots).toHaveLength(6) //09:00 … 11:30
        expect(label(slots[0])).toBe("9:00 AM")
        expect(label(slots.at(-1)!)).toBe("11:30 AM")
    })

    it("drops slots whose duration would run past close", () => {
        const slots = computeSlots({ dateISO, rules, existing: [], durationMinutes: 45, now: past })
        expect(label(slots.at(-1)!)).toBe("11:00 AM")
    })

    it("excludes conflicting slots", () => {
        const existing = [{ startsAt: slotAt(10, 0), endsAt: slotAt(10, 30) }]
        const slots = computeSlots({ dateISO, rules, existing, durationMinutes: 30, now: past })
        expect(slots.some(slot => slot.getTime() === slotAt(10, 0).getTime())).toBe(false)
        expect(slots).toHaveLength(5)
    })

    it("a longer booking blocks every slot it covers", () => {
        const existing = [{ startsAt: slotAt(9, 30), endsAt: slotAt(11, 0) }]
        const slots = computeSlots({ dateISO, rules, existing, durationMinutes: 30, now: past })
        expect(slots.map(label)).toEqual(["9:00 AM", "11:00 AM", "11:30 AM"])
    })

    it("returns nothing on closed days", () => {
        expect(computeSlots({ dateISO: "2026-07-13", rules, existing: [], durationMinutes: 30, now: past })).toHaveLength(0)
    })

    it("filters out slots in the past", () => {
        const now = slotAt(10, 5)
        const slots = computeSlots({ dateISO, rules, existing: [], durationMinutes: 30, now })
        expect(label(slots[0])).toBe("10:30 AM")
    })

    it("rejects malformed date strings instead of guessing", () => {
        expect(computeSlots({ dateISO: "15-07-2026", rules, existing: [], durationMinutes: 30, now: past })).toHaveLength(0)
    })
})
