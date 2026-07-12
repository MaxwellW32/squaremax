"use server"
import { z } from "zod"
import { and, eq, gte, lt, ne } from "drizzle-orm"
import { db } from "@/db"
import { tenantAvailability, tenantBookings, tenantMessages, tenants } from "@/db/schema"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"
import { slugSchema } from "@/lib/sites/slug"
import { computeSlots, rangesOverlap } from "@/lib/sites/bookingLogic"
import { sendEmailInBackground } from "@/lib/email/transporter"

//public server actions callable from tenant pages — every input is
//zod-validated and every action re-checks tenant visibility + add-on flags.

async function getVisibleTenant(slugRaw: string) {
    const slug = slugSchema.parse(slugRaw)
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug) })
    if (tenant === undefined) throw new Error("page not found")
    if (!isPubliclyVisible(effectiveStatus(tenant))) throw new Error("page is paused")
    return tenant
}

const messageInputSchema = z.object({
    slug: z.string(),
    name: z.string().min(1).max(120),
    email: z.email(),
    body: z.string().min(1).max(5000),
})

export async function submitTenantMessage(input: z.infer<typeof messageInputSchema>) {
    const validated = messageInputSchema.parse(input)
    const tenant = await getVisibleTenant(validated.slug)

    await db.insert(tenantMessages).values({
        tenantId: tenant.id,
        name: validated.name,
        email: validated.email,
        body: validated.body,
    })

    if (tenant.config.enabledAddons.includes("email-notifications") && tenant.content.business.email !== "") {
        sendEmailInBackground({
            to: tenant.content.business.email,
            replyTo: validated.email,
            subject: `New message on your page — ${validated.name}`,
            text: `${validated.name} (${validated.email}) sent a message via ${tenant.slug}:\n\n${validated.body}\n\nReply directly to this email to answer them.`,
        })
    }

    return { ok: true }
}

const slotsInputSchema = z.object({
    slug: z.string(),
    dateISO: z.string(), //"2026-07-15"
    serviceName: z.string().min(1).max(120),
})

export async function getBookingSlots(input: z.infer<typeof slotsInputSchema>): Promise<string[]> {
    const validated = slotsInputSchema.parse(input)
    const tenant = await getVisibleTenant(validated.slug)
    if (!tenant.config.enabledAddons.includes("booking")) throw new Error("booking not enabled")

    const service = tenant.content.services.items.find(item => item.name === validated.serviceName)
    if (service === undefined) throw new Error("service not found")
    const durationMinutes = service.durationMinutes ?? 30

    const date = new Date(`${validated.dateISO}T00:00:00`)
    if (Number.isNaN(date.getTime())) throw new Error("invalid date")

    const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000)

    const [rules, existing] = await Promise.all([
        db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) }),
        db.query.tenantBookings.findMany({
            where: and(
                eq(tenantBookings.tenantId, tenant.id),
                ne(tenantBookings.status, "cancelled"),
                gte(tenantBookings.startsAt, date),
                lt(tenantBookings.startsAt, dayEnd),
            ),
        }),
    ])

    const slots = computeSlots({ date, rules, existing, durationMinutes })
    return slots.map(slot => slot.toISOString())
}

const bookingInputSchema = z.object({
    slug: z.string(),
    serviceName: z.string().min(1).max(120),
    startsAtISO: z.string(),
    customerName: z.string().min(1).max(120),
    customerEmail: z.email(),
    customerPhone: z.string().max(40).default(""),
    notes: z.string().max(2000).default(""),
})

export async function submitBooking(input: z.infer<typeof bookingInputSchema>) {
    const validated = bookingInputSchema.parse(input)
    const tenant = await getVisibleTenant(validated.slug)
    if (!tenant.config.enabledAddons.includes("booking")) throw new Error("booking not enabled")

    const service = tenant.content.services.items.find(item => item.name === validated.serviceName)
    if (service === undefined) throw new Error("service not found")
    const durationMinutes = service.durationMinutes ?? 30

    const startsAt = new Date(validated.startsAtISO)
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) throw new Error("invalid time")
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000)

    //the requested slot must still be one the availability rules produce
    const rules = await db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) })
    const dayStart = new Date(startsAt); dayStart.setHours(0, 0, 0, 0)
    const validSlots = computeSlots({ date: dayStart, rules, existing: [], durationMinutes })
    if (!validSlots.some(slot => slot.getTime() === startsAt.getTime())) throw new Error("slot not available")

    //conflict check + insert inside one transaction to prevent double-booking
    const booking = await db.transaction(async tx => {
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        const sameDay = await tx.query.tenantBookings.findMany({
            where: and(
                eq(tenantBookings.tenantId, tenant.id),
                ne(tenantBookings.status, "cancelled"),
                gte(tenantBookings.startsAt, dayStart),
                lt(tenantBookings.startsAt, dayEnd),
            ),
        })

        const conflict = sameDay.some(existing => rangesOverlap(startsAt, endsAt, existing.startsAt, existing.endsAt))
        if (conflict) throw new Error("that time was just taken — pick another slot")

        const [inserted] = await tx.insert(tenantBookings).values({
            tenantId: tenant.id,
            serviceName: validated.serviceName,
            customerName: validated.customerName,
            customerEmail: validated.customerEmail,
            customerPhone: validated.customerPhone,
            startsAt,
            endsAt,
            notes: validated.notes,
        }).returning()

        return inserted
    })

    if (tenant.config.enabledAddons.includes("email-notifications")) {
        const when = startsAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })

        if (tenant.content.business.email !== "") {
            sendEmailInBackground({
                to: tenant.content.business.email,
                replyTo: validated.customerEmail,
                subject: `New booking: ${validated.serviceName} — ${when}`,
                text: `${validated.customerName} booked ${validated.serviceName} on ${when}.\n\nPhone: ${validated.customerPhone || "n/a"}\nEmail: ${validated.customerEmail}\nNotes: ${validated.notes || "none"}\n\nManage bookings from your Squaremax dashboard.`,
            })
        }

        sendEmailInBackground({
            to: validated.customerEmail,
            subject: `Booking received — ${tenant.content.business.name}`,
            text: `Hi ${validated.customerName},\n\nYour booking for ${validated.serviceName} on ${when} was received.\n${tenant.content.business.name} will confirm shortly.\n\n${tenant.content.business.phone !== "" ? `Questions? Call ${tenant.content.business.phone}.` : ""}`,
        })
    }

    return { ok: true, bookingId: booking.id }
}
