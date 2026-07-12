import { describe, expect, it } from "vitest"
import { computeSlots, rangesOverlap } from "@/lib/sites/bookingLogic"

//a Wednesday
const day = new Date("2026-07-15T00:00:00")
const past = new Date("2026-07-14T00:00:00") //"now" before the target day -> no slots filtered by time

const rules = [{ dayOfWeek: 3, openTime: "09:00", closeTime: "12:00", slotMinutes: 30 }]

function slotAt(hours: number, minutes: number): Date {
    const date = new Date(day)
    date.setHours(hours, minutes, 0, 0)
    return date
}

describe("rangesOverlap", () => {
    it("detects genuine overlap", () => {
        expect(rangesOverlap(slotAt(9, 0), slotAt(9, 30), slotAt(9, 15), slotAt(9, 45))).toBe(true)
    })

    it("back-to-back bookings do not overlap", () => {
        expect(rangesOverlap(slotAt(9, 0), slotAt(9, 30), slotAt(9, 30), slotAt(10, 0))).toBe(false)
    })
})

describe("computeSlots", () => {
    it("generates slots inside opening hours only", () => {
        const slots = computeSlots({ date: day, rules, existing: [], durationMinutes: 30, now: past })
        expect(slots).toHaveLength(6) //09:00 … 11:30
        expect(slots[0].getHours()).toBe(9)
        expect(slots.at(-1)?.getHours()).toBe(11)
        expect(slots.at(-1)?.getMinutes()).toBe(30)
    })

    it("drops slots whose duration would run past close", () => {
        const slots = computeSlots({ date: day, rules, existing: [], durationMinutes: 45, now: past })
        //last valid start = 11:15, but starts step by 30 min: 09:00..11:00
        expect(slots.at(-1)?.getHours()).toBe(11)
        expect(slots.at(-1)?.getMinutes()).toBe(0)
    })

    it("excludes conflicting slots", () => {
        const existing = [{ startsAt: slotAt(10, 0), endsAt: slotAt(10, 30) }]
        const slots = computeSlots({ date: day, rules, existing, durationMinutes: 30, now: past })
        expect(slots.some(slot => slot.getHours() === 10 && slot.getMinutes() === 0)).toBe(false)
        expect(slots).toHaveLength(5)
    })

    it("a longer booking blocks every slot it covers", () => {
        const existing = [{ startsAt: slotAt(9, 30), endsAt: slotAt(11, 0) }]
        const slots = computeSlots({ date: day, rules, existing, durationMinutes: 30, now: past })
        expect(slots.map(s => `${s.getHours()}:${String(s.getMinutes()).padStart(2, "0")}`)).toEqual(["9:00", "11:00", "11:30"])
    })

    it("returns nothing on closed days", () => {
        const monday = new Date("2026-07-13T00:00:00")
        expect(computeSlots({ date: monday, rules, existing: [], durationMinutes: 30, now: past })).toHaveLength(0)
    })

    it("filters out slots in the past", () => {
        const now = slotAt(10, 5)
        const slots = computeSlots({ date: day, rules, existing: [], durationMinutes: 30, now })
        expect(slots[0].getHours()).toBe(10)
        expect(slots[0].getMinutes()).toBe(30)
    })
})
