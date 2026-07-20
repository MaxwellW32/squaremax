import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteBySlugCached } from "@/lib/sites/tenantCache"
import { slugSchema } from "@/lib/sites/slug"
import PublicTenantPage from "@/components/sites/PublicTenantPage"

//the public tenant HOME page: server-rendered, cached per slug (tag
//tenant:{slug}), busted on every builder save and billing status change.

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) return {}

    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) return {}

    const { business } = site.tenant.content
    const seo = site.tenant.content.seo
    const title = seo.title !== "" ? seo.title : business.tagline !== "" ? `${business.name} — ${business.tagline}` : business.name
    const description = seo.description !== "" ? seo.description : business.description !== "" ? business.description : business.tagline

    return {
        title,
        description,
        openGraph: {
            title: business.name,
            description,
            url: `https://squaremaxtech.com/${site.tenant.slug}`,
        },
    }
}

export default async function Page({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) notFound()

    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) notFound()

    return <PublicTenantPage site={site} pageSlug="" basePath={`/${site.tenant.slug}`} />
}
