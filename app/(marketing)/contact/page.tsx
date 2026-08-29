import React from "react"
import type { Metadata } from "next"
import ContactForm from "@/components/contactForm/ContactForm"

export const metadata: Metadata = {
    title: "Contact | Squaremax",
    description: "Ask about a hosted Squaremax page from $5/month, or a flat-price custom build. A human — the developer — answers.",
}

const answers: { title: string; body: string }[] = [
    { title: "Hosted page", body: "You want a page at squaremaxtech.com/your-business with booking, notifications or inventory. Tell me the business and I'll point you at the right add-ons." },
    { title: "Custom build", body: "You need something bespoke — a full site or app at a flat price. Send the goal and any deadline." },
    { title: "Already a client", body: "Content changes, billing questions, a new page. Say which site and what you need." },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-4xl gap-4 px-4 py-16">
                    <h1 className="font-display text-display-l font-bold">Let&apos;s talk.</h1>

                    <p className="max-w-2xl text-lg text-mist">
                        Tell me what you&apos;re building and I&apos;ll reply within 1 business day — no sales pipeline,
                        no ticket queue, just the developer who does the work.
                    </p>
                </div>
            </section>

            <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr]">
                <ContactForm />

                <aside className="grid content-start gap-6">
                    <div className="grid gap-4">
                        {answers.map(eachAnswer => (
                            <div key={eachAnswer.title} className="grid gap-1 border-l-2 border-cobalt pl-4">
                                <h2 className="font-display text-lg font-bold">{eachAnswer.title}</h2>
                                <p className="text-sm text-mist">{eachAnswer.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-2 rounded-lg border border-line bg-surface p-5">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Rather email?</p>
                        <a className="font-display text-lg font-bold text-cobalt hover:underline" href="mailto:info@squaremaxtech.com">
                            info@squaremaxtech.com
                        </a>
                        <p className="text-sm text-mist">Built in Jamaica, shipped worldwide.</p>
                    </div>
                </aside>
            </div>
        </main>
    )
}
