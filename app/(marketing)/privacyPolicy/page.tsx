import React from "react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy | Squaremax",
    description: "What Squaremax stores, why, and who can see it — for site owners and for the customers of the businesses hosted here.",
}

//written from what the app actually stores (db/schema.ts) — keep the two
//audiences separate: the OWNER of a hosted site, and that site's own customers.
const sections: { title: string; body: React.ReactNode }[] = [
    {
        title: "Who this covers",
        body: (
            <>
                <p>Two different people read this page:</p>
                <ul className="grid list-disc gap-1 pl-5">
                    <li><span className="font-semibold text-ink">Site owners</span> — businesses paying for a hosted page or a custom build.</li>
                    <li><span className="font-semibold text-ink">Site visitors and customers</span> — people using a business&apos;s page hosted at squaremaxtech.com/their-name.</li>
                </ul>
            </>
        ),
    },
    {
        title: "If you sign in as a site owner",
        body: (
            <p>
                Sign-in goes through Google or GitHub. We receive and store your name, email address and profile image from
                that provider, plus a session record so you stay signed in. We never see your password for either service.
            </p>
        ),
    },
    {
        title: "If you contact us",
        body: (
            <p>
                The contact and project-enquiry forms email your name, email address, business name and message to our own
                inbox so we can reply. An unsent draft is kept in your own browser&apos;s local storage so a refresh
                doesn&apos;t lose your message — it never leaves your device until you press send.
            </p>
        ),
    },
    {
        title: "If you sign up on a hosted business page",
        body: (
            <>
                <p>
                    Each hosted business keeps its own separate customer list. When you create an account on one, we store
                    your email, name, phone number, notification preferences and a one-way hash of your password — never the
                    password itself. Bookings you make are stored against that account.
                </p>
                <p>
                    That record belongs to <span className="font-semibold text-ink">that business only</span>. Signing up on
                    one hosted page does not create an account on any other, and businesses cannot see each other&apos;s
                    customer lists.
                </p>
            </>
        ),
    },
    {
        title: "Payments",
        body: (
            <p>
                Card payments are handled on the payment provider&apos;s own hosted page. Card numbers never reach our
                servers and we never store them. We keep the amount, the date, the period the payment covers, the resulting
                status and the provider&apos;s transaction reference, so both sides have a record of what was paid for.
            </p>
        ),
    },
    {
        title: "Cookies",
        body: (
            <p>
                We use cookies for one thing: keeping you signed in. There is a session cookie for site owners, and a
                separate per-business cookie for customers signed in to a hosted page. On squaremaxtech.com&apos;s own
                marketing pages we may additionally load Google Analytics and the Meta (Facebook) pixel to measure our
                advertising; those never load on hosted business pages, on customer account pages, or in the dashboard.
            </p>
        ),
    },
    {
        title: "Sharing",
        body: (
            <p>
                We do not sell personal data and we do not share it for advertising. It reaches third parties only where
                the service requires it — the sign-in provider you chose, the payment provider, and the mail service that
                delivers notification emails.
            </p>
        ),
    },
    {
        title: "Your data, and getting it removed",
        body: (
            <p>
                Ask and we will show you what we hold, correct it, or delete it. Site owners can also delete their own
                content directly from the dashboard. Email{" "}
                <a className="font-semibold text-cobalt hover:underline" href="mailto:info@squaremaxtech.com">info@squaremaxtech.com</a>{" "}
                and a person — the developer — answers.
            </p>
        ),
    },
]

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <section className="blueprintGrid border-b border-line">
                <div className="mx-auto grid max-w-3xl gap-4 px-4 py-16">
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand">Privacy Policy</p>

                    <h1 className="font-display text-display-l font-bold">What we store, and why.</h1>

                    <p className="text-lg text-mist">
                        Squaremax runs small business websites. That means we hold as little about you as the job allows —
                        here is the whole of it, in plain terms.
                    </p>
                </div>
            </section>

            <div className="mx-auto grid max-w-3xl gap-10 px-4 py-14">
                {sections.map(eachSection => (
                    <section key={eachSection.title} className="grid gap-3">
                        <h2 className="font-display text-display-s font-bold">{eachSection.title}</h2>
                        <div className="grid gap-3 leading-relaxed text-mist">{eachSection.body}</div>
                    </section>
                ))}

                <p className="border-t border-line pt-6 text-sm text-mist">
                    Questions about any of this? <Link className="font-semibold text-cobalt hover:underline" href="/contact">Get in touch</Link>.
                </p>
            </div>
        </main>
    )
}
