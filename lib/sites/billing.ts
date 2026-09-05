import { AddonId, BASE_MONTHLY_PRICE, addonsById, priceQuote } from "./addons"

//============================================================
// Prepaid subscription math, in one pure place so the checkout
// action, the callback that credits the period and the dashboard
// all agree. A payment buys N × 30-day periods; periods STACK on
// whatever is left, so paying early never burns paid time.
// Paying a year at once earns FREE_MONTHS_PER_YEAR months free.
//============================================================

export const PERIOD_DAYS = 30
export const PERIOD_MS = PERIOD_DAYS * 24 * 60 * 60 * 1000

//an upper bound keeps a fat-fingered "120 months" out of the gateway
export const MAX_MONTHS_AHEAD = 24

//what the dashboard offers as one-click durations
export const monthChoices = [1, 3, 6, 12] as const

//annual prepay: every full 12 months bought, 2 of them are on us
export const FREE_MONTHS_PER_YEAR = 2

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

//months actually charged for `months` of cover (annual discount applied)
export function chargeableMonths(months: number): number {
    const years = Math.floor(months / 12)
    return months - years * FREE_MONTHS_PER_YEAR
}

export function freeMonthsFor(months: number): number {
    return months - chargeableMonths(months)
}

export function checkoutAmountCents(enabledAddons: AddonId[], months: number): number {
    return priceQuote(enabledAddons).monthly * 100 * chargeableMonths(months)
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

//human-readable "what am I paying for" lines: a bundle line when one applies
//(with what it covers), otherwise the base website line, then one line per
//add-on. Retired add-on ids on old rows are skipped, never rendered blank.
export function planLines(enabledAddons: AddonId[]): { label: string; monthlyPrice: number }[] {
    const quote = priceQuote(enabledAddons)

    if (quote.bundle !== null) {
        const covered = quote.bundle.addons.map(id => addonsById[id]?.name ?? id).join(", ")
        return [
            { label: `${quote.bundle.name} — website + ${covered}`, monthlyPrice: quote.bundle.monthlyPrice },
            ...quote.extras.flatMap(id => {
                const addon = addonsById[id]
                return addon === undefined ? [] : [{ label: addon.name, monthlyPrice: addon.monthlyPrice }]
            }),
        ]
    }

    return [
        { label: "Website — hosting, editor, up to 5 pages", monthlyPrice: BASE_MONTHLY_PRICE },
        ...enabledAddons.flatMap(id => {
            const addon = addonsById[id]
            return addon === undefined ? [] : [{ label: addon.name, monthlyPrice: addon.monthlyPrice }]
        }),
    ]
}
