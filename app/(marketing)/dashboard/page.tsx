import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth/auth"
import { getMyTenants } from "@/serverFunctions/handleTenants"
import { effectiveStatus } from "@/lib/sites/status"

export const metadata: Metadata = {
    title: "My pages | Squaremax",
}

export default async function Page() {
    const session = await auth()
    if (session === null) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`)

    const myTenants = await getMyTenants()

    if (myTenants.length === 0) redirect("/sites/start")
    if (myTenants.length === 1) redirect(`/dashboard/${myTenants[0].id}`)

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-3xl gap-4 px-4 py-12">
                <h1 className="font-display text-3xl font-bold normal-case">My pages</h1>

                <div className="grid gap-3">
                    {myTenants.map(tenant => {
                        const status = effectiveStatus(tenant)
                        return (
                            <Link key={tenant.id} href={`/dashboard/${tenant.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4 hover:border-cobalt">
                                <span className="grid gap-0.5">
                                    <span className="font-display font-bold">{tenant.businessName}</span>
                                    <span className="font-mono text-xs text-mist">/{tenant.slug}</span>
                                </span>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === "active" ? "bg-emerald-100 text-emerald-800" : status === "grace" ? "bg-amber-100 text-amber-800" : "bg-line text-mist"}`}>
                                    {status}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                <Link href="/sites/start" className="w-fit rounded-lg border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white">
                    + Launch another page
                </Link>
            </div>
        </main>
    )
}
