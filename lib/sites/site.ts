import { z } from "zod"
import { componentCategorySchema, componentDataSchema } from "./content"
import { componentStylesSchema } from "./styles"

//============================================================
// Domain types for the instance model:
//  - a SITE PAGE is a route on the tenant site ("" = home)
//  - a SITE COMPONENT is one placed instance with a unique id,
//    a category (data shape), a swappable variantId (design),
//    its own data blob, and per-instance style overrides.
// Header/footer components render on every page; main components
// belong to exactly one page. Order is per region (per page for
// main). These schemas validate rows crossing the server boundary.
//============================================================

export const PAGE_LIMIT = 5

export const componentRegionSchema = z.enum(["header", "main", "footer"])
export type ComponentRegion = z.infer<typeof componentRegionSchema>

//page slugs are single path segments; "" is the home page. "account" and
//friends are reserved for platform routes on the tenant path.
export const RESERVED_PAGE_SLUGS = new Set(["account", "api", "admin", "dashboard", "assets"])

export const pageSlugSchema = z.string().max(40).regex(/^[a-z0-9-]*$/, "lowercase letters, numbers and dashes only")
    .refine(slug => !RESERVED_PAGE_SLUGS.has(slug), "that page name is reserved")

export const sitePageSchema = z.object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    slug: pageSlugSchema,
    title: z.string().min(1).max(120),
    order: z.number().int(),
})
export type SitePage = z.infer<typeof sitePageSchema>

export const siteComponentSchema = z.object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    region: componentRegionSchema,
    pageId: z.string().nullable(), //set iff region === "main"
    order: z.number().int(),
    category: componentCategorySchema,
    variantId: z.string().min(1),
    data: componentDataSchema,
    styles: componentStylesSchema,
})
export type SiteComponent = z.infer<typeof siteComponentSchema>

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.order - b.order)
}

type Placeable = { region: ComponentRegion; pageId: string | null; order: number }

//components visible on one page: header + that page's main + footer, in order
export function componentsForPage<T extends Placeable>(components: T[], pageId: string): T[] {
    return [
        ...sortByOrder(components.filter(component => component.region === "header")),
        ...sortByOrder(components.filter(component => component.region === "main" && component.pageId === pageId)),
        ...sortByOrder(components.filter(component => component.region === "footer")),
    ]
}

//siblings sharing an order scope: same region, and same page when main
export function siblingComponents<T extends Placeable>(components: T[], component: Placeable): T[] {
    return sortByOrder(components.filter(candidate =>
        candidate.region === component.region &&
        (component.region !== "main" || candidate.pageId === component.pageId),
    ))
}
