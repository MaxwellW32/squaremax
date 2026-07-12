import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth/auth"
import { getAllTenantsAdmin } from "@/serverFunctions/handleTenants"
import { effectiveStatus } from "@/lib/sites/status"
import { monthlyTotal } from "@/lib/sites/addons"

export const metadata: Metadata = {
    title: "Admin | Squaremax",
}

export default async function Page() {
    const session = await auth()
    if (session === null || session.user.role !== "admin") redirect("/")

    const allTenants = await getAllTenantsAdmin()

    const rows = allTenants.map(tenant => ({
        tenant,
        status: effectiveStatus(tenant),
        monthly: monthlyTotal(tenant.config.enabledAddons),
    }))

    const mrr = rows.filter(row => row.status === "active" || row.status === "grace").reduce((sum, row) => sum + row.monthly, 0)

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">Hosted tenants</h1>
                    <div className="flex gap-6 text-sm text-mist">
                        <p><span className="font-display text-2xl font-bold text-ink">{rows.length}</span> tenants</p>
                        <p><span className="font-display text-2xl font-bold text-ink">{rows.filter(r => r.status === "active").length}</span> active</p>
                        <p><span className="font-display text-2xl font-bold text-emerald-700">${mrr}</span>/mo MRR</p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-line text-xs uppercase tracking-wide text-mist">
                                <th className="px-4 py-3">Business</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Paid through</th>
                                <th className="px-4 py-3">$/mo</th>
                                <th className="px-4 py-3">Add-ons</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ tenant, status, monthly }) => (
                                <tr key={tenant.id} className="border-b border-line/60">
                                    <td className="px-4 py-3 font-semibold">{tenant.businessName}</td>
                                    <td className="px-4 py-3 font-mono text-xs">/{tenant.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === "active" ? "bg-emerald-100 text-emerald-800" : status === "grace" ? "bg-amber-100 text-amber-800" : status === "suspended" ? "bg-red-100 text-red-800" : "bg-line text-mist"}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-mist">
                                        {tenant.currentPeriodEnd !== null ? tenant.currentPeriodEnd.toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                                    </td>
                                    <td className="tabularNums px-4 py-3 font-semibold">${monthly}</td>
                                    <td className="px-4 py-3 text-xs text-mist">{tenant.config.enabledAddons.join(", ") || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex gap-3 text-xs font-semibold">
                                            <a className="text-cobalt hover:underline" href={`/${tenant.slug}`} target="_blank" rel="noreferrer">View</a>
                                            <Link className="text-cobalt hover:underline" href={`/dashboard/${tenant.id}`}>Impersonate</Link>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && <p className="px-4 py-8 text-center text-mist">No tenants yet.</p>}
                </div>
            </div>
        </main>
    )
}
