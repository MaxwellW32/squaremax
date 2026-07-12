import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { addons, BASE_MONTHLY_PRICE } from "@/lib/sites/addons"

export const metadata: Metadata = {
    title: "Squaremax Sites — your business page, live tonight. $10/month.",
    description: "Fill in your business details, pick a design with your real content in it, and go live at squaremaxtech.com/your-business. Add booking, galleries and more for $10/month each.",
}

const onboardingSteps: { title: string; body: string }[] = [
    { title: "Claim your name", body: "Pick your business name and see your address instantly: squaremaxtech.com/joes-barbershop." },
    { title: "Tell us about your business", body: "Services, hours, location, contact, photos. Save as you go — nothing is lost." },
    { title: "Pick your look", body: "Flip through designs with YOUR content already in them. Any color theme works with any layout." },
    { title: "Choose add-ons", body: `Booking, email notifications, custom domain — $10/month each. Your total updates live.` },
    { title: "Go live", body: "Pay, and your page is live with a QR code to share. Edit anything, anytime, from your dashboard." },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line !p-0">
                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:py-24">
                    <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight normal-case md:text-5xl">
                        Your business page, live tonight.
                        <span className="text-cobalt"> ${BASE_MONTHLY_PRICE}/month.</span>
                    </h1>

                    <p className="max-w-2xl text-lg text-mist">
                        No web designer, no waiting. Fill in your details, pick a design you like with your
                        real content in place, and share one link:
                    </p>

                    <p className="w-fit rounded-lg border border-line bg-surface px-4 py-2.5 font-mono text-sm md:text-base">
                        squaremaxtech.com/<span className="font-bold text-cobalt">your-business</span>
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/sites/start"
                            className="rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-ink"
                        >
                            Launch my page
                        </Link>
                        <a
                            href="#how-it-works"
                            className="rounded-lg border-2 border-ink px-6 py-3.5 font-display text-lg font-bold text-ink transition-colors hover:bg-ink hover:text-white"
                        >
                            See how it works
                        </a>
                    </div>
                </div>
            </section>

            {/* how it works */}
            <section id="how-it-works" className="!p-0">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">Five steps to live</h2>
                        <p className="max-w-2xl text-mist">Most businesses finish in under 20 minutes.</p>
                    </div>

                    <ol className="grid gap-4 md:grid-cols-5">
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

            {/* add-ons */}
            <section className="border-t border-line bg-surface !p-0">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">Add exactly what your business needs</h2>
                        <p className="max-w-2xl text-mist">
                            Every add-on is ${BASE_MONTHLY_PRICE}/month. Turn them on or off anytime — billing adjusts automatically.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {addons.map(eachAddon => (
                            <div key={eachAddon.id} className="grid content-start gap-2 rounded-lg border border-line bg-paper p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-display font-bold normal-case">{eachAddon.name}</h3>
                                    {eachAddon.status === "coming-soon" && (
                                        <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-semibold text-mist">Coming soon</span>
                                    )}
                                </div>
                                <p className="text-sm text-mist">{eachAddon.blurb}</p>
                                <p className="text-sm font-bold text-cobalt">${eachAddon.monthlyPrice}/mo</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-ink p-6 text-white md:flex md:items-center md:justify-between">
                        <div className="grid gap-1">
                            <p className="font-display text-xl font-bold">Base page + 2 add-ons = ${BASE_MONTHLY_PRICE * 3}/month</p>
                            <p className="text-sm text-white/70">Cancel anytime. Your page pauses politely — never a broken link.</p>
                        </div>
                        <Link
                            href="/sites/start"
                            className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-white hover:text-ink"
                        >
                            Launch my page
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
