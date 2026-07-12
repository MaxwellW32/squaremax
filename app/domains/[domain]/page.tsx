import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import TenantSite from "@/components/sites/TenantSite"

//custom-domain rendering: middleware rewrites foreign hosts here.
//requires the tenant's custom-domain add-on to be enabled.

async function getTenantByDomain(domainRaw: string) {
    const domain = domainRaw.toLowerCase().slice(0, 255)

    const cachedRead = unstable_cache(
        async () => {
            const tenant = await db.query.tenants.findFirst({ where: eq(tenants.customDomain, domain) })
            return tenant ?? null
        },
        [`tenant-domain-${domain}`],
        { tags: [`tenant-domain:${domain}`], revalidate: 3600 },
    )

    return cachedRead()
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params
    const tenant = await getTenantByDomain(decodeURIComponent(domain))
    if (tenant === null) return {}

    const business = tenant.content.business
    return {
        title: business.tagline !== "" ? `${business.name} — ${business.tagline}` : business.name,
        description: business.description !== "" ? business.description : business.tagline,
    }
}

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const tenant = await getTenantByDomain(decodeURIComponent(domain))

    if (tenant === null) notFound()
    if (!tenant.config.enabledAddons.includes("custom-domain")) notFound()

    if (!isPubliclyVisible(effectiveStatus(tenant))) {
        return (
            <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
                <div className="grid max-w-md justify-items-center gap-3 text-center">
                    <p className="font-display text-2xl font-bold normal-case">{tenant.businessName}</p>
                    <p className="text-mist">This page is taking a short break.</p>
                </div>
            </main>
        )
    }

    return <TenantSite content={tenant.content} config={tenant.config} slug={tenant.slug} />
}
