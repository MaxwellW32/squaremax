import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Care Plan — $100/month | Squaremax",
    description: "After your 30 days of included support: hosting management, updates, security patches, and up to 1 hour of small changes every month.",
}

const included: { title: string; body: string }[] = [
    { title: "Hosting management", body: "Server, domain and SSL stay healthy — I watch them so you don't." },
    { title: "Updates & security patches", body: "Dependencies and platform updates applied promptly and tested." },
    { title: "1 hour of changes monthly", body: "Copy tweaks, new photos, a new section — small changes, done within days." },
    { title: "Priority answers", body: "Direct line to the developer who built your site. No ticket queue." },
]

export default function Page() {
    const mailto = "mailto:info@squaremaxtech.com?subject=Care%20Plan%20signup&body=Hi%20Maxwell%2C%20I%27d%20like%20to%20start%20the%20Care%20Plan%20for%20my%20site%3A%20"

    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-4xl gap-4 px-4 py-16">
                    <h1 className="font-display text-4xl font-bold normal-case">
                        Care Plan — <span className="text-brand">$100/month</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-mist">
                        Your build includes 30 days of support. After that, the Care Plan keeps your site
                        hosted, updated and evolving — or take a clean handoff and run it yourself. No lock-in, ever.
                    </p>
                </div>
            </section>

            <section>
                <div className="mx-auto grid max-w-4xl gap-8 px-4 py-14">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {included.map(item => (
                            <div key={item.title} className="grid content-start gap-1.5 rounded-lg border border-line bg-surface p-5">
                                <h2 className="font-display font-bold normal-case">{item.title}</h2>
                                <p className="text-sm text-mist">{item.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-ink p-6 text-white">
                        <p className="font-display text-xl font-bold">Ready to start?</p>
                        <p className="text-sm text-white/70">
                            Email me and I&apos;ll set up your plan and send your first payment link the same day.
                        </p>
                        <a href={mailto} className="rounded-lg bg-brand px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep">
                            Start my Care Plan
                        </a>
                    </div>

                    <p className="text-sm text-mist">
                        Prefer full handoff instead? You get the code, docs and deployment — everything you need to run it yourself.
                        You own it all either way.
                    </p>
                </div>
            </section>
        </main>
    )
}
