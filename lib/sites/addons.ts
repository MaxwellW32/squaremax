import { z } from "zod"

//============================================================
// Squaremax Sites pricing catalog — the ONE place prices live.
//
//   Website (base)            US$10/mo
//   Any single add-on         +US$5/mo
//   Bundles (auto-applied):   Service US$15 · Storefront US$20
//   Annual prepay             2 months free (lib/sites/billing.ts)
//
// Bundles are never "chosen": monthlyTotal() always charges the
// cheapest price the enabled add-ons qualify for, so a client can
// switch tools on and off and the bill simply follows. Billing,
// the wizard, the dashboard and the marketing pages all read from
// here — change a number once and every surface agrees.
//
// Changing prices later: bump the constants, grandfather existing
// clients in GROWTH-PLAN terms, never mid-cycle.
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

export const BASE_MONTHLY_PRICE = 10
export const ADDON_MONTHLY_PRICE = 5

//what every site gets before any add-on — shown on plan cards
export const BASE_INCLUDES: string[] = [
    "Up to 5 pages, 40+ section designs, 8 themes",
    "Hosting, SSL and squaremaxtech.com/your-name",
    "Contact form + customer accounts on your site",
    "Edit anything yourself, any time",
]

export const addons: Addon[] = addonSchema.array().parse([
    { id: "booking", name: "Online booking", blurb: "Customers book their own appointments 24/7 — you set the hours, the calendar fills itself. No double-bookings.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "available" },
    { id: "notifications", name: "Notifications", blurb: "Email + WhatsApp: instant alerts for bookings, orders and messages, plus announcement blasts to your customers.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "available" },
    { id: "inventory", name: "Online store & inventory", blurb: "Sell from your site: customers order online, you get the order instantly. Stock, taxes, receipts and profit reports included.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "available" },
    { id: "custom-domain", name: "Custom domain", blurb: "Use yourbusiness.com instead of squaremaxtech.com/your-name — SSL handled automatically.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "available" },
    { id: "reviews", name: "Reviews & ratings", blurb: "Collect reviews from customers and display the ones you approve.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "coming-soon" },
    { id: "analytics", name: "Visitor analytics", blurb: "Privacy-friendly page-view stats in your dashboard.", monthlyPrice: ADDON_MONTHLY_PRICE, status: "coming-soon" },
])

export const addonsById: Record<AddonId, Addon> = Object.fromEntries(
    addons.map(addon => [addon.id, addon])
) as Record<AddonId, Addon>

//------------------------------------------------------------
// bundles — a flat price for a set of add-ons (base included)
//------------------------------------------------------------

export type Bundle = {
    id: "service" | "storefront"
    name: string
    tagline: string
    monthlyPrice: number
    addons: AddonId[]
    //marketing: who this is for
    bestFor: string
    recommended?: boolean
}

export const bundles: Bundle[] = [
    {
        id: "service",
        name: "Service bundle",
        tagline: "Website + online booking + notifications",
        monthlyPrice: 15,
        addons: ["booking", "notifications"],
        bestFor: "Barbers, salons, spas, clinics, tutors, mechanics — anyone who takes appointments.",
        recommended: true,
    },
    {
        id: "storefront",
        name: "Storefront bundle",
        tagline: "Everything: booking, notifications, online store, custom domain",
        monthlyPrice: 20,
        addons: ["booking", "notifications", "inventory", "custom-domain"],
        bestFor: "Shops, restaurants and any business that sells products as well as services.",
    },
]

export const bundlesById: Record<Bundle["id"], Bundle> = Object.fromEntries(
    bundles.map(bundle => [bundle.id, bundle])
) as Record<Bundle["id"], Bundle>

//the itemized price: base + every enabled add-on. Tolerates retired add-on
//ids on old tenant rows (unknown = $0, never a crash).
export function itemizedMonthly(enabledAddons: AddonId[]): number {
    return BASE_MONTHLY_PRICE + enabledAddons.reduce((sum, id) => sum + (addonsById[id]?.monthlyPrice ?? 0), 0)
}

export type PriceQuote = {
    monthly: number //what the client pays
    itemized: number //what the same add-ons cost à la carte
    savings: number
    bundle: Bundle | null //the bundle that produced the price, if any
    //enabled add-ons the bundle doesn't cover (charged on top)
    extras: AddonId[]
}

//cheapest way to price a set of add-ons: à la carte, or a bundle plus the
//add-ons it doesn't include. Auto-applied — the client never has to pick.
export function priceQuote(enabledAddons: AddonId[]): PriceQuote {
    const enabled = [...new Set(enabledAddons)]
    const itemized = itemizedMonthly(enabled)

    let best: PriceQuote = { monthly: itemized, itemized, savings: 0, bundle: null, extras: enabled }

    for (const bundle of bundles) {
        const qualifies = bundle.addons.every(id => enabled.includes(id))
        if (!qualifies) continue
        const extras = enabled.filter(id => !bundle.addons.includes(id))
        const monthly = bundle.monthlyPrice + extras.reduce((sum, id) => sum + (addonsById[id]?.monthlyPrice ?? 0), 0)
        if (monthly < best.monthly) {
            best = { monthly, itemized, savings: itemized - monthly, bundle, extras }
        }
    }

    return best
}

export function monthlyTotal(enabledAddons: AddonId[]): number {
    return priceQuote(enabledAddons).monthly
}

//the add-on set a bundle switches on (for one-click plan pickers)
export function addonsForBundle(bundleId: Bundle["id"]): AddonId[] {
    return [...bundlesById[bundleId].addons]
}
