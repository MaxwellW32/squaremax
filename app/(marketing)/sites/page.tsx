import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { BASE_MONTHLY_PRICE } from "@/lib/sites/addons"

export const metadata: Metadata = {
    title: "How it works — your business website in 15 minutes | Squaremax",
    description: "Claim your name, pick a template, add your details, switch on booking or orders, pay and share. Edit anything yourself from your phone.",
}

const onboardingSteps: { title: string; body: string }[] = [
    { title: "Claim your name", body: "Type your business name and see your address instantly: squaremaxtech.com/joes-barbershop. If it's free, it's yours." },
    { title: "Pick a starting point", body: "A template is copied into your site piece by piece, with your name already in it. Pick a theme — any theme fits any layout." },
    { title: "Add your details", body: "Phone, WhatsApp, email, address. Every section of your site reads them from one place, so you never retype." },
    { title: "Choose your tools", body: "Online booking, notifications, an online store, a custom domain. US$5 each, bundles apply themselves, switch on and off any time." },
    { title: "Pay & share", body: "Your first month publishes the site. You get a QR code for the counter and a link for your Instagram bio and WhatsApp profile." },
]

const afterLaunch: { title: string; body: string }[] = [
    { title: "Tap to edit", body: "Your live site is the editor. Tap the hero, the menu, the hours — change the words, swap the design, upload a photo from your camera roll." },
    { title: "Run the day from your phone", body: "New orders, bookings to confirm and unread messages are the first thing you see. Tap to call or WhatsApp the customer." },
    { title: "Know your numbers", body: "With the store tool: sales, tax collected, cost of goods, profit, all exportable for your accountant." },
    { title: "Pay only when you want to", body: "Prepaid by the month or the year. We remind you before a period ends; we never charge your card on our own." },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:py-24">
                    <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight normal-case md:text-5xl">
                        From nothing to a live site in about 15 minutes.
                    </h1>

                    <p className="max-w-2xl text-lg text-mist">
                        No designer, no waiting, no jargon. Here&apos;s exactly what happens when you press start.
                    </p>

                    <p className="w-fit rounded-lg border border-line bg-surface px-4 py-2.5 font-mono text-sm md:text-base">
                        squaremaxtech.com/<span className="font-bold text-cobalt">your-business</span>
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/sites/start"
                            className="rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-ink"
                        >
                            Start my site
                        </Link>
                        <Link
                            href="/pricing"
                            className="rounded-lg border-2 border-ink px-6 py-3.5 font-display text-lg font-bold text-ink transition-colors hover:bg-ink hover:text-white"
                        >
                            See pricing
                        </Link>
                    </div>
                </div>
            </section>

            <section id="how-it-works">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">Five steps to live</h2>
                        <p className="max-w-2xl text-mist">You can stop and come back at any step — your draft is saved.</p>
                    </div>

                    <ol className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                        {onboardingSteps.map((eachStep, eachStepIndex) => (
                            <li key={eachStep.title} className="grid content-start gap-2 rounded-lg border border-line bg-surface p-5">
                                <span className="grid size-8 place-items-center rounded-md bg-cobalt font-display text-sm font-bold text-white">
                                    {eachStepIndex + 1}
                                </span>
                                <h3 className="font-display font-bold leading-snug normal-case">{eachStep.title}</h3>
                                <p className="text-sm text-mist">{eachStep.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="border-t border-line bg-surface">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">After you&apos;re live</h2>
                        <p className="max-w-2xl text-mist">Your dashboard is built for one hand and a busy day.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {afterLaunch.map(item => (
                            <div key={item.title} className="grid content-start gap-2 rounded-lg border border-line bg-paper p-5">
                                <h3 className="font-display font-bold normal-case">{item.title}</h3>
                                <p className="text-sm text-mist">{item.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-ink p-6 text-white md:flex md:items-center md:justify-between">
                        <div className="grid gap-1">
                            <p className="font-display text-xl font-bold">From US${BASE_MONTHLY_PRICE}/month. Pay when you go live.</p>
                            <p className="text-sm text-white/70">No setup fee, no contract. Your page pauses politely if you stop — never a broken link.</p>
                        </div>
                        <Link
                            href="/sites/start"
                            className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-white hover:text-ink"
                        >
                            Start my site
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
