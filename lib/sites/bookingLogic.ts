//============================================================
// Pure booking-slot math — no IO, fully unit-testable.
//
// All times are BUSINESS-LOCAL wall clock. The business zone is
// America/Jamaica (fixed UTC-5, no DST), so a calendar day is
// anchored explicitly and slot instants are correct no matter
// what timezone the server or the visitor is in.
//============================================================

export const BUSINESS_TZ = "America/Jamaica"
export const BUSINESS_UTC_OFFSET = "-05:00" //Jamaica: fixed, no DST

export type AvailabilityRule = {
    dayOfWeek: number //0 = Sunday … 6 = Saturday
    openTime: string //"09:00"
    closeTime: string //"17:00"
    slotMinutes: number
}

export type BookedRange = {
    startsAt: Date
    endsAt: Date
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && bStart < aEnd
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

export const dateISOSchemaPattern = /^\d{4}-\d{2}-\d{2}$/

//the instant of business-local midnight + the weekday of that calendar date
export function businessDayAnchor(dateISO: string): { dayStart: Date; dayOfWeek: number } {
    const [year, month, day] = dateISO.split("-").map(Number)
    return {
        dayStart: new Date(`${dateISO}T00:00:00${BUSINESS_UTC_OFFSET}`),
        dayOfWeek: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    }
}

//"today" (or today+offset) as a YYYY-MM-DD calendar date in the business zone —
//deterministic for server AND client, so SSR'd islands don't hydration-mismatch
export function businessDateISO(instant: Date, dayOffset = 0): string {
    const shifted = new Date(instant.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(shifted)
}

//all bookable start instants on a business-local calendar day, excluding slots
//that would overlap an existing booking, end after close, or start in the past
export function computeSlots(opts: {
    dateISO: string //"2026-07-15" (business-local calendar date)
    rules: AvailabilityRule[]
    existing: BookedRange[]
    durationMinutes: number
    now?: Date
}): Date[] {
    const { dateISO, rules, existing, durationMinutes } = opts
    if (!dateISOSchemaPattern.test(dateISO)) return []

    const now = opts.now ?? new Date()
    const { dayStart, dayOfWeek } = businessDayAnchor(dateISO)

    const rule = rules.find(eachRule => eachRule.dayOfWeek === dayOfWeek)
    if (rule === undefined) return []

    const open = timeToMinutes(rule.openTime)
    const close = timeToMinutes(rule.closeTime)
    const step = rule.slotMinutes

    const slots: Date[] = []
    for (let minute = open; minute + durationMinutes <= close; minute += step) {
        const slotStart = new Date(dayStart.getTime() + minute * 60_000)
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000)

        if (slotStart <= now) continue

        const conflicts = existing.some(booked => rangesOverlap(slotStart, slotEnd, booked.startsAt, booked.endsAt))
        if (!conflicts) slots.push(slotStart)
    }

    return slots
}
