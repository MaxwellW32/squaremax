"use server"
import { z } from "zod"
import { desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantPayments, tenants } from "@/db/schema"
import { appUrl, gatewayConfigured, initiateHostedPayment, storeRedirectPage } from "@/lib/payments/powertranz"
import { MAX_MONTHS_AHEAD, PaymentRow, checkoutAmountCents } from "@/lib/sites/billing"
import { bustTenant, getOwnedTenant } from "@/lib/sites/owner"

//============================================================
// Tenant subscription billing (prepaid periods, cheers pattern):
// pending payment row first → hosted-page sale → callback
// re-verifies server-side → period extended by 30 days per month
// bought. The charge covers base + currently-enabled add-ons, and
// the customer may settle several months in one go.
//============================================================

const monthsSchema = z.number().int().min(1).max(MAX_MONTHS_AHEAD)

//owner-visible receipt history — newest first
export async function getTenantPayments(tenantId: string): Promise<PaymentRow[]> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    const rows = await db.query.tenantPayments.findMany({
        where: eq(tenantPayments.tenantId, tenant.id),
        orderBy: [desc(tenantPayments.createdAt)],
        limit: 60,
    })

    return rows.map(row => ({
        id: row.id,
        amountCents: row.amountCents,
        months: row.months,
        status: row.status,
        gatewayTransactionId: row.gatewayTransactionId,
        periodStart: row.periodStart?.toISOString() ?? null,
        periodEnd: row.periodEnd?.toISOString() ?? null,
        addonsSnapshot: row.addonsSnapshot,
        createdAt: row.createdAt.toISOString(),
    }))
}

//monthsRaw defaults to 1 so the older single-month callers keep working
export async function startTenantCheckout(tenantId: string, monthsRaw: number = 1): Promise<{ url: string }> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const months = monthsSchema.parse(monthsRaw)

    if (!gatewayConfigured()) throw new Error("payments are not configured yet — set POWERTRANZ_* env vars or POWERTRANZ_SIMULATE=1")

    //price is recomputed here from the tenant's own add-ons — never trusted
    //from the browser — and snapshotted on the row for the audit trail
    const amountCents = checkoutAmountCents(tenant.config.enabledAddons, months)

    //pending row first, so the callback has something to promote
    const [payment] = await db.insert(tenantPayments).values({
        tenantId: tenant.id,
        amountCents,
        months,
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

// Take the site offline / bring it back. Prepaid time is NOT lost: the paid
// period keeps running, so turning the site back on restores whatever is left
// of it. Only tenants that have paid at least once can be resumed this way —
// a draft still has to go through checkout.
export async function setTenantOnline(tenantId: string, online: boolean): Promise<{ status: "live" | "cancelled" }> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const wanted = z.boolean().parse(online)

    if (wanted && tenant.currentPeriodEnd === null) throw new Error("pay for your first period to put the site online")

    const status = wanted ? "live" : "cancelled"
    await db.update(tenants).set({ status, updatedAt: new Date() }).where(eq(tenants.id, tenant.id))

    bustTenant(tenant.slug, tenant.customDomain)
    return { status }
}
