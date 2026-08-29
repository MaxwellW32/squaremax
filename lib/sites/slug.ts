import { z } from "zod"

//============================================================
// Tenant slug safety: squaremaxtech.com/{slug}
// Reserved words protect current AND future marketing routes —
// once a tenant owns /portfolio, that page can never ship.
//============================================================

export const RESERVED_SLUGS = new Set([
    //infrastructure
    "www", "api", "app", "admin", "auth", "login", "signin", "signout", "signup",
    "static", "assets", "public", "_next", "cdn", "mail", "smtp", "ftp",
    //current routes
    "sites", "custom-builds", "projects", "contact", "care-plan",
    "privacypolicy", "dashboard", "opengraph-image.png",
    //retired routes — stay reserved so a tenant can't claim a path that
    //was public once and may be wanted again
    "blog", "services", "aboutus", "about", "faq", "testimonials",
    "specifications", "websites", "templates", "users",
    //future-proofing
    "pricing", "portfolio", "work", "help", "support", "docs", "status",
    "careers", "jobs", "shop", "store", "news", "press", "legal", "terms",
    "privacy", "billing", "account", "settings", "search", "explore",
    "squaremax", "start", "onboarding", "pay", "checkout", "domains",
])

//url-safe normalization: "Joe's Barbershop!" -> "joes-barbershop"
export function normalizeSlug(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "") //strip accents
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 63)
}

export const slugSchema = z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase letters, numbers and hyphens only")
    .refine(slug => !RESERVED_SLUGS.has(slug), "this name is reserved")

export function validateSlug(input: string): { ok: true; slug: string } | { ok: false; error: string } {
    const parsed = slugSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid name" }
    }
    return { ok: true, slug: parsed.data }
}
