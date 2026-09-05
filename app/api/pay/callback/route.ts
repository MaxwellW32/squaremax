import { eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantPayments, tenants } from "@/db/schema"
import { completeGatewayPayment, gatewaySimulated } from "@/lib/payments/powertranz"
import { periodEndAfter } from "@/lib/sites/billing"
import { bustTenantCache } from "@/lib/sites/tenantCache"

//============================================================
// PowerTranz MerchantResponseUrl. Intentionally unauthenticated:
// a forged POST is harmless because a payment only flips
// pending → succeeded via a real, completable SpiToken —
// server-side re-verification is the source of truth.
//
// Concurrency: the whole settle runs inside one transaction
// holding a per-payment advisory lock, with the payment row
// re-read and the tenant row locked FOR UPDATE. This makes
// duplicate callbacks idempotent AND makes two different
// payments for the same tenant stack (+30d each), never clobber.
//
// A payment buys `months` prepaid periods — the customer can
// settle several months in one charge from the Subscription tab.
//============================================================

async function parseCallbackBody(request: Request): Promise<{ spiToken: string | null; simApproved: string | null }> {
    const contentType = request.headers.get("content-type") ?? ""

    try {
        if (contentType.includes("application/json")) {
            const body = await request.json() as { SpiToken?: string; SimApproved?: string }
            return { spiToken: body.SpiToken ?? null, simApproved: body.SimApproved ?? null }
        }

        const form = await request.formData()
        const spiToken = form.get("SpiToken")
        const simApproved = form.get("SimApproved")
        return {
            spiToken: typeof spiToken === "string" ? spiToken : null,
            simApproved: typeof simApproved === "string" ? simApproved : null,
        }
    } catch {
        return { spiToken: null, simApproved: null }
    }
}

//breaks out of the 3DS iframe and lands the customer on target
function redirectHtml(target: string): Response {
    return new Response(
        `<!doctype html><html><body><script>window.top.location.replace(${JSON.stringify(target)})</script></body></html>`,
        { status: 200, headers: { "content-type": "text/html" } },
    )
}

export async function POST(request: Request) {
    const url = new URL(request.url)
    const paymentId = url.searchParams.get("payment")
    const tenantId = url.searchParams.get("tenant")

    if (paymentId === null || tenantId === null) return redirectHtml("/sites")

    const payment = await db.query.tenantPayments.findFirst({ where: eq(tenantPayments.id, paymentId) })
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) })
    if (payment === undefined || tenant === undefined || payment.tenantId !== tenant.id) {
        return redirectHtml("/sites")
    }

    //a first payment lands on the go-live celebration; a renewal goes back to
    //the dashboard. Declines return to wherever the customer started — a
    //draft resumes the wizard, an existing site reopens its Plan tab.
    const firstPayment = tenant.status === "draft"
    const successTarget = firstPayment ? `/sites/live/${tenant.slug}?paid=1` : `/dashboard/${tenant.id}?tab=plan&paid=1`
    const failureTarget = firstPayment ? `/sites/start?tenant=${tenant.id}&cancelled=1` : `/dashboard/${tenant.id}?tab=plan&cancelled=1`

    //replayed callback for an already-settled payment → just land on success
    if (payment.status === "succeeded") return redirectHtml(successTarget)
    if (payment.status !== "pending") return redirectHtml(failureTarget)

    const { spiToken, simApproved } = await parseCallbackBody(request)
    if (spiToken === null) return redirectHtml(failureTarget)

    //finalize with the gateway BEFORE opening the transaction (network call)
    let approved: boolean
    let transactionId: string | null

    if (gatewaySimulated() && spiToken.startsWith("SIM-")) {
        approved = simApproved === "1"
        transactionId = spiToken
    } else {
        const result = await completeGatewayPayment(spiToken)
        //if the gateway echoes our order reference, it must match this payment
        const expectedOrder = `sub-${tenant.slug}-${payment.id.slice(0, 8)}`
        if (result.orderIdentifier !== null && result.orderIdentifier !== expectedOrder) {
            console.error(`payment callback order mismatch: expected ${expectedOrder}, got ${result.orderIdentifier} (payment ${payment.id})`)
            return redirectHtml(failureTarget)
        }
        approved = result.approved
        transactionId = result.transactionId
    }

    let outcome: "credited" | "already-settled" | "declined"
    try {
        outcome = await db.transaction(async tx => {
            //serialize concurrent callbacks for this payment AND renewals for this tenant
            await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${payment.id}))`)
            await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenant.id}))`)

            //re-read under the lock — a duplicate callback may have settled it already
            const fresh = await tx.query.tenantPayments.findFirst({ where: eq(tenantPayments.id, payment.id) })
            if (fresh === undefined) return "declined"
            if (fresh.status === "succeeded") return "already-settled"
            if (fresh.status !== "pending") return "declined"

            if (!approved) {
                await tx.update(tenantPayments).set({ status: "failed" }).where(eq(tenantPayments.id, payment.id))
                return "declined"
            }

            //lock + re-read the tenant so two different payments stack, never clobber
            const [lockedTenant] = await tx.select().from(tenants).where(eq(tenants.id, tenant.id)).for("update")
            if (lockedTenant === undefined) return "declined"

            const now = new Date()
            const base = lockedTenant.currentPeriodEnd !== null && lockedTenant.currentPeriodEnd > now
                ? lockedTenant.currentPeriodEnd
                : now
            //months come off the payment row we just locked, never the request
            const periodEnd = periodEndAfter(lockedTenant.currentPeriodEnd, Math.max(1, fresh.months), now)

            await tx.update(tenantPayments)
                .set({ status: "succeeded", gatewayTransactionId: transactionId, periodStart: base, periodEnd })
                .where(eq(tenantPayments.id, payment.id))

            await tx.update(tenants)
                .set({ status: "live", currentPeriodEnd: periodEnd, updatedAt: now })
                .where(eq(tenants.id, tenant.id))

            return "credited"
        })
    } catch (error) {
        //the charge may already be captured gateway-side: leave the payment
        //pending (a callback replay can settle it) and log for reconciliation
        console.error(`CRITICAL: payment settle failed after gateway approval — payment ${payment.id}, gateway txn ${transactionId ?? "unknown"}:`, error instanceof Error ? error.message : error)
        return redirectHtml(failureTarget)
    }

    if (outcome === "declined") return redirectHtml(failureTarget)

    if (outcome === "credited") {
        //billing state changed → public pages must reflect it immediately
        bustTenantCache(tenant.slug, tenant.customDomain)
    }

    return redirectHtml(successTarget)
}
