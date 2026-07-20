import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteByDomainCached } from "@/lib/sites/tenantCache"
import { pageSlugSchema } from "@/lib/sites/site"
import PublicTenantPage from "@/components/sites/PublicTenantPage"

//a tenant sub-page served from a custom domain (e.g. yourbusiness.com/about)

export async function generateMetadata({ params }: { params: Promise<{ domain: string; pageSlug: string }> }): Promise<Metadata> {
    const { domain, pageSlug } = await params
    if (!pageSlugSchema.safeParse(pageSlug).success) return {}

    const site = await getTenantSiteByDomainCached(domain)
    if (site === null) return {}

    const page = site.pages.find(candidate => candidate.slug === pageSlug)
    if (page === undefined) return {}
    return { title: `${page.title} — ${site.tenant.content.business.name}` }
}

export default async function Page({ params }: { params: Promise<{ domain: string; pageSlug: string }> }) {
    const { domain, pageSlug } = await params
    if (!pageSlugSchema.safeParse(pageSlug).success) notFound()

    const site = await getTenantSiteByDomainCached(domain)
    if (site === null) notFound()
    if (!site.tenant.config.enabledAddons.includes("custom-domain")) notFound()

    return <PublicTenantPage site={site} pageSlug={pageSlug} basePath="" />
}
