//============================================================
// Pure booking-slot math — no IO, fully unit-testable.
//============================================================

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

//all bookable start times on a given calendar day (local server time),
//excluding slots that would overlap an existing booking or end after close
export function computeSlots(opts: {
    date: Date //any time on the target day
    rules: AvailabilityRule[]
    existing: BookedRange[]
    durationMinutes: number
    now?: Date //slots before now are excluded (defaults to new Date())
}): Date[] {
    const { date, rules, existing, durationMinutes } = opts
    const now = opts.now ?? new Date()

    const rule = rules.find(eachRule => eachRule.dayOfWeek === date.getDay())
    if (rule === undefined) return []

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

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
