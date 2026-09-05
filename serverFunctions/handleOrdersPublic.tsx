"use server"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantComponents, tenantOrders, tenantProducts } from "@/db/schema"
import { env } from "@/lib/env"
import { sendEmailInBackground } from "@/lib/email/transporter"
import { getCurrentCustomer } from "@/lib/sites/customerAuth"
import { getVisibleTenantBySlug } from "@/lib/sites/publicTenant"
import { describeProblem, formatMoney, orderRef, priceReceipt } from "@/lib/sites/saleMath"
import { OrderRow, fulfillmentLabels, orderLinesText, orderWhatsappText, whatsappLink } from "@/lib/sites/orders"
import { toOrderRow } from "@/lib/sites/orderRows"

//============================================================
// PUBLIC order actions, called from the shop island on tenant
// sites. Kept free of owner-auth imports on purpose: this file
// sits in the section-component import chain (products section
// → ShopOrderForm → here), which the pure test suite loads.
// Owner-side order management lives in handleOrders.tsx.
//============================================================

const placeOrderSchema = z.object({
    slug: z.string(),
    items: z.object({ productId: z.string().min(1), qty: z.number().int().min(1).max(999) }).array().min(1).max(40),
    fulfillment: z.enum(["pickup", "delivery"]).default("pickup"),
    customerName: z.string().trim().min(1).max(120),
    customerPhone: z.string().trim().min(5).max(40),
    customerEmail: z.union([z.email().max(160), z.literal("")]).default(""),
    address: z.string().trim().max(400).default(""),
    note: z.string().trim().max(1000).default(""),
})

export async function placeOrder(input: z.infer<typeof placeOrderSchema>): Promise<{
    orderId: string
    ref: string
    totalCents: number
    whatsappUrl: string | null
    emailed: boolean
}> {
    const validated = placeOrderSchema.parse(input)
    const tenant = await getVisibleTenantBySlug(validated.slug)
    if (!tenant.config.enabledAddons.includes("inventory")) throw new Error("this shop isn't taking online orders")

    //ordering rules come from the shop section(s) the owner placed
    const shopSections = await db.query.tenantComponents.findMany({
        where: and(eq(tenantComponents.tenantId, tenant.id), eq(tenantComponents.category, "products")),
    })
    const settings = shopSections.map(section => section.data).filter(data => data.category === "products")
    if (!settings.some(data => (data.orderMethod ?? "order") === "order")) throw new Error("this shop isn't taking online orders")
    const pickupAllowed = settings.some(data => data.allowPickup !== false)
    const deliveryAllowed = settings.some(data => data.allowDelivery === true)
    if (validated.fulfillment === "delivery" && !deliveryAllowed) throw new Error("delivery isn't offered — choose pickup")
    if (validated.fulfillment === "pickup" && !pickupAllowed) throw new Error("pickup isn't offered — choose delivery")
    if (validated.fulfillment === "delivery" && validated.address === "") throw new Error("add a delivery address")

    const products = (await db.query.tenantProducts.findMany({ where: eq(tenantProducts.tenantId, tenant.id) }))
        .filter(product => product.active)
    const priced = priceReceipt(products, validated.items, 0)
    if (!priced.ok) throw new Error(describeProblem(priced.problem))
    const { receipt } = priced

    const customer = await getCurrentCustomer(tenant.id)
    const email = validated.customerEmail !== "" ? validated.customerEmail.toLowerCase() : customer?.email ?? ""

    const [order] = await db.insert(tenantOrders).values({
        tenantId: tenant.id,
        items: receipt.lines.map(line => ({
            productId: line.productId,
            name: line.name,
            qty: line.qty,
            unitPriceCents: line.unitPriceCents,
            taxCents: line.taxCents,
        })),
        subtotalCents: receipt.subtotalCents,
        taxCents: receipt.taxCents,
        totalCents: receipt.totalCents,
        fulfillment: validated.fulfillment,
        customerId: customer?.id ?? null,
        customerName: validated.customerName,
        customerEmail: email,
        customerPhone: validated.customerPhone,
        address: validated.address,
        note: validated.note,
    }).returning()

    const ref = orderRef(order.id)
    const business = tenant.content.business
    const notify = tenant.config.enabledAddons.includes("notifications")
    const lines = orderLinesText(order.items)
    const dashboardUrl = `${env.SITE_URL}/dashboard/${tenant.id}?tab=orders`

    if (notify && business.email !== "") {
        sendEmailInBackground({
            to: business.email,
            replyTo: email !== "" ? email : undefined,
            subject: `New order ${ref} — ${validated.customerName} · ${formatMoney(order.totalCents)}`,
            text: `${validated.customerName} just ordered from ${business.name}:\n\n${lines}\n\nTotal: ${formatMoney(order.totalCents)}${order.taxCents > 0 ? ` (incl. ${formatMoney(order.taxCents)} tax)` : ""}\n${fulfillmentLabels[order.fulfillment]}${order.address !== "" ? ` — ${order.address}` : ""}\n\nPhone: ${order.customerPhone}\nEmail: ${email || "n/a"}\nNote: ${order.note || "none"}\n\nMark it paid and done from your dashboard:\n${dashboardUrl}`,
        })
    }

    let emailed = false
    if (notify && email !== "") {
        emailed = true
        sendEmailInBackground({
            to: email,
            subject: `Order ${ref} received — ${business.name}`,
            text: `Hi ${validated.customerName},\n\nThanks — ${business.name} has your order ${ref}:\n\n${lines}\n\nTotal: ${formatMoney(order.totalCents)}\n${fulfillmentLabels[order.fulfillment]}${order.address !== "" ? ` — ${order.address}` : ""}\n\n${business.name} will confirm shortly.${business.phone !== "" ? ` Questions? Call ${business.phone}.` : ""}`,
        })
    }

    const whatsappUrl = whatsappLink(business.whatsapp, orderWhatsappText({
        businessName: business.name,
        orderId: order.id,
        items: order.items,
        totalCents: order.totalCents,
        fulfillment: order.fulfillment,
        customerName: order.customerName,
    }))

    return { orderId: order.id, ref, totalCents: order.totalCents, whatsappUrl, emailed }
}

//the signed-in customer's own orders on THIS tenant
export async function getMyCustomerOrders(slugRaw: string): Promise<OrderRow[]> {
    const tenant = await getVisibleTenantBySlug(slugRaw)
    const customer = await getCurrentCustomer(tenant.id)
    if (customer === null) throw new Error("sign in first")

    const rows = await db.query.tenantOrders.findMany({
        where: and(eq(tenantOrders.tenantId, tenant.id), eq(tenantOrders.customerId, customer.id)),
        orderBy: [desc(tenantOrders.createdAt)],
        limit: 50,
    })
    return rows.map(toOrderRow)
}
