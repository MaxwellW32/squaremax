import React from "react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth/auth"
import { getMyTenants, getOwnedTenantById, getTenantAvailability, getTenantBookings, getTenantMessages } from "@/serverFunctions/handleTenants"
import { getSiteForOwner } from "@/serverFunctions/handleSiteBuilder"
import { getTenantCustomers } from "@/serverFunctions/handleCustomers"
import { getProducts, getSales, getSalesSummary } from "@/serverFunctions/handleInventory"
import { getAnnouncements } from "@/serverFunctions/handleNotifications"
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

    const [site, bookings, messages, availability, customers, products, sales, salesSummary, announcements, myTenants] = await Promise.all([
        getSiteForOwner(tenant.id),
        getTenantBookings(tenant.id),
        getTenantMessages(tenant.id),
        getTenantAvailability(tenant.id),
        getTenantCustomers(tenant.id),
        getProducts(tenant.id),
        getSales(tenant.id, 50),
        getSalesSummary(tenant.id),
        getAnnouncements(tenant.id),
        getMyTenants(),
    ])

    return (
        <main className="bg-paper text-ink">
            <TenantDashboard
                tenantId={tenant.id}
                slug={tenant.slug}
                status={effectiveStatus(tenant)}
                currentPeriodEnd={tenant.currentPeriodEnd?.toISOString() ?? null}
                initialMeta={tenant.content}
                initialConfig={tenant.config}
                pages={site.pages}
                components={site.components}
                products={products}
                sales={sales}
                salesSummary={salesSummary}
                customers={customers}
                announcements={announcements}
                otherTenants={myTenants
                    .filter(candidate => candidate.id !== tenant.id)
                    .map(candidate => ({ id: candidate.id, businessName: candidate.businessName }))}
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
