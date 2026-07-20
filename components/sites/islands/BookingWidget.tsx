"use client"
import React, { useEffect, useMemo, useState } from "react"
import { getBookingSlots, getBookingWeekdays, submitBooking } from "@/serverFunctions/handleTenantPublic"
import { BUSINESS_TZ, businessDateISO, businessDayAnchor } from "@/lib/sites/bookingLogic"

type ServiceOption = { name: string; price: string; durationMinutes: number }

//============================================================
// Booking island: service pills → month-grid calendar → time
// pills → details. Days + labels are computed in the BUSINESS
// timezone so server render and hydration agree everywhere.
// Calendar/time-pill design: rounded month grid, solid-fill
// selected state, closed days struck through.
//============================================================

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"]
const MAX_MONTHS_AHEAD = 2

//business-local weekday of an ISO date (UTC-5 fixed: business noon shares
//the calendar day in UTC, so getUTCDay is exact)
function businessWeekday(iso: string): number {
    return new Date(businessDayAnchor(iso).dayStart.getTime() + 12 * 3600 * 1000).getUTCDay()
}

function isoFor(year: number, monthIndex: number, day: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function MonthCalendar({ value, onSelect, openWeekdays, todayISO }: {
    value: string | null
    onSelect: (iso: string) => void
    openWeekdays: number[] | null //null = still loading, treat all as open
    todayISO: string
}) {
    const [monthOffset, monthOffsetSet] = useState(0)

    const todayYear = Number(todayISO.slice(0, 4))
    const todayMonth = Number(todayISO.slice(5, 7)) - 1
    const shownDate = new Date(Date.UTC(todayYear, todayMonth + monthOffset, 1))
    const year = shownDate.getUTCFullYear()
    const monthIndex = shownDate.getUTCMonth()

    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
    const firstWeekday = businessWeekday(isoFor(year, monthIndex, 1))

    const cells: (string | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, dayIndex) => isoFor(year, monthIndex, dayIndex + 1)),
    ]

    return (
        <div className="rounded-[var(--t-radius)] p-3" style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}>
            <div className="flex items-center justify-between">
                <button
                    type="button" aria-label="Previous month" disabled={monthOffset === 0}
                    onClick={() => monthOffsetSet(offset => offset - 1)}
                    className="rounded-[var(--t-radius)] px-3 py-1 text-[length:var(--t-text-m)] disabled:opacity-30"
                    style={{ color: "var(--t-text)" }}
                >
                    ‹
                </button>
                <p className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-text)]">{MONTH_NAMES[monthIndex]} {year}</p>
                <button
                    type="button" aria-label="Next month" disabled={monthOffset >= MAX_MONTHS_AHEAD}
                    onClick={() => monthOffsetSet(offset => offset + 1)}
                    className="rounded-[var(--t-radius)] px-3 py-1 text-[length:var(--t-text-m)] disabled:opacity-30"
                    style={{ color: "var(--t-text)" }}
                >
                    ›
                </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                {DAY_LETTERS.map((letter, letterIndex) => (
                    <span key={`${letter}${letterIndex}`} className="py-1 text-[11px] uppercase text-[var(--t-text-muted)]">{letter}</span>
                ))}
                {cells.map((iso, cellIndex) => {
                    if (iso === null) return <span key={`pad-${cellIndex}`} />
                    const open = iso >= todayISO && (openWeekdays === null || openWeekdays.includes(businessWeekday(iso)))
                    const selected = value === iso
                    const dayNumber = Number(iso.slice(8, 10))

                    if (!open) {
                        return (
                            <span key={iso} title="No open times" className="cursor-not-allowed rounded-[var(--t-radius)] py-2 text-[length:var(--t-text-s)] line-through" style={{ color: "var(--t-text-muted)", opacity: 0.45 }}>
                                {dayNumber}
                            </span>
                        )
                    }
                    return (
                        <button
                            key={iso} type="button" onClick={() => onSelect(iso)}
                            className="rounded-[var(--t-radius)] py-2 text-[length:var(--t-text-s)] transition-colors"
                            style={selected
                                ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)", fontWeight: 600 }
                                : { color: "var(--t-text)" }}
                        >
                            {dayNumber}
                        </button>
                    )
                })}
            </div>
            <p className="mt-2 text-[11px] text-[var(--t-text-muted)]">Greyed-out days are closed.</p>
        </div>
    )
}

export default function BookingWidget({ slug, services, preview }: { slug: string; services: ServiceOption[]; preview: boolean }) {
    const [serviceName, serviceNameSet] = useState(services[0]?.name ?? "")
    const todayISO = useMemo(() => businessDateISO(new Date()), [])
    const [dateISO, dateISOSet] = useState<string | null>(null)
    const [openWeekdays, openWeekdaysSet] = useState<number[] | null>(null)
    const [slots, slotsSet] = useState<string[]>([])
    const [slotsLoading, slotsLoadingSet] = useState(false)
    const [chosenSlot, chosenSlotSet] = useState<string | null>(null)

    const [customerName, customerNameSet] = useState("")
    const [customerEmail, customerEmailSet] = useState("")
    const [customerPhone, customerPhoneSet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "done" | "error">("idle")
    const [errorText, errorTextSet] = useState("")

    //which weekdays are open at all — greys out closed days in the calendar
    useEffect(() => {
        if (preview) return
        let cancelled = false
        getBookingWeekdays(slug)
            .then(result => { if (!cancelled) openWeekdaysSet(result) })
            .catch(() => { if (!cancelled) openWeekdaysSet(null) })
        return () => { cancelled = true }
    }, [slug, preview])

    useEffect(() => {
        if (preview || dateISO === null) return
        let cancelled = false

        //deferred so no state is set synchronously inside the effect body
        const timer = setTimeout(async () => {
            if (cancelled) return
            slotsLoadingSet(true)
            chosenSlotSet(null)
            try {
                const result = await getBookingSlots({ slug, dateISO, serviceName })
                if (!cancelled) slotsSet(result)
            } catch {
                if (!cancelled) slotsSet([])
            } finally {
                if (!cancelled) slotsLoadingSet(false)
            }
        }, 0)

        return () => { cancelled = true; clearTimeout(timer) }
    }, [slug, dateISO, serviceName, preview])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (preview || chosenSlot === null || status === "sending") return

        statusSet("sending")
        errorTextSet("")
        try {
            await submitBooking({ slug, serviceName, startsAtISO: chosenSlot, customerName, customerEmail, customerPhone, notes: "" })
            statusSet("done")
        } catch (error) {
            statusSet("error")
            errorTextSet(error instanceof Error ? error.message : "something went wrong")
        }
    }

    if (status === "done") {
        return (
            <div className="grid gap-1 rounded-[var(--t-radius)] p-6 text-center" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <p className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Booking received ✓</p>
                <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">You&apos;ll get a confirmation shortly.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
            {/* service */}
            <div className="grid gap-1.5">
                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Service</span>
                <div className="flex flex-wrap gap-2">
                    {services.map((service, serviceIndex) => (
                        <button
                            key={service.name + "-" + serviceIndex}
                            type="button"
                            onClick={() => serviceNameSet(service.name)}
                            className="rounded-[var(--t-radius)] border px-3 py-2 text-[length:var(--t-text-s)] font-semibold transition-colors"
                            style={serviceName === service.name
                                ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)", borderColor: "var(--t-primary)" }
                                : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                        >
                            {service.name}{service.price !== "" ? ` · ${service.price}` : ""}
                        </button>
                    ))}
                </div>
            </div>

            {/* date — month-grid calendar */}
            <div className="grid gap-1.5">
                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Date</span>
                {preview ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">The booking calendar appears here once your page is live.</p>
                ) : (
                    <MonthCalendar value={dateISO} onSelect={dateISOSet} openWeekdays={openWeekdays} todayISO={todayISO} />
                )}
            </div>

            {/* time — pill grid */}
            <div className="grid gap-1.5">
                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Time</span>
                {preview ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">Available times appear here.</p>
                ) : dateISO === null ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">Pick a date to see open times.</p>
                ) : slotsLoading ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">Checking availability…</p>
                ) : slots.length === 0 ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">No open times this day — try another.</p>
                ) : (
                    <div className={`grid grid-cols-3 gap-2 sm:grid-cols-4 ${slotsLoading ? "opacity-60" : ""}`}>
                        {slots.map(slot => {
                            const selected = chosenSlot === slot
                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => chosenSlotSet(slot)}
                                    className="rounded-[var(--t-radius)] border px-2 py-2 text-center text-[length:var(--t-text-s)] font-semibold tabular-nums transition-colors"
                                    style={selected
                                        ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)", borderColor: "var(--t-primary)" }
                                        : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                                >
                                    {new Date(slot).toLocaleTimeString("en-US", { timeZone: BUSINESS_TZ, hour: "numeric", minute: "2-digit" })}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* customer details */}
            <div className="grid gap-3 sm:grid-cols-3">
                <input
                    required placeholder="Your name" value={customerName} onChange={e => customerNameSet(e.target.value)}
                    className="rounded-[var(--t-radius)] px-3 py-2.5"
                    style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
                <input
                    required type="email" placeholder="Email" value={customerEmail} onChange={e => customerEmailSet(e.target.value)}
                    className="rounded-[var(--t-radius)] px-3 py-2.5"
                    style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
                <input
                    placeholder="Phone (optional)" value={customerPhone} onChange={e => customerPhoneSet(e.target.value)}
                    className="rounded-[var(--t-radius)] px-3 py-2.5"
                    style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
            </div>

            {status === "error" && (
                <p className="text-[length:var(--t-text-s)] font-semibold" style={{ color: "var(--t-accent)" }}>{errorText}</p>
            )}

            <button
                type="submit"
                disabled={chosenSlot === null || status === "sending" || preview}
                className="rounded-[var(--t-radius)] px-5 py-3 font-semibold disabled:opacity-50"
                style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
            >
                {status === "sending" ? "Booking…" : "Confirm booking"}
            </button>
        </form>
    )
}
