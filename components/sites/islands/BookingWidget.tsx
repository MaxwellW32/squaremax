"use client"
import React, { useEffect, useState } from "react"
import { getBookingSlots, submitBooking } from "@/serverFunctions/handleTenantPublic"

type ServiceOption = { name: string; price: string; durationMinutes: number }

function nextDays(count: number): { iso: string; label: string }[] {
    const days: { iso: string; label: string }[] = []
    const today = new Date()
    for (let offset = 0; offset < count; offset++) {
        const date = new Date(today)
        date.setDate(today.getDate() + offset)
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        days.push({
            iso,
            label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        })
    }
    return days
}

export default function BookingWidget({ slug, services, preview }: { slug: string; services: ServiceOption[]; preview: boolean }) {
    const [serviceName, serviceNameSet] = useState(services[0]?.name ?? "")
    const [dateISO, dateISOSet] = useState(nextDays(1)[0].iso)
    const [slots, slotsSet] = useState<string[]>([])
    const [slotsLoading, slotsLoadingSet] = useState(false)
    const [chosenSlot, chosenSlotSet] = useState<string | null>(null)

    const [customerName, customerNameSet] = useState("")
    const [customerEmail, customerEmailSet] = useState("")
    const [customerPhone, customerPhoneSet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "done" | "error">("idle")
    const [errorText, errorTextSet] = useState("")

    const days = nextDays(14)

    useEffect(() => {
        if (preview) return
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
                    {services.map(service => (
                        <button
                            key={service.name}
                            type="button"
                            onClick={() => serviceNameSet(service.name)}
                            className="rounded-[var(--t-radius)] px-3 py-2 text-[length:var(--t-text-s)] font-semibold"
                            style={serviceName === service.name
                                ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }
                                : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                        >
                            {service.name}{service.price !== "" ? ` · ${service.price}` : ""}
                        </button>
                    ))}
                </div>
            </div>

            {/* day */}
            <div className="grid gap-1.5">
                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Day</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {days.map(day => (
                        <button
                            key={day.iso}
                            type="button"
                            onClick={() => dateISOSet(day.iso)}
                            className="whitespace-nowrap rounded-[var(--t-radius)] px-3 py-2 text-[length:var(--t-text-s)] font-semibold"
                            style={dateISO === day.iso
                                ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }
                                : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* time */}
            <div className="grid gap-1.5">
                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Time</span>
                {preview ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">Available times appear here once your page is live.</p>
                ) : slotsLoading ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">Checking availability…</p>
                ) : slots.length === 0 ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">No open times this day — try another.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {slots.map(slot => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => chosenSlotSet(slot)}
                                className="rounded-[var(--t-radius)] px-3 py-2 text-[length:var(--t-text-s)] font-semibold tabular-nums"
                                style={chosenSlot === slot
                                    ? { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }
                                    : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                            >
                                {new Date(slot).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </button>
                        ))}
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
