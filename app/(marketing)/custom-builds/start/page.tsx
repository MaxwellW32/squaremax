import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { computeQuote, serviceIdSchema, servicesById, tiersById, usd, ServiceId } from "@/lib/pricing/catalog"
import IntakeForm from "@/components/marketing/IntakeForm"

export const metadata: Metadata = {
    title: "Start my build | Squaremax",
}

export default async function Page({ searchParams }: { searchParams: Promise<{ services?: string }> }) {
    const { services: servicesParam } = await searchParams

    const parsed = serviceIdSchema.array().min(1).safeParse((servicesParam ?? "").split(",").filter(Boolean))

    if (!parsed.success) {
        return (
            <main className="mx-auto grid max-w-2xl gap-4 px-4 py-20 text-ink">
                <h1 className="font-display text-3xl font-bold normal-case">No build configured yet</h1>
                <p className="text-mist">Pick your features first — it takes about a minute.</p>
                <Link href="/custom-builds" className="w-fit rounded-lg bg-brand px-6 py-3 font-display font-bold text-white hover:bg-brand-deep">
                    Configure my build
                </Link>
            </main>
        )
    }

    const selected: ServiceId[] = parsed.data
    const quote = computeQuote(selected)
    const tier = tiersById[quote.tierId]

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[1fr_360px]">
                <div className="grid content-start gap-6">
                    <div className="grid gap-2">
                        <h1 className="font-display text-3xl font-bold normal-case md:text-4xl">
                            Book your <span className="text-brand">{tier.name}</span> build
                        </h1>
                        <p className="text-mist">
                            Submit this and I reply within 1 business day with any clarifying questions and your start date.
                            Nothing is billed until we lock scope on the kickoff call.
                        </p>
                    </div>

                    <IntakeForm services={selected} />
                </div>

                <aside className="h-fit lg:sticky lg:top-24">
                    <div className="cornerTicks grid gap-3 rounded-xl border border-line bg-ink p-6 text-white">
                        <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-semibold uppercase tracking-widest text-white/60">Your selection</span>
                            <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold">{tier.name}</span>
                        </div>

                        <ul className="grid gap-1.5 text-sm text-white/80">
                            {quote.selected.map(id => (
                                <li key={id} className="flex items-baseline justify-between gap-3">
                                    {servicesById[id].label}
                                    <span className="tabularNums text-white/50">{usd.format(servicesById[id].price)}</span>
                                </li>
                            ))}
                        </ul>

                        <dl className="grid gap-1.5 border-t border-white/15 pt-3 text-sm">
                            <div className="flex justify-between text-white/70">
                                <dt>Itemized value</dt>
                                <dd className="tabularNums">{usd.format(quote.subtotal)}</dd>
                            </div>
                            {quote.discount > 0 && (
                                <div className="flex justify-between text-emerald-300">
                                    <dt>Flat-rate discount</dt>
                                    <dd className="tabularNums">−{usd.format(quote.discount)}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="flex items-baseline justify-between border-t border-white/15 pt-3">
                            <span className="font-display font-semibold">Flat price</span>
                            <span className="tabularNums font-display text-3xl font-bold">{usd.format(quote.tierPrice)}</span>
                        </div>

                        <Link href="/custom-builds" className="text-center text-sm text-white/60 underline-offset-4 hover:underline">
                            Change my selection
                        </Link>
                    </div>
                </aside>
            </div>
        </main>
    )
}
