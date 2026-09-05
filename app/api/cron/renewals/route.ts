import { and, eq, isNotNull } from "drizzle-orm"
import { db } from "@/db"
import { tenants, users } from "@/db/schema"
import { env } from "@/lib/env"
import { sendEmail } from "@/lib/email/transporter"
import { monthlyTotal } from "@/lib/sites/addons"
import { GRACE_DAYS } from "@/lib/sites/status"

//============================================================
// Renewal reminders. Subscriptions are prepaid and never auto-
// charged, so the platform's job is to make sure nobody's site
// lapses by surprise. A system cron hits this once a day:
//
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
//        https://squaremaxtech.com/api/cron/renewals
//
// Two emails per period, each sent exactly once (the tenant row
// remembers which period end it was sent for):
//   1. "renews in N days"  — inside REMIND_DAYS of the period end
//   2. "your site is in its grace window" — once the period lapsed
//============================================================

const REMIND_DAYS = 5
const DAY_MS = 24 * 60 * 60 * 1000

function authorized(request: Request): boolean {
    if (env.CRON_SECRET === undefined) return false
    const header = request.headers.get("authorization") ?? ""
    return header === `Bearer ${env.CRON_SECRET}`
}

async function run() {
    const now = new Date()
    const soon = new Date(now.getTime() + REMIND_DAYS * DAY_MS)

    const rows = await db.select({ tenant: tenants, ownerEmail: users.email })
        .from(tenants)
        .innerJoin(users, eq(users.id, tenants.ownerUserId))
        .where(and(eq(tenants.status, "live"), isNotNull(tenants.currentPeriodEnd)))

    let reminded = 0
    let lapsed = 0
    const failures: string[] = []

    for (const { tenant, ownerEmail } of rows) {
        const end = tenant.currentPeriodEnd
        if (end === null || ownerEmail === null) continue

        const dashboard = `${env.SITE_URL}/dashboard/${tenant.id}?tab=plan`
        const monthly = monthlyTotal(tenant.config.enabledAddons)
        const endText = end.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/Jamaica" })

        const dueSoon = end > now && end <= soon && tenant.renewalReminderFor?.getTime() !== end.getTime()
        if (dueSoon) {
            const daysLeft = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / DAY_MS))
            try {
                await sendEmail({
                    to: ownerEmail,
                    subject: `${tenant.businessName}: your site renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
                    text: `Hi,\n\nYour Squaremax site for ${tenant.businessName} is paid through ${endText} — ${daysLeft} day${daysLeft === 1 ? "" : "s"} from now.\n\nNothing is charged automatically. To keep it online, add a month (or a year, with 2 months free) from your dashboard:\n${dashboard}\n\nYour current plan is US$${monthly}/month. If the period ends, your site stays up for ${GRACE_DAYS} more days before it pauses — nothing is deleted either way.\n\n— Squaremax`,
                })
                await db.update(tenants).set({ renewalReminderFor: end }).where(eq(tenants.id, tenant.id))
                reminded += 1
            } catch (error) {
                failures.push(`${tenant.slug}: ${error instanceof Error ? error.message : "send failed"}`)
            }
        }

        const inGrace = end <= now && end.getTime() + GRACE_DAYS * DAY_MS > now.getTime() && tenant.lapseNoticeFor?.getTime() !== end.getTime()
        if (inGrace) {
            const graceLeft = Math.max(1, Math.ceil((end.getTime() + GRACE_DAYS * DAY_MS - now.getTime()) / DAY_MS))
            try {
                await sendEmail({
                    to: ownerEmail,
                    subject: `${tenant.businessName}: your site pauses in ${graceLeft} day${graceLeft === 1 ? "" : "s"}`,
                    text: `Hi,\n\nThe paid period for ${tenant.businessName} ended on ${endText}. Your site is still online for ${graceLeft} more day${graceLeft === 1 ? "" : "s"}, then visitors see a polite "taking a break" page until you renew.\n\nRenew in a minute from your dashboard — everything comes straight back exactly as you left it:\n${dashboard}\n\nQuestions? Just reply to this email.\n\n— Squaremax`,
                })
                await db.update(tenants).set({ lapseNoticeFor: end }).where(eq(tenants.id, tenant.id))
                lapsed += 1
            } catch (error) {
                failures.push(`${tenant.slug}: ${error instanceof Error ? error.message : "send failed"}`)
            }
        }
    }

    return { checked: rows.length, reminded, lapsed, failures }
}

async function handle(request: Request) {
    if (env.CRON_SECRET === undefined) return Response.json({ error: "CRON_SECRET is not set" }, { status: 503 })
    if (!authorized(request)) return new Response("unauthorized", { status: 401 })
    const result = await run()
    return Response.json(result)
}

export async function GET(request: Request) {
    return handle(request)
}

export async function POST(request: Request) {
    return handle(request)
}
