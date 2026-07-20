"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import {
    customerSignIn, customerSignOut, customerSignUp, updateCustomerPrefs, PublicCustomer,
} from "@/serverFunctions/handleCustomers"

//============================================================
// Customer account island on a CLIENT site. Accounts are scoped
// to this tenant only — signing up here creates an account for
// THIS business, unrelated to any other site on the platform.
// Styled exclusively with --t-* theme tokens.
//============================================================

type BookingRow = {
    id: string
    serviceName: string
    startsAt: string | Date
    status: "pending" | "confirmed" | "cancelled"
}

const inputStyle: React.CSSProperties = { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }
const inputClass = "rounded-[var(--t-radius)] px-3 py-2.5"
const buttonStyle: React.CSSProperties = { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }

export default function CustomerAccountPanel({
    slug,
    businessName,
    initialCustomer,
    initialBookings,
}: {
    slug: string
    businessName: string
    initialCustomer: PublicCustomer | null
    initialBookings: BookingRow[]
}) {
    const [customer, customerSet] = useState<PublicCustomer | null>(initialCustomer)
    const [mode, modeSet] = useState<"signin" | "signup">("signin")
    const [busy, busySet] = useState(false)

    //auth form fields
    const [name, nameSet] = useState("")
    const [email, emailSet] = useState("")
    const [phone, phoneSet] = useState("")
    const [password, passwordSet] = useState("")

    //prefs (seeded from the signed-in customer)
    const [prefName, prefNameSet] = useState(initialCustomer?.name ?? "")
    const [prefPhone, prefPhoneSet] = useState(initialCustomer?.phone ?? "")
    const [notifyEmail, notifyEmailSet] = useState(initialCustomer?.notifyEmail ?? true)
    const [notifyWhatsapp, notifyWhatsappSet] = useState(initialCustomer?.notifyWhatsapp ?? false)

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault()
        if (busy) return
        busySet(true)
        try {
            const result = mode === "signup"
                ? await customerSignUp({ slug, name, email, phone, password })
                : await customerSignIn({ slug, email, password })
            customerSet(result)
            prefNameSet(result.name)
            prefPhoneSet(result.phone)
            notifyEmailSet(result.notifyEmail)
            notifyWhatsappSet(result.notifyWhatsapp)
            toast.success(mode === "signup" ? "Account created" : "Signed in")
            //bookings for a fresh sign-in load on next visit; keep it simple here
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await customerSignOut(slug)
            customerSet(null)
            toast.success("Signed out")
        } catch {
            toast.error("couldn't sign out")
        }
    }

    const handleSavePrefs = async (event: React.FormEvent) => {
        event.preventDefault()
        if (busy) return
        busySet(true)
        try {
            await updateCustomerPrefs({ slug, name: prefName, phone: prefPhone, notifyEmail, notifyWhatsapp })
            toast.success("Saved")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't save")
        } finally {
            busySet(false)
        }
    }

    if (customer === null) {
        return (
            <div className="grid gap-4 rounded-[var(--t-radius)] p-6" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <div className="flex gap-2">
                    {(["signin", "signup"] as const).map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => modeSet(option)}
                            className="rounded-[var(--t-radius)] px-4 py-2 text-[length:var(--t-text-s)] font-semibold"
                            style={mode === option ? buttonStyle : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                        >
                            {option === "signin" ? "Sign in" : "Create account"}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleAuth} className="grid gap-3">
                    {mode === "signup" && (
                        <>
                            <input required placeholder="Your name" value={name} onChange={e => nameSet(e.target.value)} className={inputClass} style={inputStyle} />
                            <input placeholder="Phone (optional, for WhatsApp updates)" value={phone} onChange={e => phoneSet(e.target.value)} className={inputClass} style={inputStyle} />
                        </>
                    )}
                    <input required type="email" placeholder="Email" value={email} onChange={e => emailSet(e.target.value)} className={inputClass} style={inputStyle} />
                    <input required type="password" placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"} value={password} onChange={e => passwordSet(e.target.value)} className={inputClass} style={inputStyle} />

                    <button type="submit" disabled={busy} className="rounded-[var(--t-radius)] px-5 py-3 font-semibold disabled:opacity-50" style={buttonStyle}>
                        {busy ? "One moment…" : mode === "signup" ? `Join ${businessName}` : "Sign in"}
                    </button>
                </form>

                <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                    Your account is with {businessName} only — it lets you track bookings and get updates.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <div>
                    <p className="font-semibold text-[var(--t-text)]">{customer.name !== "" ? customer.name : customer.email}</p>
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{customer.email}</p>
                </div>
                <button type="button" onClick={handleSignOut} className="rounded-[var(--t-radius)] px-4 py-2 text-[length:var(--t-text-s)] font-semibold" style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}>
                    Sign out
                </button>
            </div>

            {/* bookings */}
            <div className="grid gap-3 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <h2 className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Your bookings</h2>
                {initialBookings.length === 0 ? (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">No bookings yet.</p>
                ) : (
                    <ul className="grid gap-2">
                        {initialBookings.map(booking => (
                            <li key={booking.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-[var(--t-radius)] px-4 py-2.5" style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}>
                                <span className="font-semibold text-[var(--t-text)]">{booking.serviceName}</span>
                                <span className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                                    {new Date(booking.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                                <span className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide" style={{ color: booking.status === "cancelled" ? "var(--t-text-muted)" : "var(--t-primary)" }}>
                                    {booking.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* profile + notification preferences */}
            <form onSubmit={handleSavePrefs} className="grid gap-3 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                <h2 className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Profile & notifications</h2>

                <div className="grid gap-3 sm:grid-cols-2">
                    <input required placeholder="Name" value={prefName} onChange={e => prefNameSet(e.target.value)} className={inputClass} style={inputStyle} />
                    <input placeholder="Phone" value={prefPhone} onChange={e => prefPhoneSet(e.target.value)} className={inputClass} style={inputStyle} />
                </div>

                <label className="flex items-center gap-2 text-[length:var(--t-text-s)] text-[var(--t-text)]">
                    <input type="checkbox" checked={notifyEmail} onChange={e => notifyEmailSet(e.target.checked)} />
                    Email me updates and announcements from {businessName}
                </label>
                <label className="flex items-center gap-2 text-[length:var(--t-text-s)] text-[var(--t-text)]">
                    <input type="checkbox" checked={notifyWhatsapp} onChange={e => notifyWhatsappSet(e.target.checked)} />
                    I&apos;m happy to get WhatsApp messages on my phone number
                </label>

                <button type="submit" disabled={busy} className="w-fit rounded-[var(--t-radius)] px-5 py-2.5 font-semibold disabled:opacity-50" style={buttonStyle}>
                    {busy ? "Saving…" : "Save"}
                </button>
            </form>
        </div>
    )
}
