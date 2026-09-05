import React from "react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Check your email | Squaremax",
    robots: { index: false },
}

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-md gap-5 px-4 py-12 text-center md:py-20">
                <p aria-hidden className="text-5xl">📬</p>
                <h1 className="font-display text-3xl font-bold normal-case">Check your inbox</h1>
                <p className="text-mist">
                    We just sent you a sign-in link. Tap it on this device and you&apos;ll land straight in your dashboard.
                </p>
                <div className="grid gap-2 rounded-xl border border-line bg-surface p-5 text-left text-sm text-mist">
                    <p><span className="font-semibold text-ink">Nothing there?</span> Give it a minute, then check spam or promotions.</p>
                    <p><span className="font-semibold text-ink">Typo in the address?</span> <Link className="font-semibold text-cobalt underline-offset-4 hover:underline" href="/signin">Try again</Link>.</p>
                    <p>The link works once and expires in 15 minutes.</p>
                </div>
            </div>
        </main>
    )
}
