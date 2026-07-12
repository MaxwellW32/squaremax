import { z } from "zod"

//============================================================
// Tenant site CONTENT — keyed by SECTION TYPE, not by placed
// component. One hero blob feeds ANY hero variant; swapping a
// design never migrates data. schemaVersion enables forward
// migrations as section shapes evolve.
//============================================================

export const sectionTypeSchema = z.enum([
    "navbar", "hero", "about", "services", "gallery",
    "testimonials", "hours", "contact", "booking", "footer",
])
export type SectionType = z.infer<typeof sectionTypeSchema>

export const socialLinkSchema = z.object({
    platform: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "x", "youtube", "linkedin", "other"]),
    url: z.url(),
})
export type SocialLink = z.infer<typeof socialLinkSchema>

export const businessInfoSchema = z.object({
    name: z.string().min(1).max(160),
    tagline: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),
    industry: z.string().max(80).default(""),
    phone: z.string().max(40).default(""),
    email: z.string().max(160).default(""),
    address: z.string().max(300).default(""),
    socials: socialLinkSchema.array().default([]),
    logoUrl: z.string().default(""),
})
export type BusinessInfo = z.infer<typeof businessInfoSchema>

export const heroContentSchema = z.object({
    heading: z.string().min(1).max(160),
    subheading: z.string().max(300).default(""),
    imageUrl: z.string().default(""),
    ctaLabel: z.string().max(60).default(""),
})
export type HeroContent = z.infer<typeof heroContentSchema>

export const aboutContentSchema = z.object({
    heading: z.string().max(120).default("About us"),
    body: z.string().max(4000).default(""),
    imageUrl: z.string().default(""),
})
export type AboutContent = z.infer<typeof aboutContentSchema>

export const serviceItemSchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(500).default(""),
    price: z.string().max(40).default(""), //display string: "$40", "from $25"
    durationMinutes: z.number().int().positive().optional(), //used by booking add-on
})
export type ServiceItem = z.infer<typeof serviceItemSchema>

export const servicesContentSchema = z.object({
    heading: z.string().max(120).default("Services"),
    items: serviceItemSchema.array().default([]),
})
export type ServicesContent = z.infer<typeof servicesContentSchema>

export const galleryContentSchema = z.object({
    heading: z.string().max(120).default("Gallery"),
    images: z.object({ src: z.string().min(1), alt: z.string().default("") }).array().default([]),
})
export type GalleryContent = z.infer<typeof galleryContentSchema>

export const testimonialsContentSchema = z.object({
    heading: z.string().max(120).default("What customers say"),
    items: z.object({ quote: z.string().min(1).max(600), author: z.string().max(120).default("") }).array().default([]),
})
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>

export const hoursContentSchema = z.object({
    heading: z.string().max(120).default("Opening hours"),
    entries: z.object({ label: z.string().min(1).max(60), hours: z.string().min(1).max(60) }).array().default([]),
})
export type HoursContent = z.infer<typeof hoursContentSchema>

export const contactContentSchema = z.object({
    heading: z.string().max(120).default("Get in touch"),
    blurb: z.string().max(500).default(""),
    showMessageForm: z.boolean().default(true),
})
export type ContactContent = z.infer<typeof contactContentSchema>

export const siteContentSchema = z.object({
    schemaVersion: z.literal(1),
    business: businessInfoSchema,
    hero: heroContentSchema,
    about: aboutContentSchema,
    services: servicesContentSchema,
    gallery: galleryContentSchema,
    testimonials: testimonialsContentSchema,
    hours: hoursContentSchema,
    contact: contactContentSchema,
})
export type SiteContent = z.infer<typeof siteContentSchema>

//sensible starter content derived from the onboarding basics
export function defaultSiteContent(businessName: string): SiteContent {
    return siteContentSchema.parse({
        schemaVersion: 1,
        business: { name: businessName },
        hero: {
            heading: businessName,
            subheading: "Welcome — we're glad you're here.",
            ctaLabel: "Get in touch",
        },
        about: { body: "" },
        services: { items: [] },
        gallery: { images: [] },
        testimonials: { items: [] },
        hours: { entries: [] },
        contact: {},
    })
}
