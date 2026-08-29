"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { AddonId, monthlyTotal } from "@/lib/sites/addons"
import { PaymentRow, addMonthlyPeriods, monthChoices, planLines } from "@/lib/sites/billing"
import { EffectiveStatus, GRACE_DAYS } from "@/lib/sites/status"
import { getTenantPayments, setTenantOnline, startTenantCheckout } from "@/serverFunctions/handleTenantBilling"

//============================================================
// Everything a client needs to run their own subscription:
// what they pay for and why, how long they're covered, buying
// several months in one charge, taking the site offline (paid
// time is kept) and every receipt to date.
//
// Prepaid, never auto-charged — so "renew" is a deliberate act
// and the UI's job is to make the consequences obvious.
//============================================================

const card = "grid content-start gap-3 rounded-xl border border-line bg-surface p-5"
const label = "text-xs font-semibold uppercase tracking-wide text-mist"

function money(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

function longDate(value: string | Date): string {
    return new Date(value).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/Jamaica" })
}

function shortDate(value: string | Date): string {
    return new Date(value).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "America/Jamaica" })
}

const paymentStatusCopy: Record<PaymentRow["status"], { label: string; className: string }> = {
    succeeded: { label: "Paid", className: "bg-emerald-100 text-emerald-800" },
    pending: { label: "Not completed", className: "bg-line text-mist" },
    failed: { label: "Declined", className: "bg-red-100 text-red-800" },
    refunded: { label: "Refunded", className: "bg-amber-100 text-amber-800" },
}

export default function SubscriptionTab(props: {
    tenantId: string
    status: EffectiveStatus
    currentPeriodEnd: string | null
    enabledAddons: AddonId[]
    initialPayments: PaymentRow[]
    //both resolved against the SERVER's clock, so this component never needs
    //one of its own (and the first client render can't disagree with the HTML)
    paidDaysLeft: number
    renewBaseISO: string
    onStatusChange: (status: "live" | "cancelled") => void
    onManageAddons: () => void
}) {
    const [months, monthsSet] = useState(1)
    const [busy, busySet] = useState(false)
    const [payments, paymentsSet] = useState(props.initialPayments)

    const monthly = monthlyTotal(props.enabledAddons)
    const lines = planLines(props.enabledAddons)
    const totalCents = monthly * 100 * months
    const left = props.paidDaysLeft
    const coveredUntil = addMonthlyPeriods(props.renewBaseISO, months)
    const neverPaid = props.currentPeriodEnd === null

    //what the top of the tab says, in the client's language
    const headline: Record<EffectiveStatus, { title: string; detail: string; className: string }> = {
        draft: {
            title: "Not published yet",
            detail: "Your first payment puts the site online straight away.",
            className: "border-line",
        },
        active: {
            title: `Covered for ${left} more day${left === 1 ? "" : "s"}`,
            detail: `Your site is live and paid through ${props.currentPeriodEnd !== null ? longDate(props.currentPeriodEnd) : ""}. Add months any time — new time stacks on what you already have.`,
            className: "border-emerald-500/40",
        },
        grace: {
            title: "Payment due",
            detail: `Your period ended, but your site stays online for ${GRACE_DAYS} days while you renew. Pay below to avoid any interruption.`,
            className: "border-amber-500/50",
        },
        suspended: {
            title: "Site paused — visitors see a holding page",
            detail: "Renew below and your site is back online immediately, exactly as you left it.",
            className: "border-red-500/50",
        },
        cancelled: {
            title: "You took this site offline",
            detail: neverPaid
                ? "Pay below to publish it."
                : "Nothing was deleted. Bring it back online whenever you like — any paid time you had left is still there.",
            className: "border-line",
        },
    }
    const current = headline[props.status]

    const run = async (work: () => Promise<unknown>, success: string) => {
        if (busy) return //disabled= only applies after re-render; block double-clicks
        busySet(true)
        try {
            await work()
            toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    const pay = async () => {
        if (busy) return
        busySet(true)
        try {
            const { url } = await startTenantCheckout(props.tenantId, months)
            window.location.href = url
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't start checkout")
            busySet(false)
        }
    }

    const toggleOnline = (online: boolean) => {
        if (!online && !window.confirm("Take your site offline? Visitors will see a holding page. Your pages, bookings and customers are kept, and so is the time you've already paid for.")) return
        run(async () => {
            const result = await setTenantOnline(props.tenantId, online)
            props.onStatusChange(result.status)
            paymentsSet(await getTenantPayments(props.tenantId))
        }, online ? "Your site is back online" : "Your site is offline")
    }

    return (
        <div className="grid gap-4">
            {/* ============ where you stand ============ */}
            <div className={`grid gap-1 rounded-xl border-2 bg-surface p-5 ${current.className}`}>
                <p className={label}>Subscription</p>
                <p className="font-display text-2xl font-bold normal-case">{current.title}</p>
                <p className="max-w-2xl text-sm text-mist">{current.detail}</p>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-2">
                {/* ============ add months ============ */}
                <div className={card}>
                    <p className={label}>{neverPaid ? "Go live" : "Add time"}</p>
                    <p className="text-sm text-mist">How many months would you like to pay for?</p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {monthChoices.map(choice => (
                            <button key={choice} type="button" onClick={() => monthsSet(choice)}
                                aria-pressed={months === choice}
                                className={`grid gap-0.5 rounded-lg border px-3 py-2.5 text-center ${months === choice ? "border-cobalt bg-cobalt/5" : "border-line hover:border-mist"}`}>
                                <span className="font-display text-lg font-bold leading-none">{choice}</span>
                                <span className="text-xs text-mist">month{choice === 1 ? "" : "s"}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-1 grid gap-1 rounded-lg bg-paper p-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm text-mist">{months} × {money(monthly * 100)}/month</span>
                            <span className="font-display text-2xl font-bold">{money(totalCents)}</span>
                        </div>
                        <p className="text-xs text-mist">
                            One charge. Covers you through <strong className="text-ink">{longDate(coveredUntil)}</strong>
                            {left > 0 && !neverPaid ? " — your remaining days are added on, not replaced." : "."}
                        </p>
                    </div>

                    <button type="button" disabled={busy} onClick={pay}
                        className="w-full rounded-lg bg-cobalt px-5 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50 sm:w-fit">
                        Pay {money(totalCents)}
                    </button>
                    <p className="text-xs text-mist">
                        Secure card payment. We never store your card, and nothing is ever charged automatically —
                        you decide when to add more months.
                    </p>
                </div>

                {/* ============ what you're paying for ============ */}
                <div className={card}>
                    <p className={label}>What you&apos;re paying for</p>
                    <ul className="grid gap-1.5">
                        {lines.map(line => (
                            <li key={line.label} className="flex items-baseline justify-between gap-3 text-sm">
                                <span>{line.label}</span>
                                <span className="shrink-0 font-mono text-mist">${line.monthlyPrice}/mo</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                        <span className="font-display font-bold">Your monthly price</span>
                        <span className="font-display text-xl font-bold">${monthly}</span>
                    </div>
                    <button type="button" onClick={props.onManageAddons}
                        className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:border-cobalt hover:text-cobalt">
                        Add or remove features
                    </button>
                    <p className="text-xs text-mist">
                        Changing features changes your monthly price from your next payment — the months you&apos;ve
                        already paid for are never re-charged.
                    </p>
                </div>
            </div>

            {/* ============ site on/off ============ */}
            <div className={card}>
                <p className={label}>Your site</p>
                {props.status === "cancelled" ? (
                    <>
                        <p className="text-sm text-mist">
                            Your site is offline. {left > 0 && `You still have ${left} paid day${left === 1 ? "" : "s"} — bringing it back online uses them, not a new payment.`}
                        </p>
                        <button type="button" disabled={busy || neverPaid} onClick={() => toggleOnline(true)}
                            className="w-fit rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            Bring my site back online
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-mist">
                            There&apos;s no contract and nothing to cancel — simply stop adding months and your site
                            winds down on its own{props.currentPeriodEnd !== null && ` after ${longDate(props.currentPeriodEnd)}`}.
                            If you&apos;d rather take it down right now, you can:
                        </p>
                        <button type="button" disabled={busy} onClick={() => toggleOnline(false)}
                            className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:border-brand hover:text-brand disabled:opacity-50">
                            Take my site offline
                        </button>
                    </>
                )}
            </div>

            {/* ============ receipts ============ */}
            <div className="grid gap-3 rounded-xl border border-line bg-surface p-5">
                <p className={label}>Payment history</p>
                {payments.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-mist">
                        No payments yet — your first one will show up here.
                    </p>
                ) : (
                    <div className="-mx-2 overflow-x-auto px-2">
                        <table className="w-full min-w-[34rem] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-mist">
                                    <th className="py-2 pr-3 font-semibold">Date</th>
                                    <th className="py-2 pr-3 font-semibold">For</th>
                                    <th className="py-2 pr-3 font-semibold">Covers</th>
                                    <th className="py-2 pr-3 text-right font-semibold">Amount</th>
                                    <th className="py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment.id} className="border-b border-line/60 last:border-0">
                                        <td className="py-2.5 pr-3 whitespace-nowrap">{shortDate(payment.createdAt)}</td>
                                        <td className="py-2.5 pr-3 whitespace-nowrap">{payment.months} month{payment.months === 1 ? "" : "s"}</td>
                                        <td className="py-2.5 pr-3 text-mist">
                                            {payment.periodStart !== null && payment.periodEnd !== null
                                                ? `${shortDate(payment.periodStart)} – ${shortDate(payment.periodEnd)}`
                                                : "—"}
                                        </td>
                                        <td className="py-2.5 pr-3 text-right font-mono whitespace-nowrap">{money(payment.amountCents)}</td>
                                        <td className="py-2.5">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${paymentStatusCopy[payment.status].className}`}>
                                                {paymentStatusCopy[payment.status].label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="text-xs text-mist">
                    Rows marked &ldquo;not completed&rdquo; are checkouts that were closed before paying — nothing was charged.
                </p>
            </div>
        </div>
    )
}
