//============================================================
// Pure exchange-rate helpers (no IO) so the conversion policy
// is unit-testable: a mid-market USD→JMD rate becomes the rate
// we charge at by adding a margin (bank spread protection) and
// rounding UP to a whole J$ per US$1 — so "US$10 = J$1,600"
// is a clean number on the checkout page.
//============================================================

//anything outside this band is a broken feed, not a real rate
export const JMD_RATE_SANE_MIN = 80
export const JMD_RATE_SANE_MAX = 400

export function isSaneJmdRate(rate: number): boolean {
    return Number.isFinite(rate) && rate >= JMD_RATE_SANE_MIN && rate <= JMD_RATE_SANE_MAX
}

export function chargeRateFromMid(midRate: number, marginPercent: number): number {
    return Math.ceil(midRate * (1 + marginPercent / 100))
}

//USD list-price cents -> cents in JMD at the given rate
export function usdCentsToJmdCents(usdCents: number, jmdPerUsd: number): number {
    return Math.round(usdCents * jmdPerUsd)
}
