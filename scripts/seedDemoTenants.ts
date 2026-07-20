/* Seed two demo tenants for instant demos (instance model):
     npx tsx scripts/seedDemoTenants.ts
   Idempotent: re-running rebuilds the same slugs (pages + components are
   replaced wholesale). Owner = first admin user. */
import "./loadEnv"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq } from "drizzle-orm"
import * as schema from "../db/schema"
import { siteMetaSchema, SiteMeta, ComponentData } from "../lib/sites/content"
import { siteConfigSchema, SiteConfig } from "../lib/sites/config"
import { siteTemplatesById, instantiateTemplate, InstantiatedComponent } from "../lib/sites/siteTemplates"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL, max: 2 }), { schema })

//merge demo copy into the template-instantiated components: for each category,
//patches are consumed in order (two text components -> two patches)
function patchComponents(components: InstantiatedComponent[], patches: Partial<Record<ComponentData["category"], Partial<ComponentData>[]>>): InstantiatedComponent[] {
    const consumed: Partial<Record<string, number>> = {}
    return components.map(component => {
        const categoryPatches = patches[component.category]
        if (categoryPatches === undefined) return component
        const index = consumed[component.category] ?? 0
        if (index >= categoryPatches.length) return component
        consumed[component.category] = index + 1
        return { ...component, data: { ...component.data, ...categoryPatches[index] } as ComponentData }
    })
}

type Demo = {
    slug: string
    businessName: string
    templateId: string
    meta: SiteMeta
    config: SiteConfig
    patches: Partial<Record<ComponentData["category"], Partial<ComponentData>[]>>
    availability: { dayOfWeek: number; openTime: string; closeTime: string; slotMinutes: number }[]
    products: { name: string; description: string; priceCents: number; taxRateBps: number; stock: number; imageSrc: string }[]
}

const demos: Demo[] = [
    {
        slug: "fade-district",
        businessName: "Fade District",
        templateId: "storefront-classic",
        meta: siteMetaSchema.parse({
            schemaVersion: 2,
            business: {
                name: "Fade District",
                tagline: "Sharp cuts, zero waiting",
                description: "Kingston's appointment-only barbershop. Book your slot, walk in, walk out sharp.",
                industry: "Barbershop",
                phone: "+1 (876) 555-0142",
                whatsapp: "18765550142",
                email: "bookings@fadedistrict.example",
                address: "12 Half Way Tree Rd, Kingston",
                socials: [{ platform: "instagram", url: "https://instagram.com/fadedistrict" }],
                logoUrl: "",
            },
            seo: { title: "Fade District — Sharp cuts, zero waiting", description: "Appointment-only barbershop in Kingston. Book online, skip the line." },
        }),
        config: siteConfigSchema.parse({ schemaVersion: 2, themeId: "barber", themeOverrides: {}, enabledAddons: ["booking", "notifications"] }),
        patches: {
            hero: [{ heading: "Sharp cuts, zero waiting", subheading: "Appointment-only barbershop in Kingston. Book online, skip the line.", ctaLabel: "Book my cut" }],
            services: [{
                heading: "Services",
                items: [
                    { name: "Classic cut", description: "Fade, taper or scissor cut", price: "$25", imageSrc: "" },
                    { name: "Cut + beard", description: "Full cut with beard shape-up", price: "$35", imageSrc: "" },
                    { name: "Kids cut", description: "12 and under", price: "$15", imageSrc: "" },
                    { name: "Line-up", description: "Edge-up between cuts", price: "$10", imageSrc: "" },
                ],
            }],
            testimonials: [{
                heading: "What the chair says",
                items: [
                    { quote: "Booked at 2, cut by 2:05, out by 2:35. Every single time.", author: "Andre M.", role: "" },
                    { quote: "Best fade in Kingston, and I never wait.", author: "Ricardo B.", role: "" },
                ],
            }],
            hours: [{
                heading: "Opening hours",
                entries: [
                    { label: "Tue – Fri", hours: "9am – 6pm" },
                    { label: "Saturday", hours: "8am – 4pm" },
                    { label: "Sun & Mon", hours: "Closed" },
                ],
            }],
            booking: [{
                heading: "Book your cut",
                blurb: "Pick a service and a time — confirmation lands in your inbox.",
                services: [
                    { name: "Classic cut", durationMinutes: 30, price: "$25" },
                    { name: "Cut + beard", durationMinutes: 45, price: "$35" },
                    { name: "Kids cut", durationMinutes: 30, price: "$15" },
                    { name: "Line-up", durationMinutes: 15, price: "$10" },
                ],
            }],
            contact: [
                { heading: "Get in touch", blurb: "Questions about a booking? Message us." },
                { heading: "Visit the shop", blurb: "Walk-ins welcome when a chair is free — booking guarantees your slot." },
            ],
            text: [{
                heading: "About the shop",
                body: "Started in 2019 with one chair and a promise: your time matters. Every cut is booked, so you never sit around waiting.\n\nTwo barbers, one standard — leave sharper than you came.",
            }],
        },
        availability: [2, 3, 4, 5].map(dayOfWeek => ({ dayOfWeek, openTime: "09:00", closeTime: "18:00", slotMinutes: 30 }))
            .concat([{ dayOfWeek: 6, openTime: "08:00", closeTime: "16:00", slotMinutes: 30 }]),
        products: [],
    },
    {
        slug: "pepper-and-thyme",
        businessName: "Pepper & Thyme",
        templateId: "bold-banner",
        meta: siteMetaSchema.parse({
            schemaVersion: 2,
            business: {
                name: "Pepper & Thyme",
                tagline: "Island flavors, slow fire",
                description: "Family-run Jamaican kitchen — jerk done properly, sides made fresh daily.",
                industry: "Restaurant",
                phone: "+1 (876) 555-0177",
                whatsapp: "18765550177",
                email: "hello@pepperthyme.example",
                address: "48 Constant Spring Rd, Kingston",
                socials: [
                    { platform: "instagram", url: "https://instagram.com/pepperthyme" },
                    { platform: "facebook", url: "https://facebook.com/pepperthyme" },
                ],
                logoUrl: "",
            },
            seo: { title: "Pepper & Thyme — Island flavors, slow fire", description: "Jerk done properly over pimento wood. Lunch and dinner, Tuesday to Sunday." },
        }),
        //inventory on: the shop section sells bottled sauces — demos products + sales
        config: siteConfigSchema.parse({ schemaVersion: 2, themeId: "espresso", themeOverrides: {}, enabledAddons: ["notifications", "inventory"] }),
        patches: {
            announcement: [{ text: "Sunday special: curry goat until it's done — come early." }],
            hero: [{ heading: "Island flavors, slow fire", subheading: "Jerk done properly over pimento wood. Lunch and dinner, Tuesday to Sunday.", ctaLabel: "See the menu", ctaHref: "#services" }],
            services: [{
                heading: "Menu favorites",
                items: [
                    { name: "Jerk chicken plate", description: "Quarter chicken, rice & peas, festival", price: "$14", imageSrc: "" },
                    { name: "Jerk pork plate", description: "Slow-smoked, extra scotch bonnet on request", price: "$16", imageSrc: "" },
                    { name: "Curry goat", description: "Sunday special, until it's done", price: "$18", imageSrc: "" },
                    { name: "Festival (6)", description: "Sweet fried dumplings", price: "$5", imageSrc: "" },
                ],
            }],
            gallery: [{
                heading: "From the grill",
                images: [
                    { src: "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Grilled jerk chicken", caption: "Pimento-wood jerk" },
                    { src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Fresh plated meal", caption: "Made fresh daily" },
                    { src: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Kitchen at work", caption: "The kitchen" },
                ],
            }],
            testimonials: [{
                heading: "Table talk",
                items: [{ quote: "The jerk pork is the closest thing to Boston Bay in town.", author: "Keisha W.", role: "" }],
            }],
            contact: [{ heading: "Find us", blurb: "Catering and event inquiries welcome." }],
        },
        availability: [],
        products: [
            { name: "Scotch bonnet jerk sauce (250ml)", description: "Our house marinade, bottled.", priceCents: 899, taxRateBps: 1500, stock: 24, imageSrc: "" },
            { name: "Dry jerk rub (100g)", description: "Pimento, thyme, scotch bonnet.", priceCents: 650, taxRateBps: 1500, stock: 30, imageSrc: "" },
        ],
    },
]

async function main() {
    const admin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin") })
    const owner = admin ?? await db.query.users.findFirst()
    if (owner === undefined) throw new Error("no users in DB — sign in once first, then re-run")

    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    for (const demo of demos) {
        const template = siteTemplatesById[demo.templateId]
        if (template === undefined) throw new Error(`unknown template ${demo.templateId}`)

        const { pages, components } = instantiateTemplate(template, demo.meta.business)
        //bold-banner ships without a products section; the restaurant demo adds one
        const patched = patchComponents(components, demo.patches)
        if (demo.products.length > 0 && !patched.some(component => component.category === "products")) {
            const homePage = pages[0]
            const homeComponents = patched.filter(component => component.pageId === homePage.id)
            patched.push({
                id: crypto.randomUUID(),
                region: "main",
                pageId: homePage.id,
                order: homeComponents.length === 0 ? 0 : Math.max(...homeComponents.map(component => component.order)) + 1,
                category: "products",
                variantId: "products.grid",
                data: { category: "products", heading: "Take the flavor home", blurb: "Bottled in our kitchen — order on WhatsApp, pick up in store.", orderMethod: "whatsapp" },
                styles: { tokens: {}, css: "" },
            })
        }

        const existing = await db.query.tenants.findFirst({ where: eq(schema.tenants.slug, demo.slug) })

        let tenantId: string
        if (existing !== undefined) {
            await db.update(schema.tenants)
                .set({ businessName: demo.businessName, content: demo.meta, config: demo.config, status: "live", currentPeriodEnd: in30Days, updatedAt: new Date() })
                .where(eq(schema.tenants.id, existing.id))
            tenantId = existing.id
            console.log(`updated ${demo.slug}`)
        } else {
            const [created] = await db.insert(schema.tenants).values({
                id: crypto.randomUUID(),
                slug: demo.slug,
                businessName: demo.businessName,
                ownerUserId: owner.id,
                status: "live",
                currentPeriodEnd: in30Days,
                content: demo.meta,
                config: demo.config,
            }).returning()
            tenantId = created.id
            console.log(`created ${demo.slug}`)
        }

        //rebuild structure wholesale (components reference pages, so order matters)
        await db.delete(schema.tenantComponents).where(eq(schema.tenantComponents.tenantId, tenantId))
        await db.delete(schema.tenantPages).where(eq(schema.tenantPages.tenantId, tenantId))
        await db.insert(schema.tenantPages).values(pages.map(page => ({ ...page, tenantId })))
        await db.insert(schema.tenantComponents).values(patched.map(component => ({ ...component, tenantId })))

        await db.delete(schema.tenantAvailability).where(eq(schema.tenantAvailability.tenantId, tenantId))
        if (demo.availability.length > 0) {
            await db.insert(schema.tenantAvailability).values(demo.availability.map(rule => ({ id: crypto.randomUUID(), ...rule, tenantId })))
        }

        await db.delete(schema.tenantProducts).where(eq(schema.tenantProducts.tenantId, tenantId))
        if (demo.products.length > 0) {
            await db.insert(schema.tenantProducts).values(demo.products.map(product => ({
                id: crypto.randomUUID(), ...product, trackStock: true, active: true, tenantId,
            })))
        }
    }

    console.log("done — visit /fade-district and /pepper-and-thyme")
    process.exit(0)
}

main().catch(error => { console.error(error); process.exit(1) })
