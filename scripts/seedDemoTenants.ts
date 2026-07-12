/* Seed two demo tenants for instant demos:
     npx tsx scripts/seedDemoTenants.ts   (or: node --env-file=.env.local --experimental-strip-types scripts/seedDemoTenants.ts)
   Idempotent: re-running updates the same slugs. Owner = first admin user. */
import { config } from "dotenv"
config({ path: ".env.local" })

import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq } from "drizzle-orm"
import * as schema from "../db/schema"
import { siteContentSchema } from "../lib/sites/content"
import { defaultSiteConfig, siteConfigSchema } from "../lib/sites/config"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL, max: 2 }), { schema })

const barbershopContent = siteContentSchema.parse({
    schemaVersion: 1,
    business: {
        name: "Fade District",
        tagline: "Sharp cuts, zero waiting",
        description: "Kingston's appointment-only barbershop. Book your slot, walk in, walk out sharp.",
        industry: "Barbershop",
        phone: "+1 (876) 555-0142",
        email: "bookings@fadedistrict.example",
        address: "12 Half Way Tree Rd, Kingston",
        socials: [{ platform: "instagram", url: "https://instagram.com/fadedistrict" }],
        logoUrl: "",
    },
    hero: {
        heading: "Sharp cuts, zero waiting",
        subheading: "Appointment-only barbershop in Kingston. Book online, skip the line.",
        imageUrl: "",
        ctaLabel: "Book my cut",
    },
    about: {
        heading: "About the shop",
        body: "Started in 2019 with one chair and a promise: your time matters. Every cut is booked, so you never sit around waiting. Two barbers, one standard — leave sharper than you came.",
        imageUrl: "",
    },
    services: {
        heading: "Services",
        items: [
            { name: "Classic cut", description: "Fade, taper or scissor cut", price: "$25", durationMinutes: 30 },
            { name: "Cut + beard", description: "Full cut with beard shape-up", price: "$35", durationMinutes: 45 },
            { name: "Kids cut", description: "12 and under", price: "$15", durationMinutes: 30 },
            { name: "Line-up", description: "Edge-up between cuts", price: "$10", durationMinutes: 15 },
        ],
    },
    gallery: { heading: "Fresh work", images: [] },
    testimonials: {
        heading: "What the chair says",
        items: [
            { quote: "Booked at 2, cut by 2:05, out by 2:35. Every single time.", author: "Andre M." },
            { quote: "Best fade in Kingston, and I never wait.", author: "Ricardo B." },
        ],
    },
    hours: {
        heading: "Opening hours",
        entries: [
            { label: "Tue – Fri", hours: "9am – 6pm" },
            { label: "Saturday", hours: "8am – 4pm" },
            { label: "Sun & Mon", hours: "Closed" },
        ],
    },
    contact: { heading: "Get in touch", blurb: "Questions about a booking? Message us.", showMessageForm: true },
})

const restaurantContent = siteContentSchema.parse({
    schemaVersion: 1,
    business: {
        name: "Pepper & Thyme",
        tagline: "Island flavors, slow fire",
        description: "Family-run Jamaican kitchen — jerk done properly, sides made fresh daily.",
        industry: "Restaurant",
        phone: "+1 (876) 555-0177",
        email: "hello@pepperthyme.example",
        address: "48 Constant Spring Rd, Kingston",
        socials: [
            { platform: "instagram", url: "https://instagram.com/pepperthyme" },
            { platform: "facebook", url: "https://facebook.com/pepperthyme" },
        ],
        logoUrl: "",
    },
    hero: {
        heading: "Island flavors, slow fire",
        subheading: "Jerk done properly over pimento wood. Lunch and dinner, Tuesday to Sunday.",
        imageUrl: "",
        ctaLabel: "See the menu",
    },
    about: {
        heading: "Our kitchen",
        body: "Three generations of family recipes. We season overnight, smoke over pimento wood, and make every side from scratch each morning. Come hungry.",
        imageUrl: "",
    },
    services: {
        heading: "Menu favorites",
        items: [
            { name: "Jerk chicken plate", description: "Quarter chicken, rice & peas, festival", price: "$14" },
            { name: "Jerk pork plate", description: "Slow-smoked, extra scotch bonnet on request", price: "$16" },
            { name: "Curry goat", description: "Sunday special, until it's done", price: "$18" },
            { name: "Festival (6)", description: "Sweet fried dumplings", price: "$5" },
        ],
    },
    gallery: {
        heading: "From the grill",
        images: [
            { src: "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Grilled jerk chicken" },
            { src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Fresh plated meal" },
            { src: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Kitchen at work" },
        ],
    },
    testimonials: {
        heading: "Table talk",
        items: [
            { quote: "The jerk pork is the closest thing to Boston Bay in town.", author: "Keisha W." },
        ],
    },
    hours: {
        heading: "Opening hours",
        entries: [
            { label: "Tue – Sat", hours: "11am – 10pm" },
            { label: "Sunday", hours: "12pm – 8pm" },
            { label: "Monday", hours: "Closed" },
        ],
    },
    contact: { heading: "Find us", blurb: "Catering and event inquiries welcome.", showMessageForm: true },
})

async function main() {
    const admin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin") })
    const owner = admin ?? await db.query.users.findFirst()
    if (owner === undefined) throw new Error("no users in DB — sign in once first, then re-run")

    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const demos = [
        {
            slug: "fade-district",
            businessName: "Fade District",
            content: barbershopContent,
            config: siteConfigSchema.parse({
                ...defaultSiteConfig("storefront-classic", "barber"),
                enabledAddons: ["booking", "email-notifications"],
            }),
            availability: [2, 3, 4, 5].map(dayOfWeek => ({ dayOfWeek, openTime: "09:00", closeTime: "18:00", slotMinutes: 30 }))
                .concat([{ dayOfWeek: 6, openTime: "08:00", closeTime: "16:00", slotMinutes: 30 }]),
        },
        {
            slug: "pepper-and-thyme",
            businessName: "Pepper & Thyme",
            content: restaurantContent,
            config: siteConfigSchema.parse({
                ...defaultSiteConfig("bold-banner", "espresso"),
                variantOverrides: { services: "services.list" },
                enabledAddons: ["gallery"], //coming-soon in the picker; seeded directly to demo the section
            }),
            availability: [],
        },
    ]

    for (const demo of demos) {
        const existing = await db.query.tenants.findFirst({ where: eq(schema.tenants.slug, demo.slug) })

        let tenantId: string
        if (existing !== undefined) {
            await db.update(schema.tenants)
                .set({ content: demo.content, config: demo.config, status: "live", currentPeriodEnd: in30Days, updatedAt: new Date() })
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
                content: demo.content,
                config: demo.config,
            }).returning()
            tenantId = created.id
            console.log(`created ${demo.slug}`)
        }

        await db.delete(schema.tenantAvailability).where(eq(schema.tenantAvailability.tenantId, tenantId))
        if (demo.availability.length > 0) {
            await db.insert(schema.tenantAvailability).values(demo.availability.map(rule => ({ id: crypto.randomUUID(), ...rule, tenantId })))
        }
    }

    console.log("done — visit /fade-district and /pepper-and-thyme")
    process.exit(0)
}

main().catch(error => { console.error(error); process.exit(1) })
