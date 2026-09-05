import { z } from "zod";

//============================================================
// Custom Builds — service catalog, flat tiers, quote math.
// Single source of truth: edit prices/bands here only.
//============================================================

export const serviceIdSchema = z.enum([
    "design",
    "responsive",
    "auth",
    "database",
    "api",
    "forms",
    "payments",
    "booking",
    "admin",
    "realtime",
    "email",
    "seo",
    "analytics",
    "hosting",
]);
export type ServiceId = z.infer<typeof serviceIdSchema>;

export const serviceSchema = z.object({
    id: serviceIdSchema,
    label: z.string().min(1),
    blurb: z.string().min(1),
    price: z.number().int().positive(),
});
export type Service = z.infer<typeof serviceSchema>;

export const tierIdSchema = z.enum(["launch", "business", "pro"]);
export type TierId = z.infer<typeof tierIdSchema>;

export const tierSchema = z.object({
    id: tierIdSchema,
    name: z.string().min(1),
    price: z.number().int().positive(),
    //subtotals up to and including this map to the tier; null = no ceiling
    maxSubtotal: z.number().int().positive().nullable(),
    tagline: z.string().min(1),
    buildTime: z.string().min(1),
});
export type Tier = z.infer<typeof tierSchema>;

export const services: Service[] = serviceSchema.array().parse([
    { id: "design", label: "Custom design & build (up to 8 pages)", blurb: "Designed and built from scratch for your business — no themes.", price: 1500 },
    { id: "responsive", label: "Responsive / mobile optimization", blurb: "Looks right on every phone, tablet and desktop.", price: 250 },
    { id: "auth", label: "User authentication (email + OAuth)", blurb: "Accounts with email sign-in plus Google/GitHub login.", price: 450 },
    { id: "database", label: "Database design & integration", blurb: "Your data modeled properly in Postgres — built to grow.", price: 500 },
    { id: "api", label: "Third-party API integrations (per system)", blurb: "Connect the tools you already use — CRMs, maps, feeds.", price: 400 },
    { id: "forms", label: "Contact & lead forms with validation", blurb: "Forms that reject junk and land in your inbox.", price: 200 },
    { id: "payments", label: "Payments (online card checkout)", blurb: "Take cards online — PowerTranz for Jamaica, Stripe or PayPal abroad — checkout, receipts, refunds.", price: 500 },
    { id: "booking", label: "Booking / scheduling system", blurb: "Customers pick a slot; you manage the calendar.", price: 600 },
    { id: "admin", label: "Admin dashboard / CMS", blurb: "Edit your own content and see your data without calling me.", price: 650 },
    { id: "realtime", label: "Real-time features (chat, live updates)", blurb: "Websockets: live chat, notifications, activity feeds.", price: 550 },
    { id: "email", label: "Email notifications & transactional email", blurb: "Confirmations, receipts and reminders that actually deliver.", price: 250 },
    { id: "seo", label: "SEO setup (meta, sitemap, structured data)", blurb: "Google-ready from day one.", price: 250 },
    { id: "analytics", label: "Analytics setup", blurb: "Know your visitors — privacy-friendly stats.", price: 150 },
    { id: "hosting", label: "Hosting & deployment setup (domain, SSL, CI)", blurb: "Domain, SSL, automatic deploys — done for you.", price: 300 },
]);

export const servicesById: Record<ServiceId, Service> = Object.fromEntries(
    services.map(service => [service.id, service])
) as Record<ServiceId, Service>;

//band edges are inclusive ceilings: ≤2500 launch, ≤5000 business, else pro
export const tiers: Tier[] = tierSchema.array().parse([
    { id: "launch", name: "Launch", price: 1000, maxSubtotal: 2500, tagline: "Brochure & portfolio sites", buildTime: "3–5 business days" },
    { id: "business", name: "Business", price: 3500, maxSubtotal: 5000, tagline: "Sites that run operations", buildTime: "1–2 weeks" },
    { id: "pro", name: "Pro", price: 6500, maxSubtotal: null, tagline: "Full products", buildTime: "2–3 weeks" },
]);

export const tiersById: Record<TierId, Tier> = Object.fromEntries(
    tiers.map(tier => [tier.id, tier])
) as Record<TierId, Tier>;

//canonical feature set per tier (preset buttons)
export const tierPresets: Record<TierId, ServiceId[]> = {
    launch: ["design", "responsive", "forms", "seo", "hosting"],
    business: ["design", "responsive", "forms", "seo", "hosting", "auth", "database", "admin", "email", "analytics"],
    pro: ["design", "responsive", "forms", "seo", "hosting", "auth", "database", "admin", "email", "analytics", "payments", "booking", "api", "realtime"],
};

export type UseCase = {
    id: string;
    label: string;
    //serviceId -> why this business type needs it (tooltip copy)
    picks: Partial<Record<ServiceId, string>>;
};

export const useCases: UseCase[] = [
    {
        id: "booking-site",
        label: "Booking site",
        picks: {
            design: "Your brand, built around your services",
            responsive: "Most bookings happen on phones",
            auth: "Customers need accounts to manage appointments",
            database: "Appointments and availability live in a real database",
            booking: "The core of the site — customers book themselves in",
            email: "Automatic confirmations and reminders cut no-shows",
            forms: "For questions that aren't bookings",
            seo: "Show up when people search for you locally",
            hosting: "Domain, SSL and deploys handled",
        },
    },
    {
        id: "online-store",
        label: "Online store",
        picks: {
            design: "Product pages designed to sell",
            responsive: "Mobile checkout is most of your revenue",
            payments: "Card checkout — PowerTranz, Stripe or PayPal, with receipts",
            database: "Products, orders and customers stored properly",
            auth: "Customer accounts and order history",
            email: "Order confirmations and shipping updates",
            forms: "Support and contact requests",
            seo: "Products indexed by Google",
            analytics: "See what sells and where visitors drop off",
            hosting: "Domain, SSL and deploys handled",
        },
    },
    {
        id: "restaurant",
        label: "Restaurant",
        picks: {
            design: "Menu, photos and story — appetite first",
            responsive: "Diners find you on their phones",
            booking: "Table reservations without the phone tag",
            email: "Reservation confirmations",
            forms: "Events and catering inquiries",
            seo: "Rank for “restaurant near me”",
            hosting: "Domain, SSL and deploys handled",
        },
    },
    {
        id: "saas-landing",
        label: "SaaS landing",
        picks: {
            design: "A landing page that explains and converts",
            responsive: "Polished on every screen investors check",
            forms: "Waitlist and demo-request capture",
            seo: "Structured data for your product",
            analytics: "Measure conversion from day one",
            email: "Waitlist confirmations that deliver",
            hosting: "Domain, SSL and deploys handled",
        },
    },
];

//what every tier includes — displayed under the total (engagement terms)
export const everyTierIncludes: string[] = [
    "Fixed scope: your selections are the project scope",
    "One point of contact, start to finish",
    "Two revision rounds on design and content",
    "30 days of post-launch support",
    "You own everything: code, design, domain, accounts",
];

export const quoteSchema = z.object({
    selected: serviceIdSchema.array(),
    subtotal: z.number().int().nonnegative(),
    tierId: tierIdSchema,
    tierPrice: z.number().int().positive(),
    discount: z.number().int().nonnegative(),
    savings: z.number().int().nonnegative(),
});
export type Quote = z.infer<typeof quoteSchema>;

export function computeSubtotal(selected: ServiceId[]): number {
    return selected.reduce((sum, id) => sum + servicesById[id].price, 0);
}

export function deriveTier(subtotal: number): Tier {
    const found = tiers.find(tier => tier.maxSubtotal === null || subtotal <= tier.maxSubtotal);
    //tiers always terminates with a null-ceiling tier
    return found ?? tiers[tiers.length - 1];
}

export function computeQuote(selectedRaw: ServiceId[]): Quote {
    //dedupe + validate: money math must never trust its caller
    const selected = [...new Set(serviceIdSchema.array().parse(selectedRaw))];
    const subtotal = computeSubtotal(selected);
    const tier = deriveTier(subtotal);
    const discount = Math.max(0, subtotal - tier.price);

    return { selected, subtotal, tierId: tier.id, tierPrice: tier.price, discount, savings: discount };
}

export const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});
