import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTenantBySlugCached } from "@/lib/sites/tenantCache"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { slugSchema } from "@/lib/sites/slug"
import TenantSite from "@/components/sites/TenantSite"

//the public tenant page: server-rendered, cached per slug (tag tenant:{slug}),
//busted on every content/config save and every billing status change.

export async function generateMetadata({ params }: { params: Promise<{ businessSlug: string }> }): Promise<Metadata> {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) return {}

    const tenant = await getTenantBySlugCached(businessSlug)
    if (tenant === null) return {}

    const business = tenant.content.business
    const description = business.description !== "" ? business.description : business.tagline

    return {
        title: business.tagline !== "" ? `${business.name} — ${business.tagline}` : business.name,
        description,
        openGraph: {
            title: business.name,
            description,
            url: `https://squaremaxtech.com/${tenant.slug}`,
        },
    }
}

export default async function Page({ params }: { params: Promise<{ businessSlug: string }> }) {
    const { businessSlug } = await params
    if (!slugSchema.safeParse(businessSlug).success) notFound()

    const tenant = await getTenantBySlugCached(businessSlug)
    if (tenant === null) notFound()

    const status = effectiveStatus(tenant)

    if (!isPubliclyVisible(status)) {
        //polite paused placeholder — never a broken link
        return (
            <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
                <div className="grid max-w-md justify-items-center gap-3 text-center">
                    <p className="font-display text-2xl font-bold normal-case">{tenant.businessName}</p>
                    <p className="text-mist">
                        This page is taking a short break. If this is your business,
                        sign in to your Squaremax dashboard to bring it back online.
                    </p>
                    <a href="https://squaremaxtech.com" className="text-sm font-semibold text-cobalt underline-offset-4 hover:underline">
                        Powered by Squaremax
                    </a>
                </div>
            </main>
        )
    }

    return <TenantSite content={tenant.content} config={tenant.config} slug={tenant.slug} />
}
