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
