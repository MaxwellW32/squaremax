import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { sessionCheckWithError } from "@/useful/sessionCheck"

//shared owner-gating for tenant server actions ("use server" modules may only
//export async actions, so these helpers live here instead)

export async function getOwnedTenant(tenantId: string) {
    const session = await sessionCheckWithError()
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) })
    if (tenant === undefined) throw new Error("tenant not found")
    if (tenant.ownerUserId !== session.user.id && session.user.role !== "admin") {
        throw new Error("not authorised for this tenant")
    }
    return tenant
}

export function bustTenant(slug: string, customDomain: string | null) {
    revalidateTag(`tenant:${slug}`, "max")
    //the custom-domain page caches under its own tag — bust it too or the
    //tenant's own domain serves stale content for up to an hour
    if (customDomain !== null) revalidateTag(`tenant-domain:${customDomain}`, "max")
}
