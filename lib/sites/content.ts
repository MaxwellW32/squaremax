import { z } from "zod"

//============================================================
// Tenant site content model v2 — INSTANCE-BASED.
//
// A site is built top-down from placed components. Every placed
// component has a UNIQUE id and owns its own `data` blob, shaped
// by its CATEGORY (navbar, hero, gallery…). Swapping the visual
// design (variantId) of an instance keeps its data, because every
// variant of a category renders the same data shape. Two navbars
// on one site are two rows with two independent data blobs.
//
// This file defines: the category enum, the per-category data
// schemas (a discriminated union on `data.category`), default
// data factories, and the site-wide meta blob (business profile
// + SEO) stored on tenants.content.
//============================================================

export const componentCategorySchema = z.enum([
    "navbar", "hero", "text", "services", "gallery", "testimonials",
    "hours", "announcement", "contact", "booking", "products", "footer",
])
export type ComponentCategory = z.infer<typeof componentCategorySchema>

export const categoryLabels: Record<ComponentCategory, string> = {
    navbar: "Navigation bar",
    hero: "Hero banner",
    text: "Heading & text",
    services: "Services",
    gallery: "Photo gallery",
    testimonials: "Testimonials",
    hours: "Opening hours",
    announcement: "Announcement strip",
    contact: "Contact",
    booking: "Booking",
    products: "Products",
    footer: "Footer",
}

//------------------------------------------------------------
// reusable building blocks
//------------------------------------------------------------

//href forms a component may link to:
//  "/about"  — a site page (resolved against the tenant base path)
//  "#contact" — an anchor on the current page
//  full URLs, tel:, mailto:, wa.me links — untouched
export const siteLinkSchema = z.object({
    label: z.string().max(80).default(""),
    href: z.string().max(500).default(""),
})
export type SiteLink = z.infer<typeof siteLinkSchema>

export const siteImageSchema = z.object({
    src: z.string().max(1000).default(""),
    alt: z.string().max(200).default(""),
    caption: z.string().max(200).default(""),
})
export type SiteImage = z.infer<typeof siteImageSchema>

export const socialLinkSchema = z.object({
    platform: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "x", "youtube", "linkedin", "other"]),
    url: z.url(),
})
export type SocialLink = z.infer<typeof socialLinkSchema>

//------------------------------------------------------------
// per-category data shapes (the payload of one placed component)
//------------------------------------------------------------

//menu item with one level of sub-menu (dropdown)
export const navMenuItemSchema = z.object({
    label: z.string().max(80).default(""),
    href: z.string().max(500).default(""),
    subMenu: siteLinkSchema.array().max(12).default([]),
})
export type NavMenuItem = z.infer<typeof navMenuItemSchema>

export const navbarDataSchema = z.object({
    category: z.literal("navbar"),
    logoText: z.string().max(120).default(""), //empty -> business name
    logoImageSrc: z.string().max(1000).default(""),
    menu: navMenuItemSchema.array().max(12).default([]),
    cta: siteLinkSchema.optional(), //prominent button; omitted -> smart default
    showCta: z.boolean().default(true),
})
export type NavbarData = z.infer<typeof navbarDataSchema>

export const heroDataSchema = z.object({
    category: z.literal("hero"),
    heading: z.string().max(160).default(""),
    subheading: z.string().max(300).default(""),
    imageSrc: z.string().max(1000).default(""),
    ctaLabel: z.string().max(60).default(""),
    ctaHref: z.string().max(500).default(""), //empty -> booking/contact smart default
})
export type HeroData = z.infer<typeof heroDataSchema>

export const textDataSchema = z.object({
    category: z.literal("text"),
    heading: z.string().max(160).default(""),
    body: z.string().max(6000).default(""), //blank line = new paragraph
    imageSrc: z.string().max(1000).default(""),
    imageSide: z.enum(["left", "right"]).default("right"),
})
export type TextData = z.infer<typeof textDataSchema>

export const serviceItemSchema = z.object({
    name: z.string().max(120).default(""),
    description: z.string().max(500).default(""),
    price: z.string().max(40).default(""), //display string: "$40", "from $25"
    imageSrc: z.string().max(1000).default(""),
    durationMinutes: z.number().int().positive().optional(), //used by booking
})
export type ServiceItem = z.infer<typeof serviceItemSchema>

export const servicesDataSchema = z.object({
    category: z.literal("services"),
    heading: z.string().max(120).default("Services"),
    blurb: z.string().max(500).default(""),
    items: serviceItemSchema.array().max(40).default([]),
})
export type ServicesData = z.infer<typeof servicesDataSchema>

export const galleryDataSchema = z.object({
    category: z.literal("gallery"),
    heading: z.string().max(120).default("Gallery"),
    images: siteImageSchema.array().max(60).default([]),
})
export type GalleryData = z.infer<typeof galleryDataSchema>

export const testimonialsDataSchema = z.object({
    category: z.literal("testimonials"),
    heading: z.string().max(120).default("What customers say"),
    items: z.object({
        quote: z.string().max(600).default(""),
        author: z.string().max(120).default(""),
        role: z.string().max(120).default(""),
    }).array().max(20).default([]),
})
export type TestimonialsData = z.infer<typeof testimonialsDataSchema>

export const hoursDataSchema = z.object({
    category: z.literal("hours"),
    heading: z.string().max(120).default("Opening hours"),
    entries: z.object({
        label: z.string().max(60).default(""),
        hours: z.string().max(60).default(""),
    }).array().max(14).default([]),
})
export type HoursData = z.infer<typeof hoursDataSchema>

export const announcementDataSchema = z.object({
    category: z.literal("announcement"),
    text: z.string().max(300).default(""),
    href: z.string().max(500).default(""),
    linkLabel: z.string().max(60).default(""),
})
export type AnnouncementData = z.infer<typeof announcementDataSchema>

export const contactDataSchema = z.object({
    category: z.literal("contact"),
    heading: z.string().max(120).default("Get in touch"),
    blurb: z.string().max(500).default(""),
    showMessageForm: z.boolean().default(true),
    showDetails: z.boolean().default(true), //phone/email/address from the business profile
})
export type ContactData = z.infer<typeof contactDataSchema>

export const bookingServiceSchema = z.object({
    name: z.string().max(120).default(""),
    durationMinutes: z.number().int().min(5).max(480).default(30),
    price: z.string().max(40).default(""),
})
export type BookingService = z.infer<typeof bookingServiceSchema>

export const bookingDataSchema = z.object({
    category: z.literal("booking"),
    heading: z.string().max(120).default("Book an appointment"),
    blurb: z.string().max(500).default(""),
    services: bookingServiceSchema.array().max(30).default([]),
})
export type BookingData = z.infer<typeof bookingDataSchema>

export const productsDataSchema = z.object({
    category: z.literal("products"),
    heading: z.string().max(120).default("Shop"),
    blurb: z.string().max(500).default(""),
    //how a customer orders: whatsapp deep link, the contact form, or display-only
    orderMethod: z.enum(["whatsapp", "contact", "none"]).default("whatsapp"),
})
export type ProductsData = z.infer<typeof productsDataSchema>

export const footerDataSchema = z.object({
    category: z.literal("footer"),
    text: z.string().max(400).default(""),
    links: siteLinkSchema.array().max(12).default([]),
    showContact: z.boolean().default(true),
    showSocials: z.boolean().default(true),
})
export type FooterData = z.infer<typeof footerDataSchema>

//the payload stored on one placed component row
export const componentDataSchema = z.discriminatedUnion("category", [
    navbarDataSchema, heroDataSchema, textDataSchema, servicesDataSchema,
    galleryDataSchema, testimonialsDataSchema, hoursDataSchema,
    announcementDataSchema, contactDataSchema, bookingDataSchema,
    productsDataSchema, footerDataSchema,
])
export type ComponentData = z.infer<typeof componentDataSchema>

export const dataSchemaByCategory: Record<ComponentCategory, z.ZodType<ComponentData>> = {
    navbar: navbarDataSchema,
    hero: heroDataSchema,
    text: textDataSchema,
    services: servicesDataSchema,
    gallery: galleryDataSchema,
    testimonials: testimonialsDataSchema,
    hours: hoursDataSchema,
    announcement: announcementDataSchema,
    contact: contactDataSchema,
    booking: bookingDataSchema,
    products: productsDataSchema,
    footer: footerDataSchema,
}

//------------------------------------------------------------
// site-wide meta (tenants.content) — business profile + SEO.
// Components read the profile through ctx so phone/address edits
// apply everywhere at once; per-component data stays presentational.
//------------------------------------------------------------

export const businessInfoSchema = z.object({
    name: z.string().min(1).max(160),
    tagline: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),
    industry: z.string().max(80).default(""),
    phone: z.string().max(40).default(""),
    whatsapp: z.string().max(40).default(""), //digits with country code, for wa.me links
    email: z.string().max(160).default(""),
    address: z.string().max(300).default(""),
    socials: socialLinkSchema.array().default([]),
    logoUrl: z.string().default(""),
})
export type BusinessInfo = z.infer<typeof businessInfoSchema>

export const siteMetaSchema = z.object({
    schemaVersion: z.literal(2),
    business: businessInfoSchema,
    seo: z.object({
        title: z.string().max(160).default(""),
        description: z.string().max(300).default(""),
    }).default({ title: "", description: "" }),
})
export type SiteMeta = z.infer<typeof siteMetaSchema>

export function defaultSiteMeta(businessName: string): SiteMeta {
    const name = businessName.trim() !== "" ? businessName.trim() : "Your business"
    return siteMetaSchema.parse({ schemaVersion: 2, business: { name }, seo: {} })
}

//------------------------------------------------------------
// default data per category — what a freshly added component holds
//------------------------------------------------------------

export function defaultComponentData(category: ComponentCategory, business: BusinessInfo): ComponentData {
    switch (category) {
        case "navbar":
            return navbarDataSchema.parse({
                category: "navbar",
                menu: [{ label: "Home", href: "/", subMenu: [] }],
            })
        case "hero":
            return heroDataSchema.parse({
                category: "hero",
                heading: business.name,
                subheading: business.tagline !== "" ? business.tagline : "Welcome — we're glad you're here.",
            })
        case "text":
            return textDataSchema.parse({ category: "text", heading: "About us", body: business.description })
        case "services":
            return servicesDataSchema.parse({ category: "services" })
        case "gallery":
            return galleryDataSchema.parse({ category: "gallery" })
        case "testimonials":
            return testimonialsDataSchema.parse({ category: "testimonials" })
        case "hours":
            return hoursDataSchema.parse({
                category: "hours",
                entries: [
                    { label: "Mon – Fri", hours: "9:00am – 5:00pm" },
                    { label: "Sat", hours: "10:00am – 2:00pm" },
                ],
            })
        case "announcement":
            return announcementDataSchema.parse({ category: "announcement", text: "Welcome! Ask us about this week's special." })
        case "contact":
            return contactDataSchema.parse({ category: "contact" })
        case "booking":
            return bookingDataSchema.parse({
                category: "booking",
                services: [{ name: "Appointment", durationMinutes: 30, price: "" }],
            })
        case "products":
            return productsDataSchema.parse({ category: "products" })
        case "footer":
            return footerDataSchema.parse({
                category: "footer",
                text: `© ${business.name}. All rights reserved.`,
            })
    }
}
