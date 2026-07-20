"use server"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantBookings, tenantCustomers, tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { slugSchema } from "@/lib/sites/slug"
import { hashPassword, verifyPassword } from "@/lib/sites/passwords"
import { createCustomerSession, destroyCustomerSession, getCurrentCustomer } from "@/lib/sites/customerAuth"
import { getOwnedTenant } from "@/lib/sites/owner"

//============================================================
// Customer accounts on CLIENT sites. Everything is scoped to
// one tenant: the unique key is (tenantId, email), the session
// cookie embeds the tenant id, and no action ever reaches across
// tenants (except the owner-gated import below).
//============================================================

async function getVisibleTenantBySlug(slugRaw: string) {
    const slug = slugSchema.parse(slugRaw)
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
    if (tenant === undefined) throw new Error("page not found")
    if (!isPubliclyVisible(effectiveStatus(tenant))) throw new Error("page is paused")
    return tenant
}

function publicCustomer(customer: typeof tenantCustomers.$inferSelect) {
    return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        notifyEmail: customer.notifyEmail,
        notifyWhatsapp: customer.notifyWhatsapp,
    }
}
export type PublicCustomer = ReturnType<typeof publicCustomer>

//------------------------------------------------------------
// customer-facing (called from the tenant site)
//------------------------------------------------------------

const signUpSchema = z.object({
    slug: z.string(),
    name: z.string().min(1).max(120),
    email: z.email().max(160),
    phone: z.string().max(40).default(""),
    password: z.string().min(8).max(200),
})

export async function customerSignUp(input: z.infer<typeof signUpSchema>) {
    const validated = signUpSchema.parse(input)
    const tenant = await getVisibleTenantBySlug(validated.slug)
    const email = validated.email.toLowerCase()

    const existing = await db.query.tenantCustomers.findFirst({
        where: and(eq(tenantCustomers.tenantId, tenant.id), eq(tenantCustomers.email, email)),
    })
    if (existing !== undefined) {
        //newsletter subscribers (no password yet) claim their record here
        if (existing.passwordHash !== "") throw new Error("an account with that email already exists — sign in instead")

        await db.update(tenantCustomers).set({
            name: validated.name,
            phone: validated.phone,
            passwordHash: hashPassword(validated.password),
        }).where(eq(tenantCustomers.id, existing.id))

        await createCustomerSession(tenant.id, existing.id)
        return publicCustomer({ ...existing, name: validated.name, phone: validated.phone })
    }

    const [created] = await db.insert(tenantCustomers).values({
        tenantId: tenant.id,
        email,
        name: validated.name,
        phone: validated.phone,
        passwordHash: hashPassword(validated.password),
    }).returning()

    await createCustomerSession(tenant.id, created.id)
    return publicCustomer(created)
}

const signInSchema = z.object({
    slug: z.string(),
    email: z.email().max(160),
    password: z.string().min(1).max(200),
})

export async function customerSignIn(input: z.infer<typeof signInSchema>) {
    const validated = signInSchema.parse(input)
    const tenant = await getVisibleTenantBySlug(validated.slug)

    const customer = await db.query.tenantCustomers.findFirst({
        where: and(eq(tenantCustomers.tenantId, tenant.id), eq(tenantCustomers.email, validated.email.toLowerCase())),
    })
    //same error for unknown email and wrong password — no account enumeration
    if (customer === undefined || !verifyPassword(validated.password, customer.passwordHash)) {
        throw new Error("email or password is incorrect")
    }

    await createCustomerSession(tenant.id, customer.id)
    return publicCustomer(customer)
}

export async function customerSignOut(slugRaw: string) {
    const tenant = await getVisibleTenantBySlug(slugRaw)
    await destroyCustomerSession(tenant.id)
    return { ok: true }
}

export async function getSignedInCustomer(slugRaw: string): Promise<PublicCustomer | null> {
    const tenant = await getVisibleTenantBySlug(slugRaw)
    const customer = await getCurrentCustomer(tenant.id)
    return customer === null ? null : publicCustomer(customer)
}

const prefsSchema = z.object({
    slug: z.string(),
    name: z.string().min(1).max(120),
    phone: z.string().max(40).default(""),
    notifyEmail: z.boolean(),
    notifyWhatsapp: z.boolean(),
})

export async function updateCustomerPrefs(input: z.infer<typeof prefsSchema>) {
    const validated = prefsSchema.parse(input)
    const tenant = await getVisibleTenantBySlug(validated.slug)
    const customer = await getCurrentCustomer(tenant.id)
    if (customer === null) throw new Error("sign in first")

    await db.update(tenantCustomers).set({
        name: validated.name,
        phone: validated.phone,
        notifyEmail: validated.notifyEmail,
        notifyWhatsapp: validated.notifyWhatsapp,
    }).where(eq(tenantCustomers.id, customer.id))

    return { ok: true }
}

//the signed-in customer's own bookings on THIS tenant
export async function getMyCustomerBookings(slugRaw: string) {
    const tenant = await getVisibleTenantBySlug(slugRaw)
    const customer = await getCurrentCustomer(tenant.id)
    if (customer === null) throw new Error("sign in first")

    return db.query.tenantBookings.findMany({
        where: and(eq(tenantBookings.tenantId, tenant.id), eq(tenantBookings.customerId, customer.id)),
        orderBy: [desc(tenantBookings.startsAt)],
        limit: 50,
    })
}

//------------------------------------------------------------
// owner-facing (dashboard)
//------------------------------------------------------------

export async function getTenantCustomers(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantCustomers.findMany({
        where: eq(tenantCustomers.tenantId, tenant.id),
        orderBy: [desc(tenantCustomers.createdAt)],
        limit: 500,
        columns: { passwordHash: false },
    })
}

//copy customers from another site the SAME owner runs (e.g. spinning up a
//second business). Password hashes come along so people can sign straight in;
//duplicates (same email) are skipped.
export async function importCustomersFromTenant(targetTenantId: string, sourceTenantId: string) {
    const target = await getOwnedTenant(z.string().parse(targetTenantId))
    const source = await getOwnedTenant(z.string().parse(sourceTenantId))
    if (target.id === source.id) throw new Error("choose a different site to import from")

    const [sourceCustomers, targetCustomers] = await Promise.all([
        db.query.tenantCustomers.findMany({ where: eq(tenantCustomers.tenantId, source.id) }),
        db.query.tenantCustomers.findMany({ where: eq(tenantCustomers.tenantId, target.id) }),
    ])

    const existingEmails = new Set(targetCustomers.map(customer => customer.email))
    const toCopy = sourceCustomers.filter(customer => !existingEmails.has(customer.email))

    if (toCopy.length > 0) {
        await db.insert(tenantCustomers).values(toCopy.map(customer => ({
            tenantId: target.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            passwordHash: customer.passwordHash,
            notifyEmail: customer.notifyEmail,
            notifyWhatsapp: customer.notifyWhatsapp,
        })))
    }

    return { imported: toCopy.length, skipped: sourceCustomers.length - toCopy.length }
}
