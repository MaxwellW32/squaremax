import type { MetadataRoute } from "next"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"

const origin = "https://squaremaxtech.com"

//refreshed hourly so a site that went live this morning is in the sitemap by lunch
export const revalidate = 3600

//marketing pages plus every live tenant home page — a client's site gets
//found on Google through the platform's sitemap without any setup on their side
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const marketing: MetadataRoute.Sitemap = [
        { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
        { url: `${origin}/pricing`, changeFrequency: "monthly", priority: 0.9 },
        { url: `${origin}/sites`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${origin}/custom-builds`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${origin}/care-plan`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${origin}/contact`, changeFrequency: "yearly", priority: 0.5 },
        { url: `${origin}/privacyPolicy`, changeFrequency: "yearly", priority: 0.1 },
    ]

    let live: MetadataRoute.Sitemap = []
    try {
        const rows = await db.query.tenants.findMany({ where: eq(tenants.status, "live") })
        live = rows
            .filter(tenant => isPubliclyVisible(effectiveStatus(tenant)))
            .map(tenant => ({
                url: `${origin}/${tenant.slug}`,
                lastModified: tenant.updatedAt,
                changeFrequency: "weekly" as const,
                priority: 0.6,
            }))
    } catch {
        //a sitemap without tenant pages beats a 500
    }

    return [...marketing, ...live]
}
