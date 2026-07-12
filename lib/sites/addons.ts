import { z } from "zod"

//============================================================
// Squaremax Sites add-on catalog. Each add-on is:
//  - a $10/mo Stripe subscription item (Phase 3 billing)
//  - a feature flag on the tenant (site_config.enabledAddons)
//  - a section/capability in the rendered tenant site
// Adding add-on #8 = one entry here + its section/capability.
//============================================================

export const addonIdSchema = z.enum([
    "booking",
    "email-notifications",
    "custom-domain",
    "gallery",
    "reviews",
    "announcements",
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

export const BASE_MONTHLY_PRICE = 10

export const addons: Addon[] = addonSchema.array().parse([
    { id: "booking", name: "Online booking", blurb: "Customers book their own appointments — you manage the calendar from your dashboard.", monthlyPrice: 10, status: "available" },
    { id: "email-notifications", name: "Email notifications", blurb: "Booking confirmations and reminders, contact-form-to-inbox, weekly summaries.", monthlyPrice: 10, status: "available" },
    { id: "custom-domain", name: "Custom domain", blurb: "Connect yourbusiness.com — SSL handled automatically.", monthlyPrice: 10, status: "available" },
    { id: "gallery", name: "Photo gallery", blurb: "Show your work in an optimized, fast-loading gallery.", monthlyPrice: 10, status: "coming-soon" },
    { id: "reviews", name: "Reviews & testimonials", blurb: "Collect reviews and display the ones you approve.", monthlyPrice: 10, status: "coming-soon" },
    { id: "announcements", name: "Announcements & promos", blurb: "Holiday hours, sales, events — update a banner anytime.", monthlyPrice: 10, status: "coming-soon" },
    { id: "analytics", name: "Visitor analytics", blurb: "Privacy-friendly page-view stats in your dashboard.", monthlyPrice: 10, status: "coming-soon" },
])

export const addonsById: Record<AddonId, Addon> = Object.fromEntries(
    addons.map(addon => [addon.id, addon])
) as Record<AddonId, Addon>

export function monthlyTotal(enabledAddons: AddonId[]): number {
    return BASE_MONTHLY_PRICE + enabledAddons.reduce((sum, id) => sum + addonsById[id].monthlyPrice, 0)
}
