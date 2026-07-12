import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import Configurator from "@/components/marketing/Configurator"
import { projectsData } from "@/lib/projectsData"

export const metadata: Metadata = {
  title: "Squaremax — Custom websites from $1,000 flat. Business pages from $10/month.",
}

export default function Page() {
  return (
    <main className="bg-paper text-ink">
      {/* hero */}
      <section className="blueprintGrid border-b border-line !p-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:py-28">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight normal-case md:text-6xl">
            Custom websites from <span className="text-brand">$1,000 flat</span>.
            Hosted business pages from <span className="text-cobalt">$10/month</span>.
          </h1>

          <p className="max-w-xl text-lg text-mist">
            Fixed price. Fixed scope. Days, not months. Pick your path:
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#configurator"
              className="rounded-lg bg-brand px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep"
            >
              See my price
            </a>
            <Link
              href="/sites"
              className="rounded-lg border-2 border-ink px-6 py-3.5 font-display text-lg font-bold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Launch my page
            </Link>
          </div>
        </div>
      </section>

      {/* two paths */}
      <section className="!p-0">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2">
          <Link href="/custom-builds" className="cornerTicks group grid content-start gap-3 rounded-xl border border-line bg-surface p-8 transition-shadow hover:shadow-lg">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Custom Builds</p>
            <h2 className="font-display text-2xl font-bold normal-case">A website built for your business, at a flat price</h2>
            <p className="text-mist">
              Pick your features, see your exact price before we start — $1,000, $3,500 or $6,500.
              No hourly billing. No surprises. Live in days.
            </p>
            <span className="font-semibold text-brand group-hover:underline">Configure my build →</span>
          </Link>

          <Link href="/sites" className="cornerTicks group grid content-start gap-3 rounded-xl border border-line bg-surface p-8 transition-shadow hover:shadow-lg">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-cobalt">Squaremax Sites</p>
            <h2 className="font-display text-2xl font-bold normal-case">Your business page, live tonight — $10/month</h2>
            <p className="text-mist">
              Fill in your details, pick a design you like with your real content in it,
              and go live at squaremaxtech.com/your-business. Add booking, galleries and more for $10/month each.
            </p>
            <span className="font-semibold text-cobalt group-hover:underline">Launch my page →</span>
          </Link>
        </div>
      </section>

      {/* the signature: live pricing configurator */}
      <section id="configurator" className="border-y border-line bg-surface !p-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">Price your build right now</h2>
            <p className="max-w-2xl text-mist">
              Every service priced like an agency would — then one flat tier price replaces the total.
              What you pick is what I build. Nothing more to negotiate.
            </p>
          </div>

          <Configurator />
        </div>
      </section>

      {/* quiet proof strip */}
      <section className="!p-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12 text-sm text-mist">
          <p><span className="font-display text-2xl font-bold text-ink">{projectsData.length}+</span> live projects</p>
          <p><span className="font-display text-2xl font-bold text-ink">1</span> point of contact — the developer</p>
          <p><span className="font-display text-2xl font-bold text-ink">100%</span> code ownership, always</p>
          <Link href="/projects" className="font-semibold text-ink underline-offset-4 hover:underline">See the work →</Link>
        </div>
      </section>
    </main>
  )
}
