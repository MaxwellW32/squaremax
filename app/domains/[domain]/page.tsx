import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteByDomainCached } from "@/lib/sites/tenantCache"
import PublicTenantPage from "@/components/sites/PublicTenantPage"

//custom-domain rendering: proxy.ts rewrites foreign hosts here.
//requires the tenant's custom-domain add-on to be enabled.
//note: params arrive already URL-decoded — do not decode again.

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params
    const site = await getTenantSiteByDomainCached(domain)
    if (site === null) return {}

    const { business } = site.tenant.content
    const seo = site.tenant.content.seo
    return {
        title: seo.title !== "" ? seo.title : business.tagline !== "" ? `${business.name} — ${business.tagline}` : business.name,
        description: seo.description !== "" ? seo.description : business.description !== "" ? business.description : business.tagline,
    }
}

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const site = await getTenantSiteByDomainCached(domain)

    if (site === null) notFound()
    if (!site.tenant.config.enabledAddons.includes("custom-domain")) notFound()

    //basePath is empty on a custom domain: page links live at the domain root
    return <PublicTenantPage site={site} pageSlug="" basePath="" />
}
