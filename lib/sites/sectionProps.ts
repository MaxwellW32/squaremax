import { AddonId } from "./addons"
import { BusinessInfo, ComponentData } from "./content"

//============================================================
// The contract every section variant receives:
//  - data: THIS instance's own blob (unique per placed component)
//  - id:   the instance's unique id (anchors, css scoping)
//  - ctx:  site-wide context — business profile, pages for nav
//    links, base path (differs on custom domains), add-on flags.
// Variants of one category all accept that category's data shape,
// which is what makes designs hot-swappable without touching data.
//============================================================

export type SitePageLink = {
    slug: string //"" = home
    title: string
}

export type ProductLite = {
    id: string
    name: string
    description: string
    priceCents: number
    imageSrc: string
    taxRateBps: number
    stock: number
    trackStock: boolean
}

export type SiteCtx = {
    tenantId: string
    slug: string
    //"/{slug}" on squaremaxtech.com, "" when served from a custom domain
    basePath: string
    business: BusinessInfo
    pages: SitePageLink[]
    enabledAddons: AddonId[]
    //filled server-side when a products component is on the page
    products?: ProductLite[]
    //true inside onboarding/dashboard previews: interactive islands
    //(booking, contact form, account links) render as static placeholders
    preview?: boolean
}

export type SectionProps<D extends ComponentData = ComponentData> = {
    data: D
    id: string
    ctx: SiteCtx
}

//resolve an author-entered href: "/about" -> "{basePath}/about",
//"/" -> home; anchors, full urls, tel:/mailto:/wa.me untouched
export function resolveHref(ctx: SiteCtx, href: string): string {
    if (!href.startsWith("/")) return href
    const joined = `${ctx.basePath}${href === "/" ? "" : href}`
    return joined === "" ? "/" : joined
}

//smart default target for CTAs: booking section if the add-on is on,
//otherwise the contact anchor
export function defaultCtaHref(ctx: SiteCtx): string {
    return ctx.enabledAddons.includes("booking") ? "#booking" : "#contact"
}
