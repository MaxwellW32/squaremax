import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { addons, BASE_MONTHLY_PRICE } from "@/lib/sites/addons"
import { siteTemplates } from "@/lib/sites/siteTemplates"
import { themes } from "@/lib/sites/themes"

export const metadata: Metadata = {
  title: "Squaremax — your business website + booking, notifications & inventory. $5/month per piece.",
  description: "Launch a beautiful small-business website at squaremaxtech.com/your-business tonight. Add online booking, customer notifications and inventory tracking for $5/month each.",
}

const builderPoints: { title: string; body: string }[] = [
  {
    title: "Built from swappable pieces",
    body: "Your site is a stack of components — navbar, hero, gallery, testimonials, footer. Swap any piece for a different design and your words, photos and prices stay exactly where they were.",
  },
  {
    title: "Your content is yours, per piece",
    body: "Every component on your site keeps its own content. Two navbars? Each has its own menus. Move a section to another page and it takes everything with it.",
  },
  {
    title: "One theme, whole site",
    body: "Colors and fonts apply site-wide from one place, so everything always matches — and any single component can override them when you want it to stand out.",
  },
  {
    title: "Up to 5 pages",
    body: "Home, about, menu, gallery, contact — arrange components on each page from your dashboard, with a live preview as you type.",
  },
]

const steps = ["Claim your name", "Pick a starting point", "Tell us about your business", "Choose add-ons", "Pay & go live"]

export default function Page() {
  return (
    <main className="bg-paper text-ink">
      {/* hero */}
      <section className="blueprintGrid border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:py-28">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight normal-case md:text-6xl">
            Your business online <span className="text-cobalt">tonight</span> —
            website, booking, notifications & inventory, <span className="text-brand">${BASE_MONTHLY_PRICE}/month</span> a piece.
          </h1>

          <p className="max-w-xl text-lg text-mist">
            A beautiful website at <span className="font-mono text-ink">squaremaxtech.com/your-business</span>,
            plus the tools that actually run the business. Start with ${BASE_MONTHLY_PRICE}/month, add what you need.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sites/start"
              className="rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-ink"
            >
              Start my site
            </Link>
            <Link
              href="/fade-district"
              className="rounded-lg border-2 border-ink px-6 py-3.5 font-display text-lg font-bold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              See a live site →
            </Link>
          </div>
        </div>
      </section>

      {/* the modules: $5 base + $5 add-ons */}
      <section id="pricing" className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">Pay for exactly what you use</h2>
            <p className="max-w-2xl text-mist">
              The website is ${BASE_MONTHLY_PRICE}/month. Every tool is +$5/month, switched on or off from your
              dashboard anytime — billing follows automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="cornerTicks grid content-start gap-2 rounded-xl border-2 border-cobalt bg-paper p-6">
              <p className="flex items-baseline gap-2 font-display text-lg font-bold normal-case">
                Beautiful website <span className="text-sm font-semibold text-cobalt">${BASE_MONTHLY_PRICE}/mo</span>
              </p>
              <p className="text-sm text-mist">
                Up to 5 pages built from swappable components, professional themes, hosting and SSL included.
                Live at squaremaxtech.com/your-business.
              </p>
            </div>

            {addons.map(addon => (
              <div key={addon.id} className={`cornerTicks grid content-start gap-2 rounded-xl border border-line bg-paper p-6 ${addon.status === "coming-soon" ? "opacity-70" : ""}`}>
                <p className="flex items-baseline gap-2 font-display text-lg font-bold normal-case">
                  {addon.name} <span className="text-sm font-semibold text-cobalt">+${addon.monthlyPrice}/mo</span>
                  {addon.status === "coming-soon" && <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-mist">Soon</span>}
                </p>
                <p className="text-sm text-mist">{addon.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how the builder works */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">A website you can actually change</h2>
            <p className="max-w-2xl text-mist">
              No blank page, no locked-in layout. Start from a template, then reshape every piece from your dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {builderPoints.map(point => (
              <div key={point.title} className="grid content-start gap-2 rounded-xl border border-line bg-surface p-6">
                <h3 className="font-display text-lg font-bold normal-case">{point.title}</h3>
                <p className="text-sm text-mist">{point.body}</p>
              </div>
            ))}
          </div>

          {/* templates + themes strip */}
          <div className="grid gap-3 rounded-xl border border-line bg-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-mist">Starting points</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {siteTemplates.map(template => (
                <p key={template.id} className="text-sm"><span className="font-display font-bold">{template.name}</span> <span className="text-mist">— {template.description}</span></p>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm font-semibold uppercase tracking-widest text-mist">Themes</span>
              {themes.map(theme => (
                <span key={theme.id} title={theme.name} className="grid size-7 place-items-center rounded-full border border-line" style={{ backgroundColor: theme.colors.background }}>
                  <span className="size-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                </span>
              ))}
              <span className="text-sm text-mist">— any theme fits any layout</span>
            </div>
          </div>
        </div>
      </section>

      {/* business tools narrative */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <h2 className="font-display text-3xl font-bold normal-case">Not just a website — the whole front desk</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid content-start gap-2">
              <h3 className="font-display font-bold normal-case">Customers get accounts on <em>your</em> site</h3>
              <p className="text-sm text-mist">
                People sign up on your page — your customer list, no one else&apos;s. They track their bookings,
                opt into your updates, and you can message them by email or WhatsApp.
              </p>
            </div>
            <div className="grid content-start gap-2">
              <h3 className="font-display font-bold normal-case">Bookings that confirm themselves</h3>
              <p className="text-sm text-mist">
                Set your weekly hours once; customers pick a free slot. Double-bookings are impossible and
                confirmations go out automatically.
              </p>
            </div>
            <div className="grid content-start gap-2">
              <h3 className="font-display font-bold normal-case">Know your stock and your taxes</h3>
              <p className="text-sm text-mist">
                Track products, record sales at the counter, and see revenue and tax collected this month —
                plus a shop section on your site with WhatsApp ordering.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-paper p-5 text-sm">
            <span className="font-semibold">See it running:</span>
            <Link href="/fade-district" className="font-mono text-cobalt underline-offset-4 hover:underline">/fade-district — barbershop with booking</Link>
            <Link href="/pepper-and-thyme" className="font-mono text-cobalt underline-offset-4 hover:underline">/pepper-and-thyme — restaurant with a shop</Link>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16">
          <h2 className="font-display text-3xl font-bold normal-case">Live in five steps</h2>
          <ol className="grid gap-3 md:grid-cols-5">
            {steps.map((step, stepIndex) => (
              <li key={step} className="grid content-start gap-1.5 rounded-xl border border-line bg-surface p-4">
                <span className="font-display text-2xl font-bold text-cobalt">{stepIndex + 1}</span>
                <span className="text-sm font-semibold">{step}</span>
              </li>
            ))}
          </ol>
          <Link
            href="/sites/start"
            className="w-fit rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-ink"
          >
            Start my site — ${BASE_MONTHLY_PRICE}/month
          </Link>
        </div>
      </section>

      {/* custom builds — the studio, on its own page */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Need more than a template?</p>
            <h2 className="font-display text-2xl font-bold normal-case">Fully custom websites, flat price — from $1,000</h2>
            <p className="max-w-2xl text-sm text-mist">
              For businesses that need bespoke design and functionality: pick your features, see your exact
              price before we start, live in days. Fixed scope, you own everything.
            </p>
          </div>
          <Link
            href="/custom-builds"
            className="w-fit rounded-lg border-2 border-ink px-6 py-3 font-display font-bold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Explore Custom Builds →
          </Link>
        </div>
      </section>
    </main>
  )
}
