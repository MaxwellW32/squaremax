import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { toDataURL } from "qrcode"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth/auth"
import { getTenantBySlugCached } from "@/serverFunctions/handleTenants"
import { effectiveStatus } from "@/lib/sites/status"
import { env } from "@/lib/env"

export const metadata: Metadata = {
    title: "You're live! | Squaremax Sites",
}

//the payoff screen after checkout: live URL, QR code, what happens next
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const session = await auth()
    if (session === null) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/sites/live/${slug}`)}`)

    const tenant = await getTenantBySlugCached(slug)
    if (tenant === null) notFound()
    if (tenant.ownerUserId !== session.user.id && session.user.role !== "admin") notFound()

    const status = effectiveStatus(tenant)
    const liveUrl = `${env.SITE_URL}/${tenant.slug}`
    const qrDataUrl = await toDataURL(liveUrl, { margin: 1, width: 240 })

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-2xl justify-items-center gap-6 px-4 py-16 text-center">
                <p aria-hidden className="text-5xl">🎉</p>

                <h1 className="font-display text-4xl font-bold normal-case">
                    {status === "active" ? `${tenant.businessName} is live!` : `${tenant.businessName} is almost there`}
                </h1>

                {status === "active" ? (
                    <>
                        <a
                            href={`/${tenant.slug}`}
                            className="rounded-lg border border-line bg-surface px-5 py-3 font-mono text-lg hover:border-cobalt"
                        >
                            squaremaxtech.com/<span className="font-bold text-cobalt">{tenant.slug}</span>
                        </a>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrDataUrl} alt={`QR code linking to ${liveUrl}`} className="rounded-lg border border-line bg-white p-2" />
                        <p className="text-sm text-mist">Print it, stick it on the counter — customers scan straight to your page.</p>
                    </>
                ) : (
                    <p className="max-w-md text-mist">
                        Your payment hasn&apos;t settled yet. If you just paid, give it a few seconds and refresh —
                        or head to your dashboard to finish up.
                    </p>
                )}

                <div className="grid w-full gap-3 rounded-xl border border-line bg-surface p-6 text-left">
                    <h2 className="font-display text-lg font-bold normal-case">What happens next</h2>
                    <ul className="grid gap-2 text-sm text-mist">
                        <li><span className="font-semibold text-ink">Edit anything, anytime</span> — content, design and add-ons live in your dashboard.</li>
                        <li><span className="font-semibold text-ink">Billing</span> — your page is prepaid 30 days at a time; renew from the dashboard, and we&apos;ll remind you by email before it lapses.</li>
                        <li><span className="font-semibold text-ink">Help</span> — email <a className="underline" href="mailto:info@squaremaxtech.com">info@squaremaxtech.com</a> and a human (the developer) answers.</li>
                    </ul>
                </div>

                <Link
                    href={`/dashboard/${tenant.id}`}
                    className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink"
                >
                    Open my dashboard
                </Link>
            </div>
        </main>
    )
}
