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
    "featureGrid", "stats", "ctaBanner", "faq", "pricingPlans", "steps",
    "team", "logoStrip", "beforeAfter", "video", "priceList", "locationMap",
    "events", "newsletter", "divider", "embed",
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
    featureGrid: "Feature highlights",
    stats: "Numbers & stats",
    ctaBanner: "Call-to-action banner",
    faq: "FAQ",
    pricingPlans: "Pricing plans",
    steps: "Steps & process",
    team: "Team",
    logoStrip: "Logo strip",
    beforeAfter: "Before & after",
    video: "Video",
    priceList: "Menu / price list",
    locationMap: "Location & map",
    events: "Events",
    newsletter: "Newsletter signup",
    divider: "Divider",
    embed: "Embed",
}

//groupings shown in the add/swap component picker — friendly, goal-oriented
//names so owners browse by intent, with plain category labels inside
export const categoryGroups: { id: string; label: string; blurb: string; categories: ComponentCategory[] }[] = [
    { id: "structure", label: "Page structure", blurb: "The frame of every page", categories: ["navbar", "hero", "footer", "announcement", "divider"] },
    { id: "content", label: "Content & story", blurb: "Tell people what you do", categories: ["text", "gallery", "video", "steps", "embed"] },
    { id: "selling", label: "Selling & converting", blurb: "Turn visitors into customers", categories: ["services", "priceList", "pricingPlans", "featureGrid", "stats", "ctaBanner", "faq", "booking", "products", "newsletter"] },
    { id: "trust", label: "Trust & proof", blurb: "Show them you're the real deal", categories: ["testimonials", "team", "logoStrip", "beforeAfter"] },
    { id: "practical", label: "Practical info", blurb: "Hours, directions, contact", categories: ["hours", "locationMap", "events", "contact"] },
]

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
    //how a customer buys:
    //  order    — cart + order form on the site; the owner gets the order in
    //             the dashboard (and by email/WhatsApp with notifications)
    //  whatsapp — a direct "I'd like to order X" deep link, no order record
    //  contact  — jump to the contact form · none — display only
    orderMethod: z.enum(["order", "whatsapp", "contact", "none"]).default("order"),
    allowPickup: z.boolean().default(true),
    allowDelivery: z.boolean().default(false),
    deliveryNote: z.string().max(300).default(""), //"Kingston & St Andrew · J$500 flat"
    //shown on the order form: how to pay, when it's ready, anything else
    orderNote: z.string().max(500).default(""),
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

//------------------------------------------------------------
// selling & converting
//------------------------------------------------------------

export const featureGridDataSchema = z.object({
    category: z.literal("featureGrid"),
    heading: z.string().max(120).default("Why choose us"),
    blurb: z.string().max(500).default(""),
    items: z.object({
        icon: z.string().max(200).default(""), //emoji or small image URL
        title: z.string().max(120).default(""),
        body: z.string().max(400).default(""),
    }).array().max(12).default([]),
})
export type FeatureGridData = z.infer<typeof featureGridDataSchema>

export const statsDataSchema = z.object({
    category: z.literal("stats"),
    heading: z.string().max(120).default(""),
    items: z.object({
        value: z.string().max(20).default(""), //display string: "10+", "4.9★"
        label: z.string().max(80).default(""),
    }).array().max(6).default([]),
})
export type StatsData = z.infer<typeof statsDataSchema>

export const ctaBannerDataSchema = z.object({
    category: z.literal("ctaBanner"),
    heading: z.string().max(160).default(""),
    blurb: z.string().max(300).default(""),
    ctaLabel: z.string().max(60).default(""), //empty -> smart default
    ctaHref: z.string().max(500).default(""),
    imageSrc: z.string().max(1000).default(""),
})
export type CtaBannerData = z.infer<typeof ctaBannerDataSchema>

export const faqDataSchema = z.object({
    category: z.literal("faq"),
    heading: z.string().max(120).default("Common questions"),
    blurb: z.string().max(500).default(""),
    items: z.object({
        question: z.string().max(300).default(""),
        answer: z.string().max(2000).default(""),
    }).array().max(30).default([]),
})
export type FaqData = z.infer<typeof faqDataSchema>

export const pricingPlansDataSchema = z.object({
    category: z.literal("pricingPlans"),
    heading: z.string().max(120).default("Plans"),
    blurb: z.string().max(500).default(""),
    plans: z.object({
        name: z.string().max(80).default(""),
        price: z.string().max(40).default(""), //display string: "$50"
        period: z.string().max(40).default(""), //"/month", "per visit"
        features: z.string().max(120).array().max(15).default([]),
        ctaLabel: z.string().max(60).default(""),
        ctaHref: z.string().max(500).default(""),
        highlighted: z.boolean().default(false),
    }).array().max(5).default([]),
})
export type PricingPlansData = z.infer<typeof pricingPlansDataSchema>

export const stepsDataSchema = z.object({
    category: z.literal("steps"),
    heading: z.string().max(120).default("How it works"),
    blurb: z.string().max(500).default(""),
    steps: z.object({
        title: z.string().max(120).default(""),
        body: z.string().max(400).default(""),
        imageSrc: z.string().max(1000).default(""),
    }).array().max(8).default([]),
})
export type StepsData = z.infer<typeof stepsDataSchema>

//------------------------------------------------------------
// trust & proof
//------------------------------------------------------------

export const teamDataSchema = z.object({
    category: z.literal("team"),
    heading: z.string().max(120).default("Meet the team"),
    blurb: z.string().max(500).default(""),
    members: z.object({
        name: z.string().max(120).default(""),
        role: z.string().max(120).default(""),
        photoSrc: z.string().max(1000).default(""),
        bio: z.string().max(500).default(""),
        href: z.string().max(500).default(""), //instagram, portfolio…
    }).array().max(20).default([]),
})
export type TeamData = z.infer<typeof teamDataSchema>

export const logoStripDataSchema = z.object({
    category: z.literal("logoStrip"),
    heading: z.string().max(120).default("Trusted by"),
    logos: z.object({
        name: z.string().max(120).default(""), //text fallback + alt
        src: z.string().max(1000).default(""),
        href: z.string().max(500).default(""),
    }).array().max(16).default([]),
})
export type LogoStripData = z.infer<typeof logoStripDataSchema>

export const beforeAfterDataSchema = z.object({
    category: z.literal("beforeAfter"),
    heading: z.string().max(120).default("Before & after"),
    pairs: z.object({
        beforeSrc: z.string().max(1000).default(""),
        afterSrc: z.string().max(1000).default(""),
        caption: z.string().max(200).default(""),
    }).array().max(12).default([]),
})
export type BeforeAfterData = z.infer<typeof beforeAfterDataSchema>

export const videoDataSchema = z.object({
    category: z.literal("video"),
    heading: z.string().max(120).default(""),
    url: z.string().max(1000).default(""), //YouTube / Vimeo watch URL
    caption: z.string().max(300).default(""),
})
export type VideoData = z.infer<typeof videoDataSchema>

//------------------------------------------------------------
// practical
//------------------------------------------------------------

export const priceListDataSchema = z.object({
    category: z.literal("priceList"),
    heading: z.string().max(120).default("Menu"),
    blurb: z.string().max(500).default(""),
    sections: z.object({
        title: z.string().max(120).default(""),
        items: z.object({
            name: z.string().max(140).default(""),
            description: z.string().max(300).default(""),
            price: z.string().max(40).default(""),
        }).array().max(30).default([]),
    }).array().max(12).default([]),
})
export type PriceListData = z.infer<typeof priceListDataSchema>

export const locationMapDataSchema = z.object({
    category: z.literal("locationMap"),
    heading: z.string().max(120).default("Find us"),
    blurb: z.string().max(500).default(""),
    address: z.string().max(300).default(""), //empty -> business profile address
    mapEmbedUrl: z.string().max(1500).default(""), //Google Maps embed URL
    showDirectionsButton: z.boolean().default(true),
})
export type LocationMapData = z.infer<typeof locationMapDataSchema>

export const eventsDataSchema = z.object({
    category: z.literal("events"),
    heading: z.string().max(120).default("Upcoming events"),
    events: z.object({
        title: z.string().max(160).default(""),
        dateText: z.string().max(80).default(""), //display string: "Fri Aug 14, 8pm"
        location: z.string().max(200).default(""),
        description: z.string().max(500).default(""),
        href: z.string().max(500).default(""),
    }).array().max(20).default([]),
})
export type EventsData = z.infer<typeof eventsDataSchema>

//------------------------------------------------------------
// utilities & capture
//------------------------------------------------------------

export const newsletterDataSchema = z.object({
    category: z.literal("newsletter"),
    heading: z.string().max(120).default("Stay in the loop"),
    blurb: z.string().max(300).default("Specials, events and updates — no spam."),
    buttonLabel: z.string().max(40).default("Sign me up"),
})
export type NewsletterData = z.infer<typeof newsletterDataSchema>

export const dividerDataSchema = z.object({
    category: z.literal("divider"),
    style: z.enum(["line", "space"]).default("line"),
    size: z.enum(["s", "m", "l"]).default("m"),
})
export type DividerData = z.infer<typeof dividerDataSchema>

export const embedDataSchema = z.object({
    category: z.literal("embed"),
    heading: z.string().max(120).default(""),
    //rendered as a SANDBOXED iframe only — never raw HTML (XSS on our domain)
    embedUrl: z.string().max(1500).default(""),
    height: z.number().int().min(100).max(2000).default(400),
})
export type EmbedData = z.infer<typeof embedDataSchema>

//the payload stored on one placed component row
export const componentDataSchema = z.discriminatedUnion("category", [
    navbarDataSchema, heroDataSchema, textDataSchema, servicesDataSchema,
    galleryDataSchema, testimonialsDataSchema, hoursDataSchema,
    announcementDataSchema, contactDataSchema, bookingDataSchema,
    productsDataSchema, footerDataSchema,
    featureGridDataSchema, statsDataSchema, ctaBannerDataSchema, faqDataSchema,
    pricingPlansDataSchema, stepsDataSchema, teamDataSchema, logoStripDataSchema,
    beforeAfterDataSchema, videoDataSchema, priceListDataSchema,
    locationMapDataSchema, eventsDataSchema, newsletterDataSchema,
    dividerDataSchema, embedDataSchema,
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
    featureGrid: featureGridDataSchema,
    stats: statsDataSchema,
    ctaBanner: ctaBannerDataSchema,
    faq: faqDataSchema,
    pricingPlans: pricingPlansDataSchema,
    steps: stepsDataSchema,
    team: teamDataSchema,
    logoStrip: logoStripDataSchema,
    beforeAfter: beforeAfterDataSchema,
    video: videoDataSchema,
    priceList: priceListDataSchema,
    locationMap: locationMapDataSchema,
    events: eventsDataSchema,
    newsletter: newsletterDataSchema,
    divider: dividerDataSchema,
    embed: embedDataSchema,
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
            return productsDataSchema.parse({
                category: "products",
                orderNote: "Pay when you collect, or by bank transfer — we'll message you the details.",
            })
        case "footer":
            return footerDataSchema.parse({
                category: "footer",
                text: `© ${business.name}. All rights reserved.`,
            })
        case "featureGrid":
            return featureGridDataSchema.parse({
                category: "featureGrid",
                items: [
                    { icon: "⭐", title: "Quality first", body: "" },
                    { icon: "⚡", title: "Fast turnaround", body: "" },
                    { icon: "🤝", title: "Personal service", body: "" },
                ],
            })
        case "stats":
            return statsDataSchema.parse({
                category: "stats",
                items: [
                    { value: "5+", label: "Years in business" },
                    { value: "500+", label: "Happy customers" },
                ],
            })
        case "ctaBanner":
            return ctaBannerDataSchema.parse({ category: "ctaBanner", heading: `Ready? ${business.name} is too.` })
        case "faq":
            return faqDataSchema.parse({
                category: "faq",
                items: [{ question: "Do I need an appointment?", answer: "Walk-ins are welcome, but booking guarantees your spot." }],
            })
        case "pricingPlans":
            return pricingPlansDataSchema.parse({
                category: "pricingPlans",
                plans: [
                    { name: "Standard", price: "$50", period: "", features: ["Everything you need"], highlighted: false },
                    { name: "Premium", price: "$80", period: "", features: ["Everything in Standard", "Priority service"], highlighted: true },
                ],
            })
        case "steps":
            return stepsDataSchema.parse({
                category: "steps",
                steps: [
                    { title: "Get in touch", body: "" },
                    { title: "We do the work", body: "" },
                    { title: "You enjoy the result", body: "" },
                ],
            })
        case "team":
            return teamDataSchema.parse({ category: "team", members: [{ name: "Your name", role: "Owner", photoSrc: "", bio: "", href: "" }] })
        case "logoStrip":
            return logoStripDataSchema.parse({ category: "logoStrip", logos: [] })
        case "beforeAfter":
            return beforeAfterDataSchema.parse({ category: "beforeAfter", pairs: [] })
        case "video":
            return videoDataSchema.parse({ category: "video" })
        case "priceList":
            return priceListDataSchema.parse({
                category: "priceList",
                sections: [{ title: "Favorites", items: [{ name: "", description: "", price: "" }] }],
            })
        case "locationMap":
            return locationMapDataSchema.parse({ category: "locationMap", address: business.address })
        case "events":
            return eventsDataSchema.parse({ category: "events", events: [] })
        case "newsletter":
            return newsletterDataSchema.parse({ category: "newsletter" })
        case "divider":
            return dividerDataSchema.parse({ category: "divider" })
        case "embed":
            return embedDataSchema.parse({ category: "embed" })
    }
}

//------------------------------------------------------------
// richer demo data for the component picker previews — shows every
// design at its best regardless of what the owner has filled in yet
//------------------------------------------------------------

export function sampleComponentData(category: ComponentCategory, business: BusinessInfo): ComponentData {
    const base = defaultComponentData(category, business)

    switch (category) {
        case "hero":
            return { ...base, category: "hero", heading: business.name, subheading: business.tagline !== "" ? business.tagline : "The best in town — see for yourself.", ctaLabel: "Get started" } as ComponentData
        case "text":
            return textDataSchema.parse({ category: "text", heading: "Our story", body: "We started small and grew on word of mouth.\n\nToday we serve hundreds of happy customers — and we still treat every one like the first." })
        case "services":
            return servicesDataSchema.parse({
                category: "services",
                items: [
                    { name: "Signature service", description: "Our most popular option", price: "$40" },
                    { name: "Quick visit", description: "In and out in 20 minutes", price: "$20" },
                    { name: "The full works", description: "Settle in — worth it", price: "$75" },
                ],
            })
        case "gallery":
            return galleryDataSchema.parse({
                category: "gallery",
                images: Array.from({ length: 6 }, (_, imageIndex) => ({ src: "", alt: `Photo ${imageIndex + 1}`, caption: "" })),
            })
        case "testimonials":
            return testimonialsDataSchema.parse({
                category: "testimonials",
                items: [
                    { quote: "Best decision I made this year — the team is fantastic.", author: "Alex P.", role: "Regular" },
                    { quote: "Fast, friendly and fairly priced.", author: "Sam R.", role: "" },
                ],
            })
        case "faq":
            return faqDataSchema.parse({
                category: "faq",
                items: [
                    { question: "Do I need an appointment?", answer: "Walk-ins welcome; booking guarantees your spot." },
                    { question: "What payment do you accept?", answer: "Cash, card and bank transfer." },
                ],
            })
        case "featureGrid":
            return featureGridDataSchema.parse({
                category: "featureGrid",
                items: [
                    { icon: "⭐", title: "Quality first", body: "We never cut corners." },
                    { icon: "⚡", title: "Fast turnaround", body: "Most jobs done same-day." },
                    { icon: "🤝", title: "Personal service", body: "You deal with the owner." },
                ],
            })
        case "stats":
            return statsDataSchema.parse({
                category: "stats",
                items: [
                    { value: "10+", label: "Years in business" },
                    { value: "1,200", label: "Customers served" },
                    { value: "4.9★", label: "Average rating" },
                ],
            })
        case "steps":
            return stepsDataSchema.parse({
                category: "steps",
                steps: [
                    { title: "Book online", body: "Pick a time that suits you." },
                    { title: "We do the work", body: "Sit back — you're in good hands." },
                    { title: "Walk out happy", body: "And tell your friends." },
                ],
            })
        case "team":
            return teamDataSchema.parse({
                category: "team",
                members: [
                    { name: "Jordan Lee", role: "Owner", photoSrc: "", bio: "", href: "" },
                    { name: "Casey Morgan", role: "Senior stylist", photoSrc: "", bio: "", href: "" },
                    { name: "Riley James", role: "Apprentice", photoSrc: "", bio: "", href: "" },
                ],
            })
        case "logoStrip":
            return logoStripDataSchema.parse({
                category: "logoStrip",
                logos: [{ name: "Brand One", src: "", href: "" }, { name: "Brand Two", src: "", href: "" }, { name: "Brand Three", src: "", href: "" }, { name: "Brand Four", src: "", href: "" }],
            })
        case "beforeAfter":
            return beforeAfterDataSchema.parse({
                category: "beforeAfter",
                pairs: [{ beforeSrc: "", afterSrc: "", caption: "Full transformation" }, { beforeSrc: "", afterSrc: "", caption: "Detail work" }],
            })
        case "video":
            return videoDataSchema.parse({ category: "video", heading: "See us in action", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "" })
        case "priceList":
            return priceListDataSchema.parse({
                category: "priceList",
                sections: [
                    { title: "Starters", items: [{ name: "Soup of the day", description: "", price: "$6" }, { name: "Festival (4)", description: "Sweet fried dumplings", price: "$5" }] },
                    { title: "Mains", items: [{ name: "Jerk chicken", description: "Rice & peas, festival", price: "$14" }, { name: "Curry goat", description: "Sunday special", price: "$18" }] },
                ],
            })
        case "locationMap":
            return locationMapDataSchema.parse({ category: "locationMap", address: business.address !== "" ? business.address : "12 Main Street, Kingston" })
        case "events":
            return eventsDataSchema.parse({
                category: "events",
                events: [
                    { title: "Live music night", dateText: "Fri Aug 14, 8pm", location: "In store", description: "", href: "" },
                    { title: "Customer appreciation day", dateText: "Sat Aug 22", location: "", description: "Discounts all day.", href: "" },
                ],
            })
        case "pricingPlans":
            return pricingPlansDataSchema.parse({
                category: "pricingPlans",
                plans: [
                    { name: "Standard", price: "$50", period: "/visit", features: ["The essentials", "Any weekday"], highlighted: false },
                    { name: "Premium", price: "$80", period: "/visit", features: ["Everything in Standard", "Priority booking", "Weekend slots"], highlighted: true, ctaLabel: "Choose Premium" },
                ],
            })
        case "ctaBanner":
            return ctaBannerDataSchema.parse({ category: "ctaBanner", heading: "Ready when you are.", blurb: "Book in under a minute — no account needed.", ctaLabel: "Book now" })
        case "announcement":
            return announcementDataSchema.parse({ category: "announcement", text: "Holiday hours this weekend — open till 9pm!", href: "", linkLabel: "" })
        case "hours":
        case "navbar":
        case "contact":
        case "booking":
        case "products":
        case "footer":
        case "newsletter":
        case "divider":
        case "embed":
            return base
    }
}
