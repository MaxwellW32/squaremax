import { eq } from "drizzle-orm"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { slugSchema } from "@/lib/sites/slug"

//the tenant behind a PUBLIC action (booking, order, message, sign-up):
//must exist and be visible. Shared by every public server-action module.
export async function getVisibleTenantBySlug(slugRaw: string) {
    const slug = slugSchema.parse(slugRaw)
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
    if (tenant === undefined) throw new Error("page not found")
    if (!isPubliclyVisible(effectiveStatus(tenant))) throw new Error("page is paused")
    return tenant
}
