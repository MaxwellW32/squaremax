# Squaremax Architecture

Two products on one Next.js 16 app (App Router, React 19, Drizzle + Postgres, Tailwind 4, Zod 4):

1. **Squaremax Sites** — the core product: multi-tenant hosted business websites at `squaremaxtech.com/{slug}`. US$10/mo base, US$5/mo per add-on (booking, notifications, online store & orders, custom domain), bundles auto-applied (Service US$15, Storefront US$20), a year charged as ten months. The home page and `/pricing` sell this.
2. **Custom Builds** — bespoke flat-rate studio work (marketing + configurator + intake funnel) at `/custom-builds`.

## Route map

- `app/(marketing)/**` — everything with the Squaremax header/footer: home, `/pricing`, `/sites` (how it works, + `/sites/start` onboarding, `/sites/live/[slug]` go-live), `/signin` (+ `/signin/check-email`), `/custom-builds` (+ `/custom-builds/start` intake), `/projects`, `/contact`, `/care-plan`, `/privacyPolicy`, `/dashboard[/tenantId]`, `/admin`. The route group owns the chrome and the ad-measurement tags (`components/marketing/Analytics.tsx`, env-gated); the root layout only has providers + fonts.
- `app/[businessSlug]/` — public tenant home page. `app/[businessSlug]/[pageSlug]/` — tenant sub-pages (up to 5 pages per site). `app/[businessSlug]/account/` — the tenant's CUSTOMER portal (static segment beats the dynamic one, so `account` is reserved from page slugs).
- `app/domains/[domain]/**` — custom-domain rendering targets mirroring the three routes above (see proxy below).
- `app/api/pay/*` — payment session + callback (PowerTranz). `app/api/cron/renewals` — daily reminder emails (bearer `CRON_SECRET`). `app/api/domains/check` — Caddy on-demand-TLS ask endpoint. `app/api/uploads/[...key]` — serves local-disk uploads when R2 isn't configured.
- `app/sitemap.ts` / `app/robots.ts` — marketing pages + every live tenant home page; dashboard/sign-in/api excluded.
- `proxy.ts` — host-header check: any non-canonical host rewrites `/` and single-segment paths to `/domains/{host}[/x]`; deeper paths 404.

## Owner sign-in

`auth/auth.ts`: Auth.js with the Drizzle adapter. **Email magic links are the default** (Nodemailer provider over the same SMTP as everything else, branded template, 15-minute links); Google/GitHub buttons appear only when their env vars exist. Google has `allowDangerousEmailAccountLinking` so a client who first signed in by email can use Google later. Custom pages: `/signin` (server actions in `serverFunctions/handleAuth.tsx` — never wrapped in try/catch, Auth.js redirects by throwing), `/signin/check-email`, errors mapped to plain-English copy. Every "sign in" link in the app points at `/signin?callbackUrl=`.

## Pricing (`lib/sites/addons.ts`, `lib/sites/billing.ts`)

One file holds every number. `priceQuote(enabledAddons)` returns the cheapest of à-la-carte vs each bundle-plus-extras, so bundles apply themselves; `monthlyTotal()` is its `.monthly`. `checkoutAmountCents(addons, months)` multiplies by `chargeableMonths(months)` (every full 12 months has 2 free). `planLines()` renders a bundle line + extras, or base + add-ons. The marketing `PlanCards`, the wizard, the dashboard Plan tab, the admin MRR and the checkout all read from here. The wizard accepts `?plan=service|storefront` to preselect a bundle.

## The instance model (tenant sites)

The core invariant: **a site is rows of placed components, each with a unique id that OWNS its data.** Two navbars on one site are two rows with two independent data blobs. Swapping a component's design (`variantId`) within its category never touches its data.

- **`tenantPages`** — up to 5 routes per site (`slug` `""` = home, `title`, `order`).
- **`tenantComponents`** — one row per placed instance: `region` (`header`/`main`/`footer` — header/footer render on every page), `pageId` (main only), `order`, `category` (fixes the data shape), `variantId` (the visual design, hot-swappable within the category), `data` (this instance's blob), `styles` (per-instance overrides).

Layers on top:

1. **Data shapes** (`lib/sites/content.ts`): one Zod schema per category — 28 categories in a discriminated union on `data.category`. `defaultComponentData()` seeds new instances; `sampleComponentData()` powers picker previews; `categoryGroups` defines the five goal-oriented picker groups. Site-wide meta (business profile + SEO) lives on `tenants.content` — components read it via `ctx`, so a phone-number change applies everywhere. Missing optional fields degrade to tasteful placeholders publicly; in editor/onboarding previews (`ctx.preview`) they become explicit "add X" hints. **Rows saved before a field existed** read as `undefined` in renderers (handle with `??` defaults, as `products.tsx` does) and are normalised through the schema when the editor selects them (`WebsiteEditor.select`).
2. **Themes** (`lib/sites/themes.ts`): pure data → `--t-*` CSS custom properties inlined on the tenant page **root element** (never `:root`). Fonts come from a curated `next/font` set; themes reference keys.
3. **Variant registry** (`lib/sites/registry.tsx`): each category has N visual variants (`components/sites/sections/*`), all styled exclusively with `--t-*` tokens and receiving the same `SectionProps<Data>` contract.
4. **Per-instance style overrides** (`lib/sites/styles.ts`): token overrides re-declare `--t-*` vars on a `display:contents` wrapper carrying `data-c={id}`; custom CSS is scoped by prefixing every selector with `[data-c="id"]` (`scopeCss`, unit-tested).
5. **Site templates** (`lib/sites/siteTemplates.ts`): a full starter site = theme + pages + component seeds, copied component by component into the tenant's own rows with fresh ids (`instantiateTemplate`).

`components/sites/TenantSite.tsx` renders header → current page → footer, resolving each row's variant. It powers the public pages, the onboarding preview and the dashboard editor preview (`preview` disables islands).

**Import-chain rule:** section components import islands, islands import public server actions. Anything in that chain must stay free of `lib/sites/owner.ts` (→ Auth.js → `next/server`), or the pure Vitest suite can't load the registry. Public actions therefore live in their own modules (`handleTenantPublic`, `handleSubscribe`, `handleOrdersPublic`) and share `lib/sites/publicTenant.ts`; owner-gated actions (`handleOrders`, `handleInventory`, …) import `owner.ts` freely.

### How to add…

- **A variant**: one component in `components/sites/sections/`, one entry in `lib/sites/registry.tsx`. Tokens only.
- **A category**: schema + default in `lib/sites/content.ts`, label in `categoryLabels`, ≥1 variant, a form in `components/sites/dashboard/editorForms.tsx`. Image slots use `ImageField` (URL, upload, or pick from uploads).
- **A template**: one entry in `lib/sites/siteTemplates.ts` (seeds validate in tests).
- **An add-on**: one entry in `lib/sites/addons.ts` + its capability; flags live in `tenant.config.enabledAddons`; billing and bundles pick the price up automatically.

## The dashboard (`components/sites/dashboard/TenantDashboard.tsx`)

Ten tabs, stored in the URL (`?tab=`) so payment callbacks and emails deep-link; the tab strip is sticky under the 64px header and scrolls sideways on phones. **Overview** shows what needs attention (new orders, bookings to confirm, unread messages, sales this month), a status banner for draft/grace/paused, a launch checklist computed from real data (contact set, offer listed, photo added, hours set, live), and share tools (QR, copy, WhatsApp). **Website** is the canvas editor (`WebsiteEditor` — on small screens the sidebar scrolls into view when a component is selected). **Business** is the profile + logo upload + SEO. **Orders**, **Store**, **Bookings** (upcoming/past split, weekly hours), **Customers** (+ CSV export), **Messages**, **Marketing**. **Plan & billing** = add-on toggles with bundle quick-picks and live price, the custom-domain card, then the subscription (pay months/year, receipts, site on/off).

`UploadContext` (in `ImageField.tsx`) carries the tenant id so any form can offer Upload without prop-threading.

## Media uploads

`serverFunctions/handleMedia.tsx` `uploadImage(tenantId, FormData)`: owner-gated; sharp auto-rotates, caps at 1600px, re-encodes WebP q82; ledger row in `tenantMedia`; 500 MB per-tenant quota. Storage adapter `lib/storage.ts`: R2 via the S3 SDK when `R2_*` is set (immutable cache headers, public bucket URL), else `userUploadedData/` on disk served by `/api/uploads/[...key]`. Keys are `t/{tenantId}/{uuid}.webp` either way. `next.config.mjs` raises the server-action body limit to 12 MB.

## Tenant customers (the clients' end users)

`tenantCustomers` is scoped per tenant — unique key `(tenantId, email)`. Auth is scrypt password hashes + DB-backed sessions with a cookie named `sqc_{tenantId}`. Portal at `/{slug}/account`: sign up/in, profile, notification opt-ins, own bookings and own orders. Signed-in bookings and orders get `customerId` stamped.

## Add-ons

- **booking** — availability rules + slot math (Jamaica time) + advisory-locked conflict check; bookable services live on the booking component; public widget = month-grid calendar + time pills. Confirmation/cancellation emails are Jamaica-time formatted.
- **notifications** — owner emails for bookings/orders/messages, customer confirmations, announcement blasts (`handleNotifications.tsx` + `tenantAnnouncements`), WhatsApp deep links.
- **inventory** ("Online store & inventory") — `tenantProducts` (price, cost, tax bps, stock), **online orders** (below), counter sales, refunds that restock, expenses ledger, date-range report anchored to Jamaica calendar days, CSV exports. All receipt math is `lib/sites/saleMath.ts` (`priceReceipt`: discount capped and apportioned before tax, per-line tax, stock check, duplicate-line merge) and every sale is written by `lib/sites/salesCore.ts` `createSaleInTx` under the per-tenant inventory advisory lock — counter sales and paid orders share the same path.
- **custom-domain** — `lib/sites/domains.ts` normalises what the owner types (strips scheme/www/port, rejects platform hosts); `handleDomains.tsx` sets/clears it and does a live `dns.resolve4` check against `CUSTOM_DOMAIN_A_RECORD`; `/api/domains/check` gates Caddy's on-demand TLS; `www.` resolves to the apex in the cached lookup and the tag.

### Online orders (`tenantOrders`)

Products section with `orderMethod: "order"` renders `ShopOrderForm` (steppers, sticky cart bar on phones, pickup/delivery per the section's settings, name/phone/email/address/note). `placeOrder` (public) re-prices from the product rows, stamps the signed-in customer, emails the owner and customer with notifications on, and hands back a pre-filled WhatsApp link so the customer opens the thread. Orders are requests: **no stock moves until the owner marks it paid**, which calls `createSaleInTx` (stock, receipt, reports) and links `saleId`. New → Paid → Done; only New can be cancelled (paid = refund the sale in Store). No money flows through the platform; see GROWTH-PLAN §5 for the bring-your-own-gateway next step.

## Multi-tenant request flow

```
GET /joes-barbershop[/about]
  → app/[businessSlug]/(…)/page.tsx
  → getTenantSiteBySlugCached(slug)   (ONE cached read: tenant + pages + components
                                       + products-if-needed; tag tenant:{slug}, 1h TTL)
  → effectiveStatus(tenant)           (computed from currentPeriodEnd — see billing)
  → visible?  PublicTenantPage → TenantSite : paused placeholder
```

Every mutation (builder save, add-on toggle, sale, paid order, domain change, successful payment) calls `bustTenantCache` (`revalidateTag(tag, { expire: 0 })`) — cache aggressively, correct immediately. NOTE: `unstable_cache` JSON-serializes, so `Date` columns arrive as ISO strings on cache hits; `effectiveStatus` normalizes. Per-customer data (the account page) is **never** read through the shared cache.

Slug safety: `lib/sites/slug.ts` (reserved list protects marketing routes); page slugs additionally reserve `account`/`api`/etc. (`lib/sites/site.ts`).

## Billing (PowerTranz, prepaid periods — the cheers pattern)

A tenant subscription is a **prepaid 30-day period tracked in our DB**: pending payment row → hosted page + 3DS → unauthenticated callback → server-side re-verify via SpiToken → CAS promote → `currentPeriodEnd = max(now, old end) + 30 days × months`. Effective status computed at read time (active → 7-day grace → suspended); renewals user-initiated. Amount = `checkoutAmountCents(enabledAddons, months)` at checkout (bundles + annual discount), snapshotted on the row. Prices are USD; with `POWERTRANZ_CURRENCY=jmd` the gateway is charged the JMD equivalent and both figures are stored (`gatewayCurrency`, `gatewayAmountCents`). The rate comes from `lib/payments/fx.ts`: pinned by `JMD_PER_USD` if set, otherwise the mid-market rate fetched once per Jamaica calendar day plus `JMD_RATE_MARGIN_PERCENT`, rounded up to a whole J$ (`fxMath.ts`, unit-tested), with the last good value as a fallback; if no rate is known, checkout refuses with a clear message instead of guessing. The dashboard and wizard show the J$ figure and the day's rate before the client pays. A first payment lands on `/sites/live/{slug}` (fires the ad `purchase` conversion); a renewal returns to `/dashboard/{id}?tab=plan&paid=1`; declines go back to where the customer started. Local dev: `POWERTRANZ_SIMULATE=1`.

**Renewal reminders**: `/api/cron/renewals` (system cron, daily) emails owners 5 days before a period ends and once when it lapses into grace; `tenants.renewalReminderFor` / `lapseNoticeFor` store the period end each email covered, so runs are idempotent.

## Custom Builds funnel

`lib/pricing/catalog.ts` is the single source of truth (services, tier bands ≤$2,500 / ≤$5,000 / above, presets). The configurator lives on `/custom-builds`; the intake (`/custom-builds/start` → `serverFunctions/handleIntake.tsx`) **recomputes the quote server-side from service ids** and emails the studio inbox.

## Email

`lib/email/transporter.ts` (server-only, recipients from trusted sources) does SMTP (`SMTP_HOST`/`SMTP_PORT`, default Hostinger 465) and is shared by notifications, sign-in links and the renewal cron. `sendNodeEmail` (client-callable action) is pinned to the studio inbox. Tenant notifications go through `sendEmailInBackground` so SMTP hiccups never break a booking, order or save.

## Tests

`npm test` (Vitest, `tests/`, 97 tests): custom-build tier bands, slug rules, booking slot generation + conflict overlap, effective-status transitions, the instance model (`siteModel.test.ts`), prepaid billing math incl. the annual discount, **Sites pricing** (bundles apply themselves, extras charged on top, plan lines), **receipt math** (`saleMath.test.ts`: discount apportioning, per-line tax, stock, duplicate lines), **domains** (normalisation, www/port, platform hosts). All pure functions — no DB needed (`SKIP_ENV_VALIDATION` set by vitest config).

## Scripts

- `npx tsx scripts/seedDemoTenants.ts` — rebuilds the two demo tenants (`/fade-district` barbershop with booking+notifications, `/pepper-and-thyme` restaurant with notifications+inventory incl. products and an online-order shop with delivery). Idempotent.
- `drizzle/*.sql` — hand-written additive idempotent migrations, applied manually. `0005` added orders, media, renewal bookkeeping and gateway-currency columns.
