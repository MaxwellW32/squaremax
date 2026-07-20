# Overhaul Changelog

One line per behavior-relevant refactor/change, newest last. Audit summary first.

## Phase 0 audit summary (2026-07-12)
- Next.js 14.2.35 App Router, custom `server.js` (Next + raw `ws` websocket rooms per websiteId).
- Two disconnected systems: specifications form (emails only) and template builder (hot-swaps
  template `defaultData`, not form data). "Form → premade design preview" bridge does not exist yet.
- Templates client-only (`ssr:false`), rendered in iframe at internal UUID URLs; every template
  imports `app/globals.css` (the theming entanglement).
- Registry `utility/globalTemplates.tsx` is string-spliced ON DISK at runtime — incompatible with
  immutable deploys/ISR.
- Dead: jotai (unused), socket.io + socket.io-client (real impl is raw ws), testIt prototype page,
  `getTemplatesByFamily` stub, commented Handlebars block in handleNodeEmails.
- Broken: two templates import non-existent `containersType`; hidden because tsconfig excludes
  `websiteTemplates/` from typechecking.
- No Stripe. Email via nodemailer/Hostinger SMTP. DB: Drizzle + pg (websites, pages,
  usedComponents, templates, categories, styles, + next-auth tables).

## Changes
- Upgraded: Next 14.2.35 → 16.2.10 (Turbopack builds), React 18 → 19.2, Zod 3 → 4.4, Tailwind 3 → 4.3
  (CSS-first config; deleted tailwind.config.ts), Drizzle 0.34 → 0.45, drizzle-kit 0.25 → 0.31,
  next-auth beta.22 → beta.31, pg/ws/sharp/octokit/jszip to latest. Added stripe + resend (used from Phase 3).
- TypeScript pinned to 5.9 (TS 7 native compiler not yet supported by Next 16's build integration).
- ESLint 9 + flat config (eslint.config.mjs); ESLint 10 incompatible with eslint-config-next's react plugin.
  Legacy builder dirs have react-compiler rules downgraded to warnings pending Phase 1-4 replacement.
- nodemailer pinned to ^7 (next-auth peer dependency ceiling), not v9.
- Removed dead deps: jotai, socket.io, socket.io-client, react-moment, uuid/@types/uuid
  (uuid → crypto.randomUUID; react-moment → Intl helpers in utility/dates.ts).
- BEHAVIOR: template registry (utility/globalTemplates.tsx) is now static — no runtime file mutation.
  addTemplate/deleteTemplate no longer splice source code; new templates need one registry line + deploy.
  (Old approach broke immutable deploys/ISR; whole flow is superseded by the Phase 4 registry.)
- Migrated 8 pages to Next 15/16 async params/searchParams APIs.
- websiteTemplates/ now typechecked (removed tsconfig exclude); fixed broken containersType imports.
- Fixed saveToStorage anys (generics), @ts-ignore → typed narrow in handleServerFiles,
  require(dotenv) → import in drizzle.config.ts, removed redundant dotenv load in handleNodeEmails.
- package.json: added `typecheck` script; `lint` is now `eslint .` (next lint removed in Next 16).
- Added lib/env.ts: Zod-validated env access (SKIP_ENV_VALIDATION escape hatch for CI); .env.example documents all vars.
- db/index.ts + handleNodeEmails now consume lib/env (no scattered process.env / dotenv loads).
- SECURITY: fixed path traversal in /api/userImages/view (unvalidated imageName reached fs.readFile; no auth). Now uuid.ext regex + resolved-path containment + 400/404 responses + immutable cache header.
- /api/userImages/add: mime allowlist (jpeg/png/gif/webp/avif) + File instance check; extension derived from allowlist, not raw mime split.
- Deleted dead code: app/websites/(hideNav)/testIt (alternate render prototype), utility/globalState.tsx (unused).
- Marketing restructure: all chrome-bearing pages moved to app/(marketing)/ route group; root layout is providers-only; tenant pages render chrome-free.
- BILLING PIVOT: Stripe replaced with PowerTranz hosted-page gateway (cheers pattern) — prepaid 30-day periods tracked in our DB, status computed at read time (active/grace/suspended), no cron. stripe dep removed, POWERTRANZ_* env added (SIMULATE=1 for dev).
- Squaremax Sites shipped: three-layer design system (themes/variants/compositions), /[businessSlug] with per-slug cache tags, onboarding wizard, tenant + admin dashboards, booking/email/custom-domain add-ons, feature-flag catalog for the rest.
- middleware.ts renamed proxy.ts (Next 16 convention); non-canonical hosts rewrite to /domains/[host] for the custom-domain add-on.
- revalidateTag now requires a cache profile in Next 16 — all calls pass "max".
- Zod 4: z.partialRecord for variantOverrides (z.record with enum keys demands exhaustive keys).
- unstable_cache serializes Dates to ISO strings on cache hits — effectiveStatus normalizes (found via dev-server smoke test).
- Additive migration drizzle/0001 applied to production DB: tenants, tenantPayments, tenantBookings, tenantAvailability, tenantMessages (+3 enums). No existing tables touched.
- Seeded demo tenants: /fade-district (booking + email add-ons, barber theme), /pepper-and-thyme (gallery, espresso theme + services.list override).
- Tests: vitest added (npm test) — 33 tests over tier bands (edges 2500/5000), discount, slug, booking conflicts, status.
- Docs: ARCHITECTURE.md (three layers, request flow, billing flow, how-to-add-X), DEPLOY.md (pm2, Caddy on-demand TLS, backups, migrations).
- /care-plan page added (email CTA for now; self-serve gateway checkout is a listed follow-up).
- qrcode + tsx + vitest added as deps; nodemailer transporter unified in lib/email/transporter.ts (client-callable action still recipient-pinned).
- BUG SWEEP (3 review agents + manual verification, all confirmed findings fixed):
  - HIGH billing: callback now settles under per-payment+per-tenant advisory locks with the tenant re-read FOR UPDATE — two renewals stack +30d each instead of clobbering; duplicate callbacks can no longer mark a charged payment failed; gateway OrderIdentifier verified against the payment; gateway network errors return not-approved instead of 500ing mid-3DS.
  - HIGH booking: per-tenant advisory lock in submitBooking (READ COMMITTED alone allowed double-booking); slot math re-anchored to America/Jamaica (fixed UTC-5) — correct on a UTC VPS; widget day list + slot labels pinned to business TZ (also fixes SSR hydration mismatch).
  - MED: tenant-domain cache tag now busted on saves + payments; getTenantBySlugCached moved out of "use server" (was a public endpoint leaking full tenant rows); tenant fonts moved onto TenantSite root (custom-domain pages + wizard/dashboard previews had wrong typography); coming-soon add-ons already on a tenant no longer brick config saves; SITE_URL dev default now localhost (simulated payments posted callbacks to production); header Dashboard link went to legacy /websites; repeated ?services= params 500d the intake page; wizard keeps the typed name across sign-in + sequences slug checks.
  - LOW: configurator CTA disabled at 0 selections; upload route validates whole batch before writing (no orphans, 400 not 500); availability rules validated (HH:MM range, open<close, unique weekday); booking CTAs hidden when no services; /domains double-decode removed; custom-domain non-root paths 404; duplicate-name React keys; seed updates businessName; /sites/live treats grace as live and 404s bad slugs.
- /websites page rebuilt in the new design language: debounced+sequenced name search, card grid with edit/preview, skeleton loading, empty states, honest pagination (replaces generic Search component usage on this page).

## v2 — instance-based sites, customers & business add-ons (2026-07-20)
- CORE PIVOT: section-type-keyed content replaced by the INSTANCE MODEL — a site is tenantPages (up to 5) + tenantComponents rows; every placed component has a unique id, a category (fixes the data shape), a hot-swappable variantId (design), its OWN data blob and per-instance style overrides. Swapping designs never migrates data; two navbars hold two independent menus.
- lib/sites/content.ts rewritten: per-category Zod schemas (navbar menus + one dropdown level, hero, text, services, gallery, testimonials, hours, announcement, contact, booking, products, footer) in a discriminated union on data.category; tenants.content now holds site-wide meta (business profile + SEO) that components read via ctx.
- compositions.ts deleted; registry keyed by category (20 variants incl. new gallery.strip, testimonials.spotlight, text.simple/image, announcement.bar, products.grid); sections rewritten to SectionProps<Data> = { data, id, ctx }.
- Per-instance styling: display:contents wrapper carries data-c={id}; token overrides re-declare --t-* vars (theme first, instance wins); custom CSS scoped via scopeCss selector prefixing (@media-aware, unit-tested — found+fixed a rule-after-media scoping bug via tests).
- Site templates (lib/sites/siteTemplates.ts): blank, storefront-classic (2 pages), bold-banner, minimal-card, shopfront; instantiateTemplate copies seeds into fresh-id rows — shared by onboarding, dashboard "start over" and the seed script.
- Multi-page routing: /[businessSlug]/[pageSlug] + custom-domain equivalents; proxy.ts now rewrites single-segment paths on foreign hosts; /{slug}/account reserved (static beats dynamic).
- TENANT CUSTOMERS: tenantCustomers scoped per tenant (unique tenantId+email — same person on two client sites = two unrelated accounts), scrypt hashes (node:crypto, no deps), DB sessions + sqc_{tenantId} cookies (per-host safe on custom domains), /{slug}/account portal (sign up/in, prefs, own bookings), bookings stamp customerId, owner can import a customer list from another site they own.
- ADD-ONS at $5 (base $5): booking (services now live on the booking component's data), notifications (renamed from email-notifications; + announcement blasts to opted-in customers with tenantAnnouncements history + wa.me deep links), NEW inventory (tenantProducts/tenantSales, integer cents + bps tax, advisory-locked stock decrement, month-to-date revenue/tax/top-items/low-stock, public shop section with WhatsApp ordering), custom-domain. gallery/announcements retired as add-ons (now ordinary components); monthlyTotal tolerates retired ids.
- Dashboard rebuilt: Website tab = full builder (pages CRUD, add/reorder/relocate/delete components, per-category data forms, design swap, per-instance style editor, live preview reflecting unsaved edits), Design (theme + color fine-tuning), Business (profile + socials + SEO), Store, Customers, Marketing, Bookings, Messages, Add-ons, Overview.
- Onboarding: "pick a starting point" step instantiates the chosen template CLIENT-SIDE for the preview (nothing persisted), then createDraftTenant copies it into DB rows; theme pick applies at create.
- Marketing restructure: home page now sells the hosted product ($5 modules grid from the addon catalog, builder story, live demo links, 5 steps, custom-builds demoted to a footer-adjacent section); configurator lives solely on /custom-builds; nav reordered; root metadata + /sites copy updated to $5.
- Migration drizzle/0002_instance_model.sql applied: tenantPages, tenantComponents, tenantCustomers, tenantCustomerSessions, tenantProducts, tenantSales, tenantAnnouncements (+componentRegion enum), tenantBookings.customerId. Additive + idempotent.
- Seed rewritten on the instance model (fade-district: booking+notifications; pepper-and-thyme: notifications+inventory with real products); scripts/loadEnv.ts first-import fixes env-at-import-time under tsx.
- Tests 37 → 57: category defaults validate, cross-category swap safety, registry integrity, template instantiation (unique ids, valid refs), page assembly order, scopeCss, scrypt roundtrip, $5 pricing; vitest sets SKIP_ENV_VALIDATION.
- Verified: tsc clean, eslint 0 errors, 57/57 tests, production build, live smoke test (home, both demos, sub-page, account portal, 404s).

## v2.1 — full component catalog, picker UX, cheers-style booking, accounting (2026-07-20)
- Component catalog 12 → 28 categories (+20 → 39 designs): featureGrid (cards/checklist), stats band, ctaBanner (band/split), faq accordion (pure CSS), pricingPlans, steps (numbered/timeline), team, logoStrip, beforeAfter, video (YouTube/Vimeo → privacy embed), priceList (classic menu/columns — grouped sections), locationMap (embed or open-in-maps fallback), events, newsletter capture, divider, sandboxed embed (iframe-only, never raw HTML). Each: Zod schema w/ required-vs-optional semantics, default + sample data, editor form, ≥1 design.
- Picker groups: 5 goal-oriented groups (Page structure / Content & story / Selling & converting / Trust & proof / Practical info) in lib/sites/content.ts categoryGroups.
- NEW ComponentPicker modal: every design rendered live (scaled, tenant's own theme, sample data), grouped tabs + ★ Recent (localStorage), swap mode locked to the category so data always carries over. Replaces the bare selects in WebsiteEditor.
- Fallback philosophy: public visitors get tasteful placeholders (dashed pattern blocks, initial avatars); editor/onboarding previews get explicit "Add a photo/Add your steps" hints (sections/shared.tsx). Superset data persists across design swaps by design.
- Newsletter capture: password-less subscriber customer rows via handleSubscribe.tsx (auth-import-free — it sits in the section import chain); customerSignUp lets subscribers claim their record; opted straight into announcement blasts.
- Booking UX (cheers-inspired, logic unchanged): public widget now a rounded month-grid calendar (‹ › nav, solid-fill selected day, closed weekdays struck through via new public getBookingWeekdays) + time-pill grid (3/4 cols). Dashboard weekly availability restyled: rounded-xl day rows, green status dots, tap-day-to-toggle, "to" time inputs.
- INVENTORY → ACCOUNTING-GRADE (migration 0003 applied): product costCents (COGS); sales get paymentMethod (cash/card/transfer/whatsapp/other), receipt-level discount apportioned before tax, per-line cost snapshot, refund status (restocks, stays on the books); NEW tenantExpenses ledger (label/category/amount/date). getReport(range): revenue, tax collected, net sales, COGS, gross profit, expenses by category, net profit, by-product, by-payment + full rows. ReportsPanel: date range, stat tiles, sales/expenses CSV export (accountant-ready), expense entry. Store tab: cost field, payment+discount at the counter, refund buttons.
- storefront-classic template ships a FAQ section; fade-district demo seeded with real barber FAQ.
- Verified: tsc clean, eslint 0 errors, 57/57 tests (category/registry/template loops now sweep all 28), production build, live smoke test.
