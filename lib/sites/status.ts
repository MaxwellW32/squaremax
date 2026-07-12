//============================================================
// Effective tenant status is computed from currentPeriodEnd at
// read time — no cron. Prepaid periods (cheers pattern):
//   draft      — onboarding not paid yet, page not public
//   active     — paid, period current
//   grace      — period lapsed < GRACE_DAYS ago; page still up,
//                dashboard shows a renew banner
//   suspended  — lapsed past grace; public page shows the
//                polite "paused" placeholder
//   cancelled  — owner cancelled; same public treatment
//============================================================

export const GRACE_DAYS = 7

export type EffectiveStatus = "draft" | "active" | "grace" | "suspended" | "cancelled"

//currentPeriodEnd may arrive as a string: unstable_cache JSON-serializes
//Date columns on cache hits
export function effectiveStatus(tenant: {
    status: "draft" | "live" | "cancelled"
    currentPeriodEnd: Date | string | null
}): EffectiveStatus {
    if (tenant.status === "draft") return "draft"
    if (tenant.status === "cancelled") return "cancelled"

    if (tenant.currentPeriodEnd === null) return "suspended"

    const now = Date.now()
    const periodEnd = new Date(tenant.currentPeriodEnd).getTime()
    if (Number.isNaN(periodEnd)) return "suspended"

    if (now <= periodEnd) return "active"
    if (now <= periodEnd + GRACE_DAYS * 24 * 60 * 60 * 1000) return "grace"
    return "suspended"
}

export function isPubliclyVisible(status: EffectiveStatus): boolean {
    return status === "active" || status === "grace"
}
