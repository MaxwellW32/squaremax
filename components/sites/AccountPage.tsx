import React from "react"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantBookings, tenantOrders } from "@/db/schema"
import { orderRef } from "@/lib/sites/saleMath"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { themesById, themeToStyle, themes } from "@/lib/sites/themes"
import { tenantFontsClassName } from "@/lib/sites/fonts"
import { getCurrentCustomer } from "@/lib/sites/customerAuth"
import CustomerAccountPanel from "@/components/sites/islands/CustomerAccountPanel"
import { PausedPlaceholder } from "@/components/sites/PublicTenantPage"
import { getTenantSiteBySlugCached } from "@/lib/sites/tenantCache"

//the customer ACCOUNT page on a tenant site — themed like the site, but
//per-customer data is loaded fresh (never through the shared page cache)

type SiteBundle = NonNullable<Awaited<ReturnType<typeof getTenantSiteBySlugCached>>>

export default async function AccountPage({ site, basePath }: { site: SiteBundle; basePath: string }) {
    const { tenant } = site

    if (!isPubliclyVisible(effectiveStatus(tenant))) {
        return <PausedPlaceholder businessName={tenant.businessName} />
    }

    const customer = await getCurrentCustomer(tenant.id)
    const [bookings, orders] = customer === null ? [[], []] : await Promise.all([
        db.query.tenantBookings.findMany({
            where: and(eq(tenantBookings.tenantId, tenant.id), eq(tenantBookings.customerId, customer.id)),
            orderBy: [desc(tenantBookings.startsAt)],
            limit: 50,
        }),
        db.query.tenantOrders.findMany({
            where: and(eq(tenantOrders.tenantId, tenant.id), eq(tenantOrders.customerId, customer.id)),
            orderBy: [desc(tenantOrders.createdAt)],
            limit: 50,
        }),
    ])

    const theme = themesById[tenant.config.themeId] ?? themes[0]

    return (
        <div
            style={{
                ...themeToStyle(theme, tenant.config.themeOverrides),
                backgroundColor: "var(--t-bg)",
                fontFamily: "var(--t-font-body)",
                color: "var(--t-text)",
            }}
            className={`${tenantFontsClassName} min-h-screen`}
        >
            <div className="mx-auto grid max-w-2xl gap-5 px-4 py-10">
                <div className="flex items-baseline justify-between gap-3">
                    <h1 className="text-[length:var(--t-text-xl)]" style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}>
                        Your account
                    </h1>
                    <a href={basePath === "" ? "/" : basePath} className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">
                        ← back to {tenant.content.business.name}
                    </a>
                </div>

                <CustomerAccountPanel
                    slug={tenant.slug}
                    businessName={tenant.content.business.name}
                    initialCustomer={customer === null ? null : {
                        id: customer.id,
                        email: customer.email,
                        name: customer.name,
                        phone: customer.phone,
                        notifyEmail: customer.notifyEmail,
                        notifyWhatsapp: customer.notifyWhatsapp,
                    }}
                    initialBookings={bookings.map(booking => ({
                        id: booking.id,
                        serviceName: booking.serviceName,
                        startsAt: booking.startsAt,
                        status: booking.status,
                    }))}
                    initialOrders={orders.map(order => ({
                        id: order.id,
                        ref: orderRef(order.id),
                        summary: order.items.map(item => `${item.qty}× ${item.name}`).join(", "),
                        totalCents: order.totalCents,
                        status: order.status,
                        createdAt: order.createdAt,
                    }))}
                    showBookings={tenant.config.enabledAddons.includes("booking")}
                    showOrders={tenant.config.enabledAddons.includes("inventory")}
                />
            </div>
        </div>
    )
}
