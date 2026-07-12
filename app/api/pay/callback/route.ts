import { and, eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { db } from "@/db"
import { tenantPayments, tenants } from "@/db/schema"
import { completeGatewayPayment, gatewaySimulated } from "@/lib/payments/powertranz"

//============================================================
// PowerTranz MerchantResponseUrl. Intentionally unauthenticated:
// a forged POST is harmless because a payment only flips
// pending → succeeded via a real, completable SpiToken —
// server-side re-verification is the source of truth.
// CAS guard (where status = pending) makes replays idempotent.
//============================================================

const PERIOD_DAYS = 30

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

    const successTarget = `/sites/live/${tenant.slug}?paid=1`
    const failureTarget = `/sites/start?tenant=${tenant.id}&cancelled=1`

    //replayed callback for an already-settled payment → just land on success
    if (payment.status === "succeeded") return redirectHtml(successTarget)
    if (payment.status !== "pending") return redirectHtml(failureTarget)

    const { spiToken, simApproved } = await parseCallbackBody(request)
    if (spiToken === null) return redirectHtml(failureTarget)

    let approved: boolean
    let transactionId: string | null

    if (gatewaySimulated() && spiToken.startsWith("SIM-")) {
        approved = simApproved === "1"
        transactionId = spiToken
    } else {
        const result = await completeGatewayPayment(spiToken)
        approved = result.approved
        transactionId = result.transactionId
    }

    if (!approved) {
        await db.update(tenantPayments)
            .set({ status: "failed" })
            .where(and(eq(tenantPayments.id, payment.id), eq(tenantPayments.status, "pending")))
        return redirectHtml(failureTarget)
    }

    //promote + extend inside one transaction; CAS prevents double-crediting
    const credited = await db.transaction(async tx => {
        const promoted = await tx.update(tenantPayments)
            .set({ status: "succeeded", gatewayTransactionId: transactionId })
            .where(and(eq(tenantPayments.id, payment.id), eq(tenantPayments.status, "pending")))
            .returning()

        if (promoted.length === 0) return false //another callback won the race

        //stack on remaining time, never clip it
        const now = new Date()
        const base = tenant.currentPeriodEnd !== null && tenant.currentPeriodEnd > now ? tenant.currentPeriodEnd : now
        const periodEnd = new Date(base.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000)

        await tx.update(tenantPayments)
            .set({ periodStart: base, periodEnd })
            .where(eq(tenantPayments.id, payment.id))

        await tx.update(tenants)
            .set({ status: "live", currentPeriodEnd: periodEnd, updatedAt: now })
            .where(eq(tenants.id, tenant.id))

        return true
    })

    if (credited) {
        //billing state changed → the public page must reflect it immediately
        revalidateTag(`tenant:${tenant.slug}`, "max")
    }

    return redirectHtml(successTarget)
}
