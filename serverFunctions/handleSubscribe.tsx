"use server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantCustomers, tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { slugSchema } from "@/lib/sites/slug"

//newsletter signup (public, no auth imports — this file sits in the section
//component import chain). Creates a password-less customer record opted into
//email; verifyPassword against the empty hash always fails, so the record
//can't sign in until they claim it with a password from /account.

const subscribeSchema = z.object({
    slug: z.string(),
    email: z.email().max(160),
})

export async function subscribeToUpdates(input: z.infer<typeof subscribeSchema>) {
    const validated = subscribeSchema.parse(input)
    const slug = slugSchema.parse(validated.slug)

    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
    if (tenant === undefined) throw new Error("page not found")
    if (!isPubliclyVisible(effectiveStatus(tenant))) throw new Error("page is paused")

    const email = validated.email.toLowerCase()
    const existing = await db.query.tenantCustomers.findFirst({
        where: and(eq(tenantCustomers.tenantId, tenant.id), eq(tenantCustomers.email, email)),
    })
    if (existing !== undefined) {
        //already known — just make sure they're opted in
        if (!existing.notifyEmail) {
            await db.update(tenantCustomers).set({ notifyEmail: true }).where(eq(tenantCustomers.id, existing.id))
        }
        return { ok: true }
    }

    await db.insert(tenantCustomers).values({
        tenantId: tenant.id,
        email,
        name: "",
        phone: "",
        passwordHash: "", //subscriber-only: cannot sign in until they set one
        notifyEmail: true,
    })
    return { ok: true }
}
