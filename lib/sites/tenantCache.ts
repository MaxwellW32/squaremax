import { eq } from "drizzle-orm"
import { revalidateTag, unstable_cache } from "next/cache"
import { db } from "@/db"
import { tenants, tenantPages, tenantComponents, tenantProducts } from "@/db/schema"
import { slugSchema } from "./slug"

//server-only cached tenant reads. Deliberately NOT in a "use server" module:
//as an exported server action this would be a public endpoint letting anyone
//enumerate slugs and pull full tenant rows (owner id, config, draft content).
//
//NOTE: unstable_cache JSON-serializes — Date columns arrive as ISO strings on
//cache hits; effectiveStatus() normalizes.

async function loadSiteByTenantId(tenantId: string) {
    const [pages, components] = await Promise.all([
        db.query.tenantPages.findMany({ where: eq(tenantPages.tenantId, tenantId) }),
        db.query.tenantComponents.findMany({ where: eq(tenantComponents.tenantId, tenantId) }),
    ])

    //products are only needed when a products component is placed AND the
    //inventory add-on is on — cheap to check before querying
    return { pages, components }
}

async function loadProductsIfNeeded(tenantId: string, components: { category: string }[], enabledAddons: string[]) {
    const wantsProducts = components.some(component => component.category === "products") && enabledAddons.includes("inventory")
    if (!wantsProducts) return undefined
    const rows = await db.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenantId) })
    return rows
        .filter(row => row.active)
        .map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            priceCents: row.priceCents,
            imageSrc: row.imageSrc,
            stock: row.stock,
            trackStock: row.trackStock,
        }))
}

//the cache tags a tenant's public pages live under (slug page + custom domain)
export function tenantTags(slug: string, customDomain: string | null): string[] {
    const tags = [`tenant:${slug}`]
    //the custom-domain page caches under its own tag — bust it too or the
    //tenant's own domain serves stale content for up to an hour
    if (customDomain !== null) tags.push(`tenant-domain:${customDomain}`)
    return tags
}

// Invalidate a tenant's public pages NOW — the single entry point, so billing
// and the builder can never drift apart.
//
// `{ expire: 0 }` is load-bearing. Next 16's revalidateTag takes a cache-life
// profile describing how long the OLD entry may still be served while it
// refreshes in the background; every named profile keeps a stale-serving
// window ("max" is a year), so the request right after a mutation still
// renders the previous page — which is how a paid subscription kept showing
// the paused placeholder. `expire: 0` hard-expires the entry instead, so the
// very next read goes to the database.
export function bustTenantCache(slug: string, customDomain: string | null) {
    for (const tag of tenantTags(slug, customDomain)) revalidateTag(tag, { expire: 0 })
}

export async function getTenantSiteBySlugCached(slugRaw: string) {
    const parsed = slugSchema.safeParse(slugRaw)
    if (!parsed.success) return null
    const slug = parsed.data

    const cachedRead = unstable_cache(
        async () => {
            const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
            if (tenant === undefined) return null
            const { pages, components } = await loadSiteByTenantId(tenant.id)
            const products = await loadProductsIfNeeded(tenant.id, components, tenant.config.enabledAddons)
            return { tenant, pages, components, products }
        },
        [`tenant-site-${slug}`],
        { tags: [`tenant:${slug}`], revalidate: 3600 },
    )

    return cachedRead()
}

export async function getTenantSiteByDomainCached(domainRaw: string) {
    const domain = domainRaw.toLowerCase().slice(0, 255)

    const cachedRead = unstable_cache(
        async () => {
            const tenant = await db.query.tenants.findFirst({ where: eq(tenants.customDomain, domain) })
            if (tenant === undefined) return null
            const { pages, components } = await loadSiteByTenantId(tenant.id)
            const products = await loadProductsIfNeeded(tenant.id, components, tenant.config.enabledAddons)
            return { tenant, pages, components, products }
        },
        [`tenant-domain-${domain}`],
        { tags: [`tenant-domain:${domain}`], revalidate: 3600 },
    )

    return cachedRead()
}

//kept for callers that only need the tenant row (billing, status checks)
export async function getTenantBySlugCached(slugRaw: string) {
    const site = await getTenantSiteBySlugCached(slugRaw)
    return site?.tenant ?? null
}
