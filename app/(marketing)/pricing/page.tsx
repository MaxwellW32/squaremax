import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { ADDON_MONTHLY_PRICE, BASE_MONTHLY_PRICE, addons } from "@/lib/sites/addons"
import { FREE_MONTHS_PER_YEAR } from "@/lib/sites/billing"
import { GRACE_DAYS } from "@/lib/sites/status"
import PlanCards from "@/components/marketing/PlanCards"

export const metadata: Metadata = {
    title: "Pricing — websites from US$10/month | Squaremax",
    description: "Website US$10/month. Service bundle with online booking and notifications US$15. Storefront bundle with online orders and a custom domain US$20. No setup fee, no contract, 2 months free on a year.",
}

const comparisons: { name: string; price: string; note: string }[] = [
    { name: "Squaremax Service bundle", price: "US$15/mo", note: "Website + online booking + notifications, editable from your phone" },
    { name: "Wix / Squarespace", price: "US$17–23/mo", note: "Website only — booking is a separate app or plan" },
    { name: "Booksy / Fresha", price: "US$30+/mo or commission", note: "Booking only, no website, your customers belong to their marketplace" },
    { name: "A freelancer's one-off site", price: "US$300–1,500 once", note: "Plus hosting, plus a call every time you want a word changed" },
]

const billingFaq: { q: string; a: string }[] = [
    { q: "How does payment work?", a: `You prepay by card on a secure PowerTranz page: one month, or 3, 6 or 12 at once. Twelve months costs ten (${FREE_MONTHS_PER_YEAR} free). We never charge your card automatically — you decide when to add more time from your dashboard.` },
    { q: "What happens when my paid period ends?", a: `Your site stays online for a ${GRACE_DAYS}-day grace window, and we email you before and after it ends. If you don't renew, visitors see a polite holding page until you do. Nothing is deleted.` },
    { q: "Can I change tools later?", a: "Any time, from your dashboard. Switch on booking today, add the store next month. The new price applies from your next payment, and bundles apply themselves whenever your tools qualify." },
    { q: "Are prices in Jamaican dollars?", a: "Prices are set in US dollars so they stay stable. Your card statement will show the charge in whatever currency your bank settles, at that day's rate." },
    { q: "Is there a fee on my sales?", a: "No. Orders and bookings that come through your site are yours, with no commission. You pay the flat monthly price and nothing else." },
    { q: "Can you build the site for me?", a: "Yes: concierge setup. Send your photos, menu or services and hours, and we build the whole site for you for a one-time US$99. Ask via the contact page." },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16">
                    <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight normal-case md:text-5xl">
                        Simple prices. <span className="text-cobalt">No surprises.</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-mist">
                        A website is US${BASE_MONTHLY_PRICE}/month. Every tool is US${ADDON_MONTHLY_PRICE}. Bundles make it cheaper. Pay a year, get {FREE_MONTHS_PER_YEAR} months free. That&apos;s the whole price list.
                    </p>
                </div>
            </section>

            <section className="bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-14">
                    <PlanCards />
                </div>
            </section>

            <section className="border-t border-line">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14">
                    <h2 className="font-display text-2xl font-bold normal-case">Every tool, US${ADDON_MONTHLY_PRICE}/month each</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {addons.map(addon => (
                            <div key={addon.id} className={`grid content-start gap-1.5 rounded-xl border border-line bg-surface p-5 ${addon.status === "coming-soon" ? "opacity-70" : ""}`}>
                                <p className="flex flex-wrap items-center gap-2 font-display font-bold normal-case">
                                    {addon.name}
                                    {addon.status === "coming-soon" && <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-mist">Coming soon</span>}
                                </p>
                                <p className="text-sm text-mist">{addon.blurb}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-line bg-surface">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14">
                    <div className="grid gap-2">
                        <h2 className="font-display text-2xl font-bold normal-case">How it compares</h2>
                        <p className="max-w-2xl text-sm text-mist">Typical list prices for the alternatives a Jamaican small business considers.</p>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-line bg-paper">
                        <table className="w-full min-w-[36rem] text-left text-sm">
                            <thead>
                                <tr className="border-b border-line text-xs uppercase tracking-wide text-mist">
                                    <th className="px-4 py-3 font-semibold">Option</th>
                                    <th className="px-4 py-3 font-semibold">Price</th>
                                    <th className="px-4 py-3 font-semibold">What you actually get</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisons.map((row, rowIndex) => (
                                    <tr key={row.name} className={`border-b border-line/60 last:border-0 ${rowIndex === 0 ? "bg-cobalt/5 font-semibold" : ""}`}>
                                        <td className="px-4 py-3">{row.name}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{row.price}</td>
                                        <td className="px-4 py-3 text-mist">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="border-t border-line">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14">
                    <h2 className="font-display text-2xl font-bold normal-case">Billing questions</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {billingFaq.map(item => (
                            <details key={item.q} className="group rounded-xl border border-line bg-surface p-5">
                                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 font-display font-bold normal-case">
                                    {item.q}
                                    <span aria-hidden className="text-cobalt transition-transform group-open:rotate-45">+</span>
                                </summary>
                                <p className="pt-3 text-sm leading-relaxed text-mist">{item.a}</p>
                            </details>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-ink p-6 text-white">
                        <p className="font-display text-xl font-bold">Ready when you are.</p>
                        <p className="text-sm text-white/70">Claim your name now, pay when you go live.</p>
                        <Link href="/sites/start" className="ml-auto rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-white hover:text-ink">
                            Start my site
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
