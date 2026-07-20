# Squaremax Architecture

Two products on one Next.js 16 app (custom `server.js`, App Router, React 19, Drizzle + Postgres, Tailwind 4, Zod 4):

1. **Squaremax Sites** — the core product: multi-tenant hosted business websites at `squaremaxtech.com/{slug}`, $5/mo base + $5/mo per add-on (booking, notifications, store & inventory, custom domain). The home page sells this.
2. **Custom Builds** — bespoke flat-rate studio work (marketing + configurator + intake funnel) at `/custom-builds`.

## Route map

- `app/(marketing)/**` — everything with the Squaremax header/footer (home, sites, custom-builds, dashboard, admin, legacy pages). The route group owns the chrome; the root layout only has providers + fonts.
- `app/[businessSlug]/` — public tenant home page. `app/[businessSlug]/[pageSlug]/` — tenant sub-pages (up to 5 pages per site). `app/[businessSlug]/account/` — the tenant's CUSTOMER portal (static segment beats the dynamic one, so `account` is reserved from page slugs).
- `app/domains/[domain]/**` — custom-domain rendering targets mirroring the three routes above (see proxy below).
- `app/api/pay/*` — payment session + callback (PowerTranz).
- `proxy.ts` — host-header check: any non-canonical host rewrites `/` and single-segment paths to `/domains/{host}[/x]`; deeper paths 404.

## The instance model (tenant sites)

The core invariant: **a site is rows of placed components, each with a unique id that OWNS its data.** Two navbars on one site are two rows with two independent data blobs. Swapping a component's design (`variantId`) within its category never touches its data.

- **`tenantPages`** — up to 5 routes per site (`slug` `""` = home, `title`, `order`).
- **`tenantComponents`** — one row per placed instance: `region` (`header`/`main`/`footer` — header/footer render on every page), `pageId` (main only), `order`, `category` (fixes the data shape), `variantId` (the visual design, hot-swappable within the category), `data` (this instance's blob), `styles` (per-instance overrides).

Layers on top:

1. **Data shapes** (`lib/sites/content.ts`): one Zod schema per category — 28 categories in a discriminated union on `data.category` (navbar, hero, text, services, gallery, testimonials, hours, announcement, contact, booking, products, footer, featureGrid, stats, ctaBanner, faq, pricingPlans, steps, team, logoStrip, beforeAfter, video, priceList, locationMap, events, newsletter, divider, embed). `defaultComponentData()` seeds new instances; `sampleComponentData()` powers picker previews; `categoryGroups` defines the five goal-oriented picker groups (Page structure / Content & story / Selling & converting / Trust & proof / Practical info). Site-wide meta (business profile + SEO) lives on `tenants.content` — components read it via `ctx`, so a phone-number change applies everywhere. Missing optional fields degrade to tasteful placeholders publicly; in editor/onboarding previews (`ctx.preview`) they become explicit "add X" hints (`components/sites/sections/shared.tsx`).
2. **Themes** (`lib/sites/themes.ts`): pure data → `--t-*` CSS custom properties inlined on the tenant page **root element** (never `:root`). Fonts come from a curated `next/font` set; themes reference keys.
3. **Variant registry** (`lib/sites/registry.tsx`): each category has N visual variants (`components/sites/sections/*`), all styled exclusively with `--t-*` tokens and receiving the same `SectionProps<Data>` contract (`data`, instance `id`, `ctx`).
4. **Per-instance style overrides** (`lib/sites/styles.ts`): each rendered instance is wrapped in a `display:contents` div carrying `data-c={id}`; token overrides re-declare `--t-*` vars there (theme first, instance wins), and custom CSS is scoped by prefixing every selector with `[data-c="id"]` (`scopeCss`, unit-tested).
5. **Site templates** (`lib/sites/siteTemplates.ts`): a full starter site = theme + pages + component seeds. Applying one **copies it component by component** into the tenant's own rows with fresh ids (`instantiateTemplate`) — onboarding, the dashboard "start over" flow and the seed script all share this routine. `blank` is a template too.

`components/sites/TenantSite.tsx` renders header → current page → footer, resolving each row's variant. It powers the public pages, the onboarding preview (client-side instantiation, nothing persisted) and the dashboard editor preview (`preview` disables islands).

### How to add…

- **A variant**: one component in `components/sites/sections/`, one entry in `lib/sites/registry.tsx`. Tokens only (verify: `grep -rE '#[0-9a-fA-F]{3,6}|font-family' components/sites/sections/`).
- **A category**: schema + default in `lib/sites/content.ts`, label in `categoryLabels`, ≥1 variant, a form in `components/sites/dashboard/editorForms.tsx`.
- **A template**: one entry in `lib/sites/siteTemplates.ts` (seeds validate in tests).
- **An add-on**: one entry in `lib/sites/addons.ts` + its capability; flags live in `tenant.config.enabledAddons`; billing picks the price up automatically.

## The builder (dashboard → Website tab)

`components/sites/dashboard/WebsiteEditor.tsx`: pages + per-location component lists; per instance — edit data (schema-mirroring forms in `editorForms.tsx`), swap design (same category only, enforced server-side), reorder (order swap with neighbour), move to another page/region (appended at target end), style overrides, delete. Every mutation is a server action in `serverFunctions/handleSiteBuilder.tsx` (owner-gated, zod-validated against the row's category) followed by a full `getSiteForOwner` re-fetch — simple and always consistent. Live preview renders `TenantSite` from local state, reflecting unsaved edits of the selected instance.

Add + swap go through `ComponentPicker.tsx`: a modal that renders every design LIVE (scaled, in the tenant's own theme, with sample data via `sampleComponentData`), grouped by the five `categoryGroups` tabs plus a ★ Recent tab (localStorage, `sq-recent-designs`). Swap mode locks to the instance's category so data always carries over.

## Tenant customers (the clients' end users)

`tenantCustomers` is scoped per tenant — unique key `(tenantId, email)`. The same person on two client sites is two unrelated rows; each business owns its list (owner can **import** a list from another site they own — `importCustomersFromTenant`). Auth is scrypt password hashes (`lib/sites/passwords.ts`, no deps) + DB-backed sessions (`tenantCustomerSessions`) with a cookie named `sqc_{tenantId}`, so one browser can hold sessions on many tenant sites and custom domains work per-host. Portal at `/{slug}/account`: sign up/in, profile, notification opt-ins (email/WhatsApp), own bookings. Signed-in bookings get `customerId` stamped.

## Add-ons

`lib/sites/addons.ts` — $5 base + $5 each: **booking** (availability rules + slot math + advisory-locked conflict check; bookable services live on the booking component's own data; public widget = month-grid calendar + time-pill grid, closed weekdays greyed via `getBookingWeekdays`), **notifications** (owner emails for bookings/messages, customer announcement blasts via `handleNotifications.tsx` + `tenantAnnouncements` history, WhatsApp deep links; the newsletter section feeds password-less subscriber records via `handleSubscribe.tsx` — kept auth-import-free because it sits in the section import chain), **inventory** (accounting-grade: `tenantProducts` with price + COST + tax bps, `tenantSales` snapshot price/cost/tax per line with receipt-level discounts apportioned before tax, payment methods, refunds that restock, `tenantExpenses` ledger, date-range report — revenue / tax collected / COGS / gross & net profit / by-product / by-payment — with CSV exports in `ReportsPanel.tsx`), **custom-domain**. `monthlyTotal` tolerates retired ids on old rows.

## Multi-tenant request flow

```
GET /joes-barbershop[/about]
  → app/[businessSlug]/(…)/page.tsx
  → getTenantSiteBySlugCached(slug)   (ONE cached read: tenant + pages + components
                                       + products-if-needed; tag tenant:{slug}, 1h TTL)
  → effectiveStatus(tenant)           (computed from currentPeriodEnd — see billing)
  → visible?  PublicTenantPage → TenantSite : paused placeholder
```

Every mutation (builder save, add-on toggle, sale, successful payment) calls `revalidateTag("tenant:{slug}", "max")` — cache aggressively, correct immediately. NOTE: `unstable_cache` JSON-serializes, so `Date` columns arrive as ISO strings on cache hits; `effectiveStatus` normalizes. Per-customer data (the account page) is **never** read through the shared cache.

Slug safety: `lib/sites/slug.ts` (reserved list protects marketing routes); page slugs additionally reserve `account`/`api`/etc. (`lib/sites/site.ts`).

## Billing (PowerTranz, prepaid periods — the cheers pattern)

Unchanged from the original design, at $5 prices. A tenant subscription is a **prepaid 30-day period tracked in our DB**: pending payment row → hosted page + 3DS → unauthenticated callback → server-side re-verify via SpiToken → CAS promote → `currentPeriodEnd = max(now, old end) + 30 days`. Effective status computed at read time (active → 7-day grace → suspended); no cron; renewals user-initiated. Amount = `monthlyTotal(enabledAddons)` at checkout; snapshot stored on the payment row. Local dev: `POWERTRANZ_SIMULATE=1`.

## Custom domains (add-on)

Caddy (on-demand TLS) proxies the tenant's domain to the app → `proxy.ts` sees a non-canonical `Host` → rewrites to `/domains/{host}` (root), `/domains/{host}/{seg}` (page or `account`) → cached lookup by `tenants.customDomain` → same render path with `basePath=""` (links resolve at the domain root). See DEPLOY.md for the Caddy config.

## Custom Builds funnel

`lib/pricing/catalog.ts` is the single source of truth (services, tier bands ≤$2,500 / ≤$5,000 / above, presets). The configurator lives on `/custom-builds`; the intake (`/custom-builds/start` → `serverFunctions/handleIntake.tsx`) **recomputes the quote server-side from service ids** and emails the studio inbox.

## Legacy builder

The pre-overhaul builder (`app/(marketing)/websites/**`, `components/websites/**`, `usedComponents` tables, export/codegen pipeline) is frozen: kept working for Custom Builds delivery, excluded from new-code lint standards, not used by the hosted product. Retire at will.

## Email

`lib/email/transporter.ts` (server-only, recipients from trusted sources) does SMTP. `sendNodeEmail` (client-callable action) is pinned to the studio inbox. Tenant notifications (booking confirmations, message alerts, announcement blasts) go through `sendEmailInBackground` so SMTP hiccups never break a booking or a save.

## Tests

`npm test` (Vitest, `tests/`, 57 tests): tier-band edges, discount math, slug rules, booking slot generation + conflict overlap, effective-status transitions, and the instance model (`siteModel.test.ts`): every category default validates, cross-category data rejected (swap safety), registry integrity, every template instantiates into valid uniquely-identified rows, page assembly order, `scopeCss` (incl. @media, no double-prefixing), scrypt password roundtrip, $5 pricing math. All pure functions — no DB needed (`SKIP_ENV_VALIDATION` set by vitest config).

## Scripts

- `npx tsx scripts/seedDemoTenants.ts` — rebuilds the two demo tenants (`/fade-district` barbershop with booking+notifications, `/pepper-and-thyme` restaurant with notifications+inventory incl. products) on the instance model. Idempotent.
- `drizzle/*.sql` — hand-written additive idempotent migrations, applied manually (`0002_instance_model.sql` added pages/components/customers/sessions/products/sales/announcements + `tenantBookings.customerId`).
