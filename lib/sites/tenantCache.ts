import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { slugSchema } from "./slug"

//server-only cached tenant reads. Deliberately NOT in a "use server" module:
//as an exported server action this would be a public endpoint letting anyone
//enumerate slugs and pull full tenant rows (owner id, config, draft content).
//
//NOTE: unstable_cache JSON-serializes — Date columns arrive as ISO strings on
//cache hits; effectiveStatus() normalizes.

export async function getTenantBySlugCached(slugRaw: string) {
    const parsed = slugSchema.safeParse(slugRaw)
    if (!parsed.success) return null
    const slug = parsed.data

    const cachedRead = unstable_cache(
        async () => {
            const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
            return tenant ?? null
        },
        [`tenant-${slug}`],
        { tags: [`tenant:${slug}`], revalidate: 3600 },
    )

    return cachedRead()
}

export async function getTenantByDomainCached(domainRaw: string) {
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
