import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteBySlugCached } from "@/lib/sites/tenantCache"
import { slugSchema } from "@/lib/sites/slug"
import { pageSlugSchema } from "@/lib/sites/site"
import PublicTenantPage from "@/components/sites/PublicTenantPage"

//a tenant SUB-PAGE (e.g. /joes-barbershop/about) — same cache, same shell

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string; pageSlug: string }> }): Promise<Metadata> {
    const { businessSlug, pageSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success || !pageSlugSchema.safeParse(pageSlug).success) return {}

    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) return {}

    const page = site.pages.find(candidate => candidate.slug === pageSlug)
    if (page === undefined) return {}

    return { title: `${page.title} — ${site.tenant.content.business.name}` }
}

export default async function Page({ params }: { params: Promise<{ businessSlug: string; pageSlug: string }> }) {
    const { businessSlug, pageSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) notFound()
    if (!pageSlugSchema.safeParse(pageSlug).success) notFound()

    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) notFound()

    return <PublicTenantPage site={site} pageSlug={pageSlug} basePath={`/${site.tenant.slug}`} />
}
