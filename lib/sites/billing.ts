import { AddonId, BASE_MONTHLY_PRICE, addonsById, monthlyTotal } from "./addons"

//============================================================
// Prepaid subscription math, in one pure place so the checkout
// action, the callback that credits the period and the dashboard
// all agree. A payment buys N × 30-day periods; periods STACK on
// whatever is left, so paying early never burns paid time.
//============================================================

export const PERIOD_DAYS = 30
export const PERIOD_MS = PERIOD_DAYS * 24 * 60 * 60 * 1000

//an upper bound keeps a fat-fingered "120 months" out of the gateway
export const MAX_MONTHS_AHEAD = 24

//what the dashboard offers as one-click durations
export const monthChoices = [1, 3, 6, 12] as const

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded"

export type PaymentRow = {
    id: string
    amountCents: number
    months: number
    status: PaymentStatus
    gatewayTransactionId: string | null
    periodStart: string | null
    periodEnd: string | null
    addonsSnapshot: AddonId[]
    createdAt: string
}

export function checkoutAmountCents(enabledAddons: AddonId[], months: number): number {
    return monthlyTotal(enabledAddons) * 100 * months
}

//where time bought right now starts counting from: whatever is still unexpired,
//otherwise this moment. Resolved on the SERVER and handed to the dashboard, so
//the client can price any number of months without a clock of its own.
export function renewBase(currentPeriodEnd: Date | string | null, now: Date = new Date()): Date {
    const current = currentPeriodEnd === null ? null : new Date(currentPeriodEnd)
    return current !== null && !Number.isNaN(current.getTime()) && current > now ? current : now
}

//new paid-through date after buying `months`: unexpired time carries over
export function periodEndAfter(currentPeriodEnd: Date | string | null, months: number, now: Date = new Date()): Date {
    return addMonthlyPeriods(renewBase(currentPeriodEnd, now), months)
}

export function addMonthlyPeriods(base: Date | string, months: number): Date {
    return new Date(new Date(base).getTime() + months * PERIOD_MS)
}

//whole days of paid time left (0 once the period has lapsed)
export function daysRemaining(currentPeriodEnd: Date | string | null, now: Date = new Date()): number {
    if (currentPeriodEnd === null) return 0
    const end = new Date(currentPeriodEnd)
    if (Number.isNaN(end.getTime())) return 0
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
}

//human-readable "what am I paying for" lines — base plan first, then add-ons
export function planLines(enabledAddons: AddonId[]): { label: string; monthlyPrice: number }[] {
    return [
        { label: "Website — hosting, editor, up to 5 pages", monthlyPrice: BASE_MONTHLY_PRICE },
        //tolerate retired add-on ids on old tenant rows: skip what we can't price
        ...enabledAddons.flatMap(id => {
            const addon = addonsById[id]
            return addon === undefined ? [] : [{ label: addon.name, monthlyPrice: addon.monthlyPrice }]
        }),
    ]
}
