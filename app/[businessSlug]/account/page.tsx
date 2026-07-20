import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantSiteBySlugCached } from "@/lib/sites/tenantCache"
import { slugSchema } from "@/lib/sites/slug"
import AccountPage from "@/components/sites/AccountPage"

//customer account portal at /{slug}/account (static segment wins over the
//dynamic [pageSlug] route, so "account" is reserved from page slugs)

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) return {}
    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) return {}
    return { title: `Your account — ${site.tenant.content.business.name}`, robots: { index: false } }
}

export default async function Page({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) notFound()

    const site = await getTenantSiteBySlugCached(businessSlug)
    if (site === null) notFound()

    return <AccountPage site={site} basePath={`/${site.tenant.slug}`} />
}
