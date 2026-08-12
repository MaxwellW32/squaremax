"use server"
import { z } from "zod"
import { and, eq, ne } from "drizzle-orm"
import { db } from "@/db"
import { tenantAvailability, tenantBookings, tenantComponents, tenantMessages, tenantPages, tenants } from "@/db/schema"
import { defaultSiteMeta } from "@/lib/sites/content"
import { defaultSiteConfig } from "@/lib/sites/config"
import { addonIdSchema, addonsById } from "@/lib/sites/addons"
import { siteTemplatesById, instantiateTemplate } from "@/lib/sites/siteTemplates"
import { slugSchema, normalizeSlug } from "@/lib/sites/slug"
import { sessionCheckWithError } from "@/useful/sessionCheck"
import { getOwnedTenant, bustTenant } from "@/lib/sites/owner"
import { sendEmailInBackground } from "@/lib/email/transporter"

//============================================================
// Tenant CRUD. Public tenant pages read through the per-slug
// cache tag; every mutation here busts exactly that tag, so
// pages are cached aggressively and correct immediately.
//============================================================

//------------------------------------------------------------
// onboarding
//------------------------------------------------------------

export async function checkSlugAvailability(raw: string): Promise<{ slug: string; available: boolean; reason?: string }> {
    const normalized = normalizeSlug(z.string().max(200).parse(raw))
    const parsed = slugSchema.safeParse(normalized)

    if (!parsed.success) {
        return { slug: normalized, available: false, reason: parsed.error.issues[0]?.message ?? "invalid name" }
    }

    const existing = await db.query.tenants.findFirst({ where: eq(tenants.slug, parsed.data) })
    if (existing !== undefined) {
        return { slug: parsed.data, available: false, reason: "already taken" }
    }

    return { slug: parsed.data, available: true }
}

const createDraftSchema = z.object({
    businessName: z.string().min(1).max(160),
    slug: z.string(),
    templateId: z.string().default("storefront-classic"),
})

//creates the tenant AND copies the chosen template into it component by
//component — every placed component gets its own unique id and data blob
export async function createDraftTenant(input: z.infer<typeof createDraftSchema>): Promise<{ tenantId: string; slug: string }> {
    const session = await sessionCheckWithError()
    const validated = createDraftSchema.parse(input)

    const availability = await checkSlugAvailability(validated.slug)
    if (!availability.available) throw new Error(availability.reason ?? "name unavailable")

    const template = siteTemplatesById[validated.templateId]
    if (template === undefined) throw new Error("unknown template")

    const meta = defaultSiteMeta(validated.businessName)
    const { pages, components } = instantiateTemplate(template, meta.business)

    let created
    try {
        created = await db.transaction(async tx => {
            const [tenant] = await tx.insert(tenants).values({
                slug: availability.slug,
                businessName: validated.businessName,
                ownerUserId: session.user.id,
                content: meta,
                config: defaultSiteConfig(template.themeId),
            }).returning()

            await tx.insert(tenantPages).values(pages.map(page => ({ ...page, tenantId: tenant.id })))
            if (components.length > 0) {
                await tx.insert(tenantComponents).values(components.map(component => ({ ...component, tenantId: tenant.id })))
            }
            return tenant
        })
    } catch (error) {
        //two people can pass the availability check at once; the unique index
        //decides. drizzle wraps the pg error, so the unique-violation code
        //(23505) lives on error.cause — the wrapper message is just the SQL
        const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined
        const pgCode = typeof cause === "object" && cause !== null && "code" in cause ? (cause as { code?: unknown }).code : undefined
        if (pgCode === "23505") {
            throw new Error("that name was just taken — try another")
        }
        throw error
    }

    return { tenantId: created.id, slug: created.slug }
}

//------------------------------------------------------------
// owner-gated reads & writes
//------------------------------------------------------------

export async function getMyTenants() {
    const session = await sessionCheckWithError()
    return db.query.tenants.findMany({ where: eq(tenants.ownerUserId, session.user.id) })
}

export async function getOwnedTenantById(tenantId: string) {
    return getOwnedTenant(z.string().parse(tenantId))
}

//add-on flags: only fully-built add-ons can be NEWLY enabled; add-ons already
//on the tenant may be kept without bricking every save
export async function setTenantAddons(tenantId: string, enabledAddonsRaw: unknown) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const enabledAddons = addonIdSchema.array().parse(enabledAddonsRaw)

    for (const addonId of enabledAddons) {
        const alreadyEnabled = tenant.config.enabledAddons.includes(addonId)
        if (!alreadyEnabled && addonsById[addonId].status !== "available") {
            throw new Error(`${addonsById[addonId].name} is not available yet`)
        }
    }

    await db.update(tenants)
        .set({ config: { ...tenant.config, enabledAddons }, updatedAt: new Date() })
        .where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//------------------------------------------------------------
// booking add-on management (owner side)
//------------------------------------------------------------

const timeOfDayRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const availabilityRuleSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z.string().regex(timeOfDayRegex, "use HH:MM (24h)"),
    closeTime: z.string().regex(timeOfDayRegex, "use HH:MM (24h)"),
    slotMinutes: z.number().int().min(5).max(240),
}).refine(rule => rule.openTime < rule.closeTime, "opening time must be before closing time")

const availabilityRulesSchema = availabilityRuleSchema.array().max(7)
    .refine(rules => new Set(rules.map(rule => rule.dayOfWeek)).size === rules.length, "one rule per weekday")

export async function setTenantAvailability(tenantId: string, rulesRaw: z.infer<typeof availabilityRuleSchema>[]) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const rules = availabilityRulesSchema.parse(rulesRaw)

    await db.transaction(async tx => {
        await tx.delete(tenantAvailability).where(eq(tenantAvailability.tenantId, tenant.id))
        if (rules.length > 0) {
            await tx.insert(tenantAvailability).values(rules.map(rule => ({ ...rule, tenantId: tenant.id })))
        }
    })

    return { ok: true }
}

export async function getTenantAvailability(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) })
}

export async function getTenantBookings(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantBookings.findMany({
        where: eq(tenantBookings.tenantId, tenant.id),
        orderBy: (bookings, { desc }) => [desc(bookings.startsAt)],
        limit: 200,
    })
}

export async function setBookingStatus(tenantId: string, bookingId: string, status: "confirmed" | "cancelled") {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const validatedStatus = z.enum(["confirmed", "cancelled"]).parse(status)

    //no-op (and no duplicate email) when the booking is already in that state
    const [booking] = await db.update(tenantBookings)
        .set({ status: validatedStatus })
        .where(and(
            eq(tenantBookings.id, z.string().parse(bookingId)),
            eq(tenantBookings.tenantId, tenant.id),
            ne(tenantBookings.status, validatedStatus),
        ))
        .returning()

    //the notifications add-on promises booking confirmations — tell the
    //customer when the business confirms or cancels their booking
    if (booking !== undefined && tenant.config.enabledAddons.includes("notifications") && booking.customerEmail !== "") {
        const when = booking.startsAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "America/Jamaica" })
        sendEmailInBackground(status === "confirmed"
            ? {
                to: booking.customerEmail,
                subject: `Booking confirmed — ${tenant.content.business.name}`,
                text: `Hi ${booking.customerName},\n\nYour booking for ${booking.serviceName} on ${when} is confirmed. See you then!\n\n${tenant.content.business.phone !== "" ? `Questions? Call ${tenant.content.business.phone}.` : ""}`,
            }
            : {
                to: booking.customerEmail,
                subject: `Booking cancelled — ${tenant.content.business.name}`,
                text: `Hi ${booking.customerName},\n\nYour booking for ${booking.serviceName} on ${when} was cancelled.\n${tenant.content.business.phone !== "" ? `If this is unexpected, call ${tenant.content.business.phone}.` : ""}`,
            })
    }

    return { ok: true }
}

export async function getTenantMessages(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantMessages.findMany({
        where: eq(tenantMessages.tenantId, tenant.id),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 200,
    })
}

export async function markMessageRead(tenantId: string, messageId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    await db.update(tenantMessages)
        .set({ read: true })
        .where(and(eq(tenantMessages.id, z.string().parse(messageId)), eq(tenantMessages.tenantId, tenant.id)))
    return { ok: true }
}

//------------------------------------------------------------
// admin
//------------------------------------------------------------

export async function getAllTenantsAdmin() {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("admin only")

    return db.query.tenants.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        with: { payments: { orderBy: (p, { desc }) => [desc(p.createdAt)], limit: 3 } },
    })
}
