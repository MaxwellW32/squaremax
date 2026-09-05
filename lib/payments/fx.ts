import { env } from "@/lib/env"
import { businessDateISO } from "@/lib/sites/bookingLogic"
import { chargeRateFromMid, isSaneJmdRate } from "./fxMath"

//============================================================
// USD→JMD rate for a JMD-settling merchant account.
//   fixed mode — JMD_PER_USD is set: that rate, always.
//   auto mode  — unset: fetch the mid-market rate once per
//                Jamaica calendar day, add JMD_RATE_MARGIN_PERCENT,
//                round up to a whole J$; keep the last good value
//                as a fallback so a feed outage after boot never
//                blocks a checkout. On a cold start during an
//                outage the rate is null and checkout refuses
//                with a clear message rather than guessing.
// The rate only changes at midnight Jamaica time, so what the
// client saw in the dashboard is what the card is charged.
//============================================================

const SOURCE_URL = "https://open.er-api.com/v6/latest/USD"
const FETCH_TIMEOUT_MS = 6000

type RateCache = { dateISO: string; rate: number }
const store = globalThis as unknown as { __jmdRateToday?: RateCache; __jmdRateLastGood?: number }

export type JmdRateMode = "fixed" | "auto"

export function jmdRateMode(): JmdRateMode {
    return env.JMD_PER_USD !== undefined ? "fixed" : "auto"
}

async function fetchMidRate(): Promise<number> {
    const res = await fetch(SOURCE_URL, { cache: "no-store", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) throw new Error(`rate source HTTP ${res.status}`)
    const data = await res.json() as { result?: string; rates?: Record<string, number> }
    const mid = Number(data.rates?.JMD)
    if (data.result !== "success" || !isSaneJmdRate(mid)) throw new Error(`rate source returned ${String(data.rates?.JMD)}`)
    return mid
}

//whole J$ per US$1 to charge at right now, or null if no rate is known
export async function getJmdPerUsd(): Promise<number | null> {
    if (env.JMD_PER_USD !== undefined) return env.JMD_PER_USD

    const today = businessDateISO(new Date())
    if (store.__jmdRateToday?.dateISO === today) return store.__jmdRateToday.rate

    try {
        const mid = await fetchMidRate()
        const rate = chargeRateFromMid(mid, env.JMD_RATE_MARGIN_PERCENT)
        store.__jmdRateToday = { dateISO: today, rate }
        store.__jmdRateLastGood = rate
        return rate
    } catch (error) {
        console.error("USD→JMD rate fetch failed:", error instanceof Error ? error.message : error)
        return store.__jmdRateLastGood ?? null
    }
}
