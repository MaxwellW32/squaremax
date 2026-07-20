import { BusinessInfo, ComponentCategory, componentCategorySchema, dataSchemaByCategory, defaultComponentData, ComponentData } from "./content"
import { ComponentRegion } from "./site"
import { defaultVariantFor, variantsById } from "./registry"
import { emptyStyles, ComponentStyles } from "./styles"

//============================================================
// Site templates: a full starter website = theme + pages + a
// list of component seeds. Applying one COPIES it component by
// component into the tenant's own rows — every copy gets a fresh
// unique id and its own data blob, so the result is fully the
// client's: reorder, swap designs, move across pages, edit data.
//============================================================

type ComponentSeed = {
    category: ComponentCategory
    variantId?: string //defaults to the category's first variant
    data?: Record<string, unknown> //merged over the category's default data
}

type PageSeed = {
    slug: string //"" = home
    title: string
    components: ComponentSeed[]
}

export type SiteTemplate = {
    id: string
    name: string
    description: string
    themeId: string
    header: ComponentSeed[]
    footer: ComponentSeed[]
    pages: PageSeed[]
}

export const siteTemplates: SiteTemplate[] = [
    {
        id: "blank",
        name: "Blank canvas",
        description: "Just a navigation bar and a footer — build the rest yourself, section by section.",
        themeId: "slate",
        header: [{ category: "navbar" }],
        footer: [{ category: "footer" }],
        pages: [{ slug: "", title: "Home", components: [] }],
    },
    {
        id: "storefront-classic",
        name: "Storefront Classic",
        description: "The full-service business site: services up front, story and gallery on their own page, booking and contact built in.",
        themeId: "linen",
        header: [{ category: "navbar", variantId: "navbar.classic", data: { menu: [{ label: "Home", href: "/", subMenu: [] }, { label: "About", href: "/about", subMenu: [] }] } }],
        footer: [{ category: "footer", variantId: "footer.columns" }],
        pages: [
            {
                slug: "", title: "Home", components: [
                    { category: "hero", variantId: "hero.split" },
                    { category: "services", variantId: "services.grid" },
                    { category: "testimonials", variantId: "testimonials.cards" },
                    { category: "hours", variantId: "hours.table" },
                    { category: "booking", variantId: "booking.panel" },
                    { category: "contact", variantId: "contact.split" },
                ],
            },
            {
                slug: "about", title: "About", components: [
                    { category: "text", variantId: "text.image", data: { heading: "Our story" } },
                    { category: "gallery", variantId: "gallery.grid" },
                    { category: "contact", variantId: "contact.split", data: { heading: "Visit us" } },
                ],
            },
        ],
    },
    {
        id: "bold-banner",
        name: "Bold Banner",
        description: "A big photo-first opener with a menu-style list. Great for restaurants, salons and barbers.",
        themeId: "midnight",
        header: [{ category: "navbar", variantId: "navbar.centered" }],
        footer: [{ category: "footer", variantId: "footer.simple" }],
        pages: [
            {
                slug: "", title: "Home", components: [
                    { category: "announcement", variantId: "announcement.bar" },
                    { category: "hero", variantId: "hero.banner" },
                    { category: "services", variantId: "services.list", data: { heading: "Menu" } },
                    { category: "gallery", variantId: "gallery.strip" },
                    { category: "testimonials", variantId: "testimonials.spotlight" },
                    { category: "booking", variantId: "booking.panel" },
                    { category: "contact", variantId: "contact.split" },
                ],
            },
        ],
    },
    {
        id: "minimal-card",
        name: "Minimal Card",
        description: "Quiet and typographic — your name, what you do, how to reach you. Nothing extra.",
        themeId: "studio",
        header: [{ category: "navbar", variantId: "navbar.classic" }],
        footer: [{ category: "footer", variantId: "footer.simple" }],
        pages: [
            {
                slug: "", title: "Home", components: [
                    { category: "hero", variantId: "hero.centered" },
                    { category: "text", variantId: "text.simple", data: { heading: "About" } },
                    { category: "services", variantId: "services.list" },
                    { category: "hours", variantId: "hours.table" },
                    { category: "contact", variantId: "contact.split" },
                ],
            },
        ],
    },
    {
        id: "shopfront",
        name: "Shopfront",
        description: "Product-first: your shop above the fold, story below, orders via WhatsApp. Pairs with the Store & inventory add-on.",
        themeId: "fresh",
        header: [{ category: "navbar", variantId: "navbar.classic" }],
        footer: [{ category: "footer", variantId: "footer.columns" }],
        pages: [
            {
                slug: "", title: "Home", components: [
                    { category: "hero", variantId: "hero.split" },
                    { category: "products", variantId: "products.grid" },
                    { category: "text", variantId: "text.simple", data: { heading: "Why shop with us" } },
                    { category: "hours", variantId: "hours.table" },
                    { category: "contact", variantId: "contact.split" },
                ],
            },
        ],
    },
]

export const siteTemplatesById: Record<string, SiteTemplate> = Object.fromEntries(
    siteTemplates.map(template => [template.id, template])
)

//------------------------------------------------------------
// instantiation — template seeds -> concrete rows (fresh ids)
//------------------------------------------------------------

export type InstantiatedPage = { id: string; slug: string; title: string; order: number }
export type InstantiatedComponent = {
    id: string
    region: ComponentRegion
    pageId: string | null
    order: number
    category: ComponentCategory
    variantId: string
    data: ComponentData
    styles: ComponentStyles
}

function buildComponent(seed: ComponentSeed, region: ComponentRegion, pageId: string | null, order: number, business: BusinessInfo): InstantiatedComponent {
    const category = componentCategorySchema.parse(seed.category)
    const variantId = seed.variantId ?? defaultVariantFor(category).variantId
    const variant = variantsById[variantId]
    if (variant === undefined || variant.category !== category) throw new Error(`template seed: unknown variant ${variantId} for ${category}`)

    const data = dataSchemaByCategory[category].parse({
        ...defaultComponentData(category, business),
        ...seed.data,
        category,
    })

    return {
        id: crypto.randomUUID(),
        region,
        pageId,
        order,
        category,
        variantId,
        data,
        styles: emptyStyles,
    }
}

export function instantiateTemplate(template: SiteTemplate, business: BusinessInfo): {
    pages: InstantiatedPage[]
    components: InstantiatedComponent[]
} {
    const pages: InstantiatedPage[] = template.pages.map((page, pageIndex) => ({
        id: crypto.randomUUID(),
        slug: page.slug,
        title: page.title,
        order: pageIndex,
    }))

    const components: InstantiatedComponent[] = [
        ...template.header.map((seed, seedIndex) => buildComponent(seed, "header", null, seedIndex, business)),
        ...template.footer.map((seed, seedIndex) => buildComponent(seed, "footer", null, seedIndex, business)),
        ...template.pages.flatMap((page, pageIndex) =>
            page.components.map((seed, seedIndex) => buildComponent(seed, "main", pages[pageIndex].id, seedIndex, business)),
        ),
    ]

    return { pages, components }
}
