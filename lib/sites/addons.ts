import { z } from "zod"

//============================================================
// Squaremax Sites add-on catalog. The base $5/mo buys the hosted
// website; each add-on is +$5/mo:
//  - a feature flag on the tenant (config.enabledAddons)
//  - a capability in the site + dashboard (booking calendar,
//    customer notifications, product/sales tracking, …)
// Billing reads prices from here (monthlyTotal), so adding an
// add-on = one entry + its capability.
//============================================================

export const addonIdSchema = z.enum([
    "booking",
    "notifications",
    "inventory",
    "custom-domain",
    "reviews",
    "analytics",
])
export type AddonId = z.infer<typeof addonIdSchema>

export const addonSchema = z.object({
    id: addonIdSchema,
    name: z.string().min(1),
    blurb: z.string().min(1),
    monthlyPrice: z.number().int().positive(),
    //"available" add-ons are fully built; "coming-soon" are visible but not purchasable
    status: z.enum(["available", "coming-soon"]),
})
export type Addon = z.infer<typeof addonSchema>

export const BASE_MONTHLY_PRICE = 5

export const addons: Addon[] = addonSchema.array().parse([
    { id: "booking", name: "Online booking", blurb: "Customers book their own appointments — you manage the calendar from your dashboard.", monthlyPrice: 5, status: "available" },
    { id: "notifications", name: "Notifications", blurb: "Email + WhatsApp: booking confirmations, contact-form-to-inbox, and announcement blasts to your customers.", monthlyPrice: 5, status: "available" },
    { id: "inventory", name: "Store & inventory", blurb: "Track products, stock and taxes. Record sales, see monthly totals, and show a shop section on your site.", monthlyPrice: 5, status: "available" },
    { id: "custom-domain", name: "Custom domain", blurb: "Connect yourbusiness.com — SSL handled automatically.", monthlyPrice: 5, status: "available" },
    { id: "reviews", name: "Reviews & ratings", blurb: "Collect reviews from customers and display the ones you approve.", monthlyPrice: 5, status: "coming-soon" },
    { id: "analytics", name: "Visitor analytics", blurb: "Privacy-friendly page-view stats in your dashboard.", monthlyPrice: 5, status: "coming-soon" },
])

export const addonsById: Record<AddonId, Addon> = Object.fromEntries(
    addons.map(addon => [addon.id, addon])
) as Record<AddonId, Addon>

export function monthlyTotal(enabledAddons: AddonId[]): number {
    //tolerate retired add-on ids on old tenant rows: unknown = $0, never a crash
    return BASE_MONTHLY_PRICE + enabledAddons.reduce((sum, id) => sum + (addonsById[id]?.monthlyPrice ?? 0), 0)
}
