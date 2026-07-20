import React from "react"
import { notFound } from "next/navigation"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import TenantSite from "@/components/sites/TenantSite"
import { getTenantSiteBySlugCached } from "@/lib/sites/tenantCache"

//shared server component behind every public tenant URL — the /{slug} routes
//and the custom-domain routes both funnel here with their own basePath.

type SiteBundle = NonNullable<Awaited<ReturnType<typeof getTenantSiteBySlugCached>>>

export function PausedPlaceholder({ businessName }: { businessName: string }) {
    return (
        <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
            <div className="grid max-w-md justify-items-center gap-3 text-center">
                <p className="font-display text-2xl font-bold normal-case">{businessName}</p>
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

export default function PublicTenantPage({
    site,
    pageSlug,
    basePath,
}: {
    site: SiteBundle
    pageSlug: string //"" = home
    basePath: string
}) {
    const { tenant, pages, components, products } = site

    const status = effectiveStatus(tenant)
    if (!isPubliclyVisible(status)) {
        //polite paused placeholder — never a broken link
        return <PausedPlaceholder businessName={tenant.businessName} />
    }

    const page = pages.find(candidate => candidate.slug === pageSlug)
    if (page === undefined) notFound()

    return (
        <TenantSite
            meta={tenant.content}
            config={tenant.config}
            slug={tenant.slug}
            basePath={basePath}
            tenantId={tenant.id}
            pages={pages}
            components={components}
            currentPageId={page.id}
            products={products}
        />
    )
}
