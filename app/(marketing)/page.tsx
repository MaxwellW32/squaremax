import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { BASE_MONTHLY_PRICE } from "@/lib/sites/addons"
import { siteTemplates } from "@/lib/sites/siteTemplates"
import { themes } from "@/lib/sites/themes"
import PlanCards from "@/components/marketing/PlanCards"

export const metadata: Metadata = {
  title: "Squaremax — your business online tonight. Website, bookings & orders from US$10/month.",
  description: "Jamaican small businesses get a professional website at squaremaxtech.com/your-business, with online booking, WhatsApp-friendly orders and customer messaging. From US$10/month, no designer, no contract.",
}

const outcomes: { title: string; body: string; emoji: string }[] = [
  { emoji: "📅", title: "Bookings fill themselves", body: "Set your hours once. Customers pick a free slot from their phone at 11pm; you get the alert, they get the confirmation. No double-bookings, no back-and-forth." },
  { emoji: "🛍️", title: "Orders land in your pocket", body: "List your products, and customers order straight from your site. You get the order by email and WhatsApp, confirm it, and take payment your way — cash, transfer, Lynk." },
  { emoji: "💬", title: "Your customers, your list", body: "People sign up on your site, not a marketplace. Message them about specials and holiday hours by email or WhatsApp whenever you like." },
]

const steps = [
  { title: "Claim your name", body: "squaremaxtech.com/your-business, checked instantly." },
  { title: "Pick a look", body: "A template with your name already in it. Any theme fits." },
  { title: "Add your details", body: "Phone, WhatsApp, hours — typed once, used everywhere." },
  { title: "Choose your tools", body: "Booking, orders, messaging — switch on what you need." },
  { title: "Pay & share", body: "Live in a minute, with a QR code for the counter." },
]

const faqs: { q: string; a: string }[] = [
  { q: "Do I need my own domain?", a: "No. Your site is live at squaremaxtech.com/your-business from day one. Want yourbusiness.com? Add the Custom domain tool for US$5/month, buy the domain from any registrar, and we handle the rest, SSL included." },
  { q: "How do customers pay me for orders?", a: "However you already take money: cash on pickup, bank transfer, Lynk, or your card machine. Orders arrive in your dashboard with the customer's phone number, you confirm, they pay. Online card payments on your own merchant account are on the roadmap." },
  { q: "Can I change my site myself?", a: "Yes, and it's the whole point. Tap any part of your site in the dashboard to edit it, swap a section's design without losing your words, upload photos from your phone. No designer needed, ever." },
  { q: "What if I stop paying?", a: "Nothing dramatic. You prepay a month (or a year) at a time and we never charge your card automatically. If a period ends, your site stays up for 7 more days, then shows a polite 'taking a break' page until you renew. Nothing is deleted." },
  { q: "Is there a contract or setup fee?", a: "Neither. Pay for a month, use it, decide. If you'd rather we set the whole site up for you, ask about the concierge setup." },
  { q: "Who do I talk to when I need help?", a: "The developer who built it. Email info@squaremaxtech.com or WhatsApp, and a person answers, usually the same day." },
]

export default function Page() {
  return (
    <main className="bg-paper text-ink">
      {/* hero */}
      <section className="blueprintGrid border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:py-28">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Built in Jamaica for small businesses</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight normal-case md:text-6xl">
            Your business, <span className="text-cobalt">online tonight.</span>
          </h1>
          <p className="max-w-xl text-lg text-mist">
            A professional website at <span className="font-mono text-ink">squaremaxtech.com/your-business</span>, with
            online booking, orders and customer messaging built in. From <span className="font-semibold text-ink">US${BASE_MONTHLY_PRICE}/month</span>.
            No designer, no contract, edit it yourself from your phone.
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
          <p className="text-sm text-mist">Takes about 15 minutes. Pay only when you&apos;re ready to go live.</p>
        </div>
      </section>

      {/* outcomes */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">Not just a website — the whole front desk</h2>
            <p className="max-w-2xl text-mist">Everything a barber, restaurant, salon or shop needs to take business online without hiring anyone.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {outcomes.map(item => (
              <div key={item.title} className="grid content-start gap-2 rounded-xl border border-line bg-paper p-6">
                <span aria-hidden className="text-3xl">{item.emoji}</span>
                <h3 className="font-display text-lg font-bold normal-case">{item.title}</h3>
                <p className="text-sm text-mist">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-paper p-5 text-sm">
            <span className="font-semibold">See it running:</span>
            <Link href="/fade-district" className="font-mono text-cobalt underline-offset-4 hover:underline">/fade-district — barbershop with booking</Link>
            <Link href="/pepper-and-thyme" className="font-mono text-cobalt underline-offset-4 hover:underline">/pepper-and-thyme — restaurant with a shop</Link>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">Simple prices, in US dollars</h2>
            <p className="max-w-2xl text-mist">
              Less than a Wix or Squarespace plan, with the booking and ordering tools those charge extra for. Pick a plan or build your own from US${BASE_MONTHLY_PRICE}.
            </p>
          </div>
          <PlanCards />
        </div>
      </section>

      {/* how the builder works */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-bold normal-case">A website you can actually change</h2>
            <p className="max-w-2xl text-mist">
              Start from a template. Then tap any part of your site to edit it, swap a section for a different design and your words stay put, upload photos straight from your phone.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid content-start gap-2 rounded-xl border border-line bg-paper p-6">
              <h3 className="font-display text-lg font-bold normal-case">Built from swappable pieces</h3>
              <p className="text-sm text-mist">Navbar, hero, menu, gallery, reviews, booking, shop, footer: 40+ designs. Change any piece&apos;s look without retyping a thing.</p>
            </div>
            <div className="grid content-start gap-2 rounded-xl border border-line bg-paper p-6">
              <h3 className="font-display text-lg font-bold normal-case">One theme, whole site</h3>
              <p className="text-sm text-mist">Colors and fonts apply everywhere from one place, so it always matches. Fine-tune any single section when you want it to pop.</p>
            </div>
            <div className="grid content-start gap-2 rounded-xl border border-line bg-paper p-6">
              <h3 className="font-display text-lg font-bold normal-case">Up to 5 pages</h3>
              <p className="text-sm text-mist">Home, about, menu, gallery, contact. Your phone number and hours are typed once and every page reads them.</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-line bg-paper p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-mist">Starting points</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {siteTemplates.filter(template => template.id !== "blank").map(template => (
                <p key={template.id} className="text-sm"><span className="font-display font-bold">{template.name}</span> <span className="text-mist">— {template.description}</span></p>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
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

      {/* how it works */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16">
          <h2 className="font-display text-3xl font-bold normal-case">Live in five steps</h2>
          <ol className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            {steps.map((step, stepIndex) => (
              <li key={step.title} className="grid content-start gap-1.5 rounded-xl border border-line bg-surface p-4">
                <span className="font-display text-2xl font-bold text-cobalt">{stepIndex + 1}</span>
                <span className="text-sm font-semibold">{step.title}</span>
                <span className="text-xs text-mist">{step.body}</span>
              </li>
            ))}
          </ol>
          <Link
            href="/sites/start"
            className="w-fit rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-ink"
          >
            Start my site — from US${BASE_MONTHLY_PRICE}/month
          </Link>
        </div>
      </section>

      {/* faq */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16">
          <h2 className="font-display text-3xl font-bold normal-case">Questions people ask</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map(item => (
              <details key={item.q} className="group rounded-xl border border-line bg-paper p-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 font-display font-bold normal-case">
                  {item.q}
                  <span aria-hidden className="text-cobalt transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pt-3 text-sm leading-relaxed text-mist">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* custom builds — the studio, on its own page */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">Need more than a template?</p>
            <h2 className="font-display text-2xl font-bold normal-case">Fully custom websites and apps, flat price — from US$1,000</h2>
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
