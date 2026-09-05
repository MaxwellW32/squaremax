"use server"
import { z } from "zod"
import { and, eq, gte, lt, ne, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantAvailability, tenantBookings, tenantComponents, tenantMessages } from "@/db/schema"
import { getVisibleTenantBySlug } from "@/lib/sites/publicTenant"
import { businessDateISO, businessDayAnchor, computeSlots, dateISOSchemaPattern, rangesOverlap } from "@/lib/sites/bookingLogic"
import { sendEmailInBackground } from "@/lib/email/transporter"
import { getCurrentCustomer } from "@/lib/sites/customerAuth"

//public server actions callable from tenant pages — every input is
//zod-validated and every action re-checks tenant visibility + add-on flags.

const getVisibleTenant = getVisibleTenantBySlug

//bookable services now live on the tenant's BOOKING components (each placed
//instance owns its data) — search across them for the requested service
async function findBookableService(tenantId: string, serviceName: string): Promise<{ name: string; durationMinutes: number } | undefined> {
    const bookingComponents = await db.query.tenantComponents.findMany({
        where: and(eq(tenantComponents.tenantId, tenantId), eq(tenantComponents.category, "booking")),
    })

    for (const component of bookingComponents) {
        if (component.data.category !== "booking") continue
        const service = component.data.services.find(candidate => candidate.name === serviceName)
        if (service !== undefined) return { name: service.name, durationMinutes: service.durationMinutes }
    }
    return undefined
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

    if (tenant.config.enabledAddons.includes("notifications") && tenant.content.business.email !== "") {
        sendEmailInBackground({
            to: tenant.content.business.email,
            replyTo: validated.email,
            subject: `New message on your page — ${validated.name}`,
            text: `${validated.name} (${validated.email}) sent a message via ${tenant.slug}:\n\n${validated.body}\n\nReply directly to this email to answer them.`,
        })
    }

    return { ok: true }
}

//which weekdays have opening rules — lets the booking calendar grey out
//closed days without leaking the full availability config
export async function getBookingWeekdays(slugRaw: string): Promise<number[]> {
    const tenant = await getVisibleTenant(z.string().parse(slugRaw))
    if (!tenant.config.enabledAddons.includes("booking")) return []
    const rules = await db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) })
    return [...new Set(rules.map(rule => rule.dayOfWeek))]
}

const slotsInputSchema = z.object({
    slug: z.string(),
    dateISO: z.string().regex(dateISOSchemaPattern), //"2026-07-15", business-local calendar date
    serviceName: z.string().min(1).max(120),
})

export async function getBookingSlots(input: z.infer<typeof slotsInputSchema>): Promise<string[]> {
    const validated = slotsInputSchema.parse(input)
    const tenant = await getVisibleTenant(validated.slug)
    if (!tenant.config.enabledAddons.includes("booking")) throw new Error("booking not enabled")

    const service = await findBookableService(tenant.id, validated.serviceName)
    if (service === undefined) throw new Error("service not found")
    const durationMinutes = service.durationMinutes

    const { dayStart } = businessDayAnchor(validated.dateISO)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const [rules, existing] = await Promise.all([
        db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) }),
        db.query.tenantBookings.findMany({
            where: and(
                eq(tenantBookings.tenantId, tenant.id),
                ne(tenantBookings.status, "cancelled"),
                gte(tenantBookings.startsAt, dayStart),
                lt(tenantBookings.startsAt, dayEnd),
            ),
        }),
    ])

    const slots = computeSlots({ dateISO: validated.dateISO, rules, existing, durationMinutes })
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

    const service = await findBookableService(tenant.id, validated.serviceName)
    if (service === undefined) throw new Error("service not found")
    const durationMinutes = service.durationMinutes

    const startsAt = new Date(validated.startsAtISO)
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) throw new Error("invalid time")
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000)

    //the requested slot must still be one the availability rules produce
    //(dateISO derived from the instant in the BUSINESS timezone)
    const rules = await db.query.tenantAvailability.findMany({ where: eq(tenantAvailability.tenantId, tenant.id) })
    const dateISO = businessDateISO(startsAt)
    const { dayStart } = businessDayAnchor(dateISO)
    const validSlots = computeSlots({ dateISO, rules, existing: [], durationMinutes })
    if (!validSlots.some(slot => slot.getTime() === startsAt.getTime())) throw new Error("slot not available")

    //a signed-in customer account on this tenant gets linked to the booking
    const customer = await getCurrentCustomer(tenant.id)

    //conflict check + insert inside one transaction; the per-tenant advisory
    //lock serializes concurrent submits (plain READ COMMITTED would let two
    //transactions both pass the read check and double-book)
    const booking = await db.transaction(async tx => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${tenant.id}))`)

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
            customerId: customer?.id ?? null,
            startsAt,
            endsAt,
            notes: validated.notes,
        }).returning()

        return inserted
    })

    if (tenant.config.enabledAddons.includes("notifications")) {
        const when = startsAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "America/Jamaica" })

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
