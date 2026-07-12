"use server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantPayments, tenants } from "@/db/schema"
import { monthlyTotal } from "@/lib/sites/addons"
import { appUrl, gatewayConfigured, initiateHostedPayment, storeRedirectPage } from "@/lib/payments/powertranz"
import { sessionCheckWithError } from "@/useful/sessionCheck"

//============================================================
// Tenant subscription billing (prepaid periods, cheers pattern):
// pending payment row first → hosted-page sale → callback
// re-verifies server-side → period extended by 30 days.
// The charge covers base + currently-enabled add-ons.
//============================================================

export async function startTenantCheckout(tenantId: string): Promise<{ url: string }> {
    const session = await sessionCheckWithError()

    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) })
    if (tenant === undefined) throw new Error("tenant not found")
    if (tenant.ownerUserId !== session.user.id && session.user.role !== "admin") throw new Error("not authorised")

    if (!gatewayConfigured()) throw new Error("payments are not configured yet — set POWERTRANZ_* env vars or POWERTRANZ_SIMULATE=1")

    const amountCents = monthlyTotal(tenant.config.enabledAddons) * 100

    //pending row first, so the callback has something to promote
    const [payment] = await db.insert(tenantPayments).values({
        tenantId: tenant.id,
        amountCents,
        addonsSnapshot: tenant.config.enabledAddons,
    }).returning()

    const gateway = await initiateHostedPayment({
        amountCents,
        orderId: `sub-${tenant.slug}-${payment.id.slice(0, 8)}`,
        responseUrl: appUrl(`/api/pay/callback?payment=${payment.id}&tenant=${tenant.id}`),
    })

    const token = storeRedirectPage(gateway.redirectData)
    return { url: `/api/pay/session/${token}` }
}
