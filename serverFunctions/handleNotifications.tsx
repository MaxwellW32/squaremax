"use server"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantAnnouncements, tenantCustomers } from "@/db/schema"
import { sendEmailInBackground } from "@/lib/email/transporter"
import { getOwnedTenant } from "@/lib/sites/owner"

//============================================================
// Notifications add-on (owner-gated): announcement blasts to
// the tenant's OWN customers who opted into email. WhatsApp
// sends are wa.me deep links built in the dashboard (no API
// dependency); this records history either way.
//============================================================

const announcementSchema = z.object({
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
})

export async function sendAnnouncement(tenantId: string, input: z.infer<typeof announcementSchema>) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    if (!tenant.config.enabledAddons.includes("notifications")) throw new Error("the notifications add-on is not enabled")
    const validated = announcementSchema.parse(input)

    const recipients = await db.query.tenantCustomers.findMany({
        where: and(eq(tenantCustomers.tenantId, tenant.id), eq(tenantCustomers.notifyEmail, true)),
        columns: { email: true, name: true },
    })

    for (const recipient of recipients) {
        sendEmailInBackground({
            to: recipient.email,
            subject: `${tenant.content.business.name}: ${validated.subject}`,
            text: `Hi${recipient.name !== "" ? ` ${recipient.name}` : ""},\n\n${validated.body}\n\n— ${tenant.content.business.name}\nYou get these updates because you have an account on our page. Manage preferences from your account.`,
        })
    }

    const [record] = await db.insert(tenantAnnouncements).values({
        tenantId: tenant.id,
        subject: validated.subject,
        body: validated.body,
        sentTo: recipients.length,
    }).returning()

    return { ok: true, sentTo: recipients.length, id: record.id }
}

export async function getAnnouncements(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return db.query.tenantAnnouncements.findMany({
        where: eq(tenantAnnouncements.tenantId, tenant.id),
        orderBy: [desc(tenantAnnouncements.createdAt)],
        limit: 50,
    })
}
