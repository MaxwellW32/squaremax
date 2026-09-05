import React from "react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { toDataURL } from "qrcode"
import { auth } from "@/auth/auth"
import { getMyTenants, getOwnedTenantById, getTenantAvailability, getTenantBookings, getTenantMessages } from "@/serverFunctions/handleTenants"
import { getSiteForOwner } from "@/serverFunctions/handleSiteBuilder"
import { getTenantCustomers } from "@/serverFunctions/handleCustomers"
import { getProducts, getSales, getSalesSummary } from "@/serverFunctions/handleInventory"
import { getAnnouncements } from "@/serverFunctions/handleNotifications"
import { getBillingCurrency, getTenantPayments } from "@/serverFunctions/handleTenantBilling"
import { getOrders } from "@/serverFunctions/handleOrders"
import { getDomainStatus } from "@/serverFunctions/handleDomains"
import { daysRemaining, renewBase } from "@/lib/sites/billing"
import { effectiveStatus } from "@/lib/sites/status"
import { env } from "@/lib/env"
import TenantDashboard, { DashboardTabId, dashboardTabIds } from "@/components/sites/dashboard/TenantDashboard"

export const metadata: Metadata = {
    title: "Dashboard | Squaremax",
}

export default async function Page({ params, searchParams }: {
    params: Promise<{ tenantId: string }>
    searchParams: Promise<{ tab?: string; paid?: string; cancelled?: string }>
}) {
    const { tenantId } = await params
    const { tab, paid, cancelled } = await searchParams

    const session = await auth()
    if (session === null) redirect(`/signin?callbackUrl=${encodeURIComponent(`/dashboard/${tenantId}`)}`)

    let tenant
    try {
        tenant = await getOwnedTenantById(tenantId)
    } catch {
        notFound()
    }

    const [site, bookings, messages, availability, customers, products, sales, salesSummary, announcements, myTenants, payments, orders, domain, currency] = await Promise.all([
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
        getTenantPayments(tenant.id),
        getOrders(tenant.id),
        getDomainStatus(tenant.id),
        getBillingCurrency(),
    ])

    const liveUrl = tenant.customDomain !== null && tenant.config.enabledAddons.includes("custom-domain")
        ? `https://${tenant.customDomain}`
        : `${env.SITE_URL}/${tenant.slug}`
    const qrDataUrl = await toDataURL(liveUrl, { margin: 1, width: 220 })

    const initialTab: DashboardTabId = (dashboardTabIds as readonly string[]).includes(tab ?? "") ? tab as DashboardTabId : "overview"

    return (
        <main className="bg-paper text-ink">
            <TenantDashboard
                tenantId={tenant.id}
                slug={tenant.slug}
                liveUrl={liveUrl}
                qrDataUrl={qrDataUrl}
                initialTab={initialTab}
                justPaid={paid === "1"}
                checkoutCancelled={cancelled === "1"}
                status={effectiveStatus(tenant)}
                currentPeriodEnd={tenant.currentPeriodEnd?.toISOString() ?? null}
                payments={payments}
                paidDaysLeft={daysRemaining(tenant.currentPeriodEnd)}
                renewBaseISO={renewBase(tenant.currentPeriodEnd).toISOString()}
                currency={currency}
                initialMeta={tenant.content}
                initialConfig={tenant.config}
                domain={domain}
                pages={site.pages}
                components={site.components}
                products={products}
                sales={sales}
                salesSummary={salesSummary}
                orders={orders}
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
