"use server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { revalidateTag, unstable_cache } from "next/cache"
import { db } from "@/db"
import { tenantAvailability, tenantBookings, tenantMessages, tenants } from "@/db/schema"
import { siteContentSchema, SiteContent, defaultSiteContent } from "@/lib/sites/content"
import { siteConfigSchema, SiteConfig, defaultSiteConfig } from "@/lib/sites/config"
import { addonsById } from "@/lib/sites/addons"
import { compositions, compositionsById } from "@/lib/sites/compositions"
import { slugSchema, normalizeSlug } from "@/lib/sites/slug"
import { sessionCheckWithError } from "@/useful/sessionCheck"

//============================================================
// Tenant CRUD. Public tenant pages read through the per-slug
// cache tag; every mutation here busts exactly that tag, so
// pages are cached aggressively and correct immediately.
//============================================================

export async function getTenantBySlugCached(slugRaw: string) {
    const slug = slugSchema.parse(slugRaw)

    const cachedRead = unstable_cache(
        async () => {
            const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
            return tenant ?? null
        },
        [`tenant-${slug}`],
        { tags: [`tenant:${slug}`], revalidate: 3600 },
    )

    return cachedRead()
}

function bustTenant(slug: string) {
    revalidateTag(`tenant:${slug}`, "max")
}

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
})

export async function createDraftTenant(input: z.infer<typeof createDraftSchema>): Promise<{ tenantId: string; slug: string }> {
    const session = await sessionCheckWithError()
    const validated = createDraftSchema.parse(input)

    const availability = await checkSlugAvailability(validated.slug)
    if (!availability.available) throw new Error(availability.reason ?? "name unavailable")

    const defaultComposition = compositions[0]

    const [created] = await db.insert(tenants).values({
        slug: availability.slug,
        businessName: validated.businessName,
        ownerUserId: session.user.id,
        content: defaultSiteContent(validated.businessName),
        config: defaultSiteConfig(defaultComposition.id, defaultComposition.defaultThemeId),
    }).returning()

    return { tenantId: created.id, slug: created.slug }
}

//------------------------------------------------------------
// owner-gated reads & writes
//------------------------------------------------------------

async function getOwnedTenant(tenantId: string) {
    const session = await sessionCheckWithError()
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, z.string().parse(tenantId)) })
    if (tenant === undefined) throw new Error("tenant not found")
    if (tenant.ownerUserId !== session.user.id && session.user.role !== "admin") {
        throw new Error("not authorised for this tenant")
    }
    return tenant
}

export async function getMyTenants() {
    const session = await sessionCheckWithError()
    return db.query.tenants.findMany({ where: eq(tenants.ownerUserId, session.user.id) })
}

export async function getOwnedTenantById(tenantId: string) {
    return getOwnedTenant(tenantId)
}

export async function updateTenantContent(tenantId: string, contentRaw: SiteContent) {
    const tenant = await getOwnedTenant(tenantId)
    const content = siteContentSchema.parse(contentRaw)

    await db.update(tenants)
        .set({ content, businessName: content.business.name, updatedAt: new Date() })
        .where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug)
    return { ok: true }
}

export async function updateTenantConfig(tenantId: string, configRaw: SiteConfig) {
    const tenant = await getOwnedTenant(tenantId)
    const config = siteConfigSchema.parse(configRaw)

    if (compositionsById[config.compositionId] === undefined) throw new Error("unknown composition")

    //only fully-built add-ons can be enabled
    for (const addonId of config.enabledAddons) {
        if (addonsById[addonId].status !== "available") throw new Error(`${addonsById[addonId].name} is not available yet`)
    }

    await db.update(tenants)
        .set({ config, updatedAt: new Date() })
        .where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug)
    return { ok: true }
}

//------------------------------------------------------------
// booking add-on management (owner side)
//------------------------------------------------------------

const availabilityRuleSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z.string().regex(/^\d{2}:\d{2}$/),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotMinutes: z.number().int().min(5).max(240),
})

export async function setTenantAvailability(tenantId: string, rulesRaw: z.infer<typeof availabilityRuleSchema>[]) {
    const tenant = await getOwnedTenant(tenantId)
    const rules = availabilityRuleSchema.array().max(7).parse(rulesRaw)

    await db.transaction(async tx => {
        await tx.delete(tenantAvailability).where(eq(tenantAvailability.tenantId, tenant.id))
        if (rules.length > 0) {
            await tx.insert(tenantAvailability).values(rules.map(rule => ({ ...rule, tenantId: tenant.id })))
        }
    })

    return { ok: true }
}

export async function getTenantAvailability(tenantId: string) {
    const tenant = await getOwnedTenant(tenantId)
    return db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) })
}

export async function getTenantBookings(tenantId: string) {
    const tenant = await getOwnedTenant(tenantId)
    return db.query.tenantBookings.findMany({
        where: eq(tenantBookings.tenantId, tenant.id),
        orderBy: (bookings, { desc }) => [desc(bookings.startsAt)],
        limit: 200,
    })
}

export async function setBookingStatus(tenantId: string, bookingId: string, status: "confirmed" | "cancelled") {
    const tenant = await getOwnedTenant(tenantId)
    await db.update(tenantBookings)
        .set({ status })
        .where(and(eq(tenantBookings.id, z.string().parse(bookingId)), eq(tenantBookings.tenantId, tenant.id)))
    return { ok: true }
}

export async function getTenantMessages(tenantId: string) {
    const tenant = await getOwnedTenant(tenantId)
    return db.query.tenantMessages.findMany({
        where: eq(tenantMessages.tenantId, tenant.id),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit: 200,
    })
}

export async function markMessageRead(tenantId: string, messageId: string) {
    const tenant = await getOwnedTenant(tenantId)
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
