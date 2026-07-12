import React from "react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth/auth"
import { getOwnedTenantById, getTenantAvailability, getTenantBookings, getTenantMessages } from "@/serverFunctions/handleTenants"
import { effectiveStatus } from "@/lib/sites/status"
import TenantDashboard from "@/components/sites/dashboard/TenantDashboard"

export const metadata: Metadata = {
    title: "Dashboard | Squaremax",
}

export default async function Page({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params

    const session = await auth()
    if (session === null) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/${tenantId}`)}`)

    let tenant
    try {
        tenant = await getOwnedTenantById(tenantId)
    } catch {
        notFound()
    }

    const [bookings, messages, availability] = await Promise.all([
        getTenantBookings(tenant.id),
        getTenantMessages(tenant.id),
        getTenantAvailability(tenant.id),
    ])

    return (
        <main className="bg-paper text-ink">
            <TenantDashboard
                tenantId={tenant.id}
                slug={tenant.slug}
                status={effectiveStatus(tenant)}
                currentPeriodEnd={tenant.currentPeriodEnd?.toISOString() ?? null}
                initialContent={tenant.content}
                initialConfig={tenant.config}
                bookings={bookings}
                messages={messages}
                availability={availability.map(rule => ({
                    dayOfWeek: rule.dayOfWeek,
                    openTime: rule.openTime,
                    closeTime: rule.closeTime,
                    slotMinutes: rule.slotMinutes,
                }))}
            />
        </main>
    )
}
