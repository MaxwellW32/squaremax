import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteByDomainCached } from "@/lib/sites/tenantCache"
import AccountPage from "@/components/sites/AccountPage"

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params
    const site = await getTenantSiteByDomainCached(domain)
    if (site === null) return {}
    return { title: `Your account — ${site.tenant.content.business.name}`, robots: { index: false } }
}

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const site = await getTenantSiteByDomainCached(domain)

    if (site === null) notFound()
    if (!site.tenant.config.enabledAddons.includes("custom-domain")) notFound()

    return <AccountPage site={site} basePath="" />
}
