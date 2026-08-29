import React from "react"
import type { Metadata } from "next"
import Configurator from "@/components/marketing/Configurator"

export const metadata: Metadata = {
    title: "Custom Builds — flat-price websites | Squaremax",
    description: "Pick your features, see your flat price instantly: $1,000, $3,500 or $6,500. Fixed scope, two revision rounds, 30 days of support, you own everything.",
}

const processSteps: { title: string; timing: string; body: string }[] = [
    {
        title: "Configure & book",
        timing: "Day 0",
        body: "Pick your features, see your flat price, submit the intake form. I reply within 1 business day with any clarifying questions and a start date.",
    },
    {
        title: "Kickoff call",
        timing: "~30 minutes",
        body: "One call. We lock scope, you send content (logo, copy, images — I provide a simple checklist), and a 50% deposit secures the slot.",
    },
    {
        title: "Build",
        timing: "Launch: 3–5 business days · Business: 1–2 weeks · Pro: 2–3 weeks",
        body: "I build the whole thing and send you a live preview link. No meetings unless you want one — you get progress updates, not calendar invites.",
    },
    {
        title: "Review & refine",
        timing: "2–4 days",
        body: "You click through the real site and send feedback. Two revision rounds included. Remaining 50% due on approval.",
    },
    {
        title: "Launch + 30 days of support",
        timing: "Then it's yours",
        body: "I deploy to your domain, hand over credentials and docs, and stay on call for a month. Then Care Plan or clean handoff — your choice.",
    },
]

const engagementTerms: { title: string; body: string }[] = [
    {
        title: "Fixed scope",
        body: "Your configurator selections are the project scope. Anything outside them is new, separately quoted work.",
    },
    {
        title: "One point of contact",
        body: "You work directly with me, start to finish. No account managers, no committees.",
    },
    {
        title: "Two revision rounds",
        body: "On design and content, included. Additional rounds are a flat $250 per round.",
    },
    {
        title: "30 days post-launch support",
        body: "Bug fixes, small tweaks, and “how do I…” questions — included in every tier.",
    },
    {
        title: "After 30 days",
        body: "Either a Care Plan ($100/mo — hosting management, updates, security patches, up to 1 hr of small changes monthly) or full handoff. No lock-in.",
    },
    {
        title: "You own everything",
        body: "Code, design, domain, accounts. Always.",
    },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16">
                    <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight normal-case md:text-5xl">
                        Pick your features. <span className="text-brand">See your flat price.</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-mist">
                        Every service below is priced at its market rate. Your selections map to one flat tier —
                        $1,000, $3,500 or $6,500 — so a full build always costs less than the itemized list. No hourly billing, no surprises.
                    </p>
                </div>
            </section>

            <section id="configurator" className="bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-14">
                    <Configurator />
                </div>
            </section>

            {/* how it works */}
            <section id="how-it-works" className="border-t border-line">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">How it works</h2>
                        <p className="max-w-2xl text-mist">Five steps, no agency theater. You always know what happens next.</p>
                    </div>

                    <ol className="grid gap-0">
                        {processSteps.map((eachStep, eachStepIndex) => (
                            <li key={eachStep.title} className="grid grid-cols-[auto_1fr] gap-x-5">
                                <div className="grid justify-items-center">
                                    <span className="grid size-9 place-items-center rounded-md bg-ink font-display text-sm font-bold text-white">
                                        {eachStepIndex + 1}
                                    </span>
                                    {eachStepIndex < processSteps.length - 1 && (
                                        <span aria-hidden className="w-0.5 grow bg-line" />
                                    )}
                                </div>

                                <div className="grid content-start gap-1 pb-8">
                                    <div className="flex flex-wrap items-baseline gap-x-3">
                                        <h3 className="font-display text-xl font-bold normal-case">{eachStep.title}</h3>
                                        <span className="text-sm font-semibold text-cobalt">{eachStep.timing}</span>
                                    </div>
                                    <p className="max-w-2xl text-mist">{eachStep.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* engagement terms */}
            <section className="border-t border-line bg-surface">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16">
                    <div className="grid gap-2">
                        <h2 className="font-display text-3xl font-bold normal-case">Every build includes exactly this</h2>
                        <p className="max-w-2xl text-mist">
                            Scope is fixed before work begins — that&apos;s what makes a flat price honest.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {engagementTerms.map(eachTerm => (
                            <div key={eachTerm.title} className="grid content-start gap-2 rounded-lg border border-line bg-paper p-5">
                                <h3 className="font-display font-bold normal-case">{eachTerm.title}</h3>
                                <p className="text-sm text-mist">{eachTerm.body}</p>
                            </div>
                        ))}
                    </div>

                    <a
                        href="#configurator"
                        className="w-fit rounded-lg bg-brand px-6 py-3.5 font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep"
                    >
                        See my price
                    </a>
                </div>
            </section>
        </main>
    )
}
