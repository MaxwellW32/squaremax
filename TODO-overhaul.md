# Squaremax Overhaul — Progress Tracker

Working directly on `master` per Maxwell's instruction. No pauses between phases; flag crucial
architecture decisions for the client dynamic-website section as they land.

## Phase 0 — Audit & modernization
- [x] Full codebase audit (see summary in CHANGELOG-overhaul.md header)
- [x] Tracking files committed
- [x] Upgrade packages: Next 14→16, React 18→19, Zod 3→4, Tailwind 3→4, Drizzle 0.34→0.45, next-auth beta.22→beta.31
- [x] Fix breaking changes (async request APIs, zod v4 API, tailwind v4 CSS-first config, eslint flat config)
- [x] Remove dead deps: jotai, socket.io, socket.io-client, react-moment (verify usage first), uuid (→ crypto.randomUUID)
- [x] Replace runtime-mutating template registry (utility/globalTemplates.tsx string-splice) with static registry
- [x] Zod-validated env config module (lib/env.ts), .env.example
- [x] Zod validation on all external inputs (API routes, forms, ws messages)
- [x] Remove tsconfig excludes for websiteTemplates; fix broken `containersType` imports
- [x] Green: typecheck + lint + build

## Phase 1 — Marketing site redesign
- [ ] Token system (colors, type scale, spacing) — characterful display face + clean body face
- [ ] Pages: Home (two-path hero + embedded configurator), Custom Builds, Squaremax Sites, Portfolio/Work, Contact
- [ ] Mobile responsive, visible focus, prefers-reduced-motion

## Phase 2 — Flat-rate configurator
- [ ] Typed service catalog (Zod schema, editable data file)
- [ ] Tier bands: Launch $1,000 (≤$2,500) / Business $3,500 ($2,501–5,000) / Pro $6,500 (>$5,000)
- [ ] Discount math: max(0, subtotal − tierPrice); count-up animations
- [ ] Preset plans + use-case chips with tooltips
- [ ] Engagement terms section + "How it works" 5-step timeline
- [ ] CTA → intake form pre-filled with selections

## Phase 3 — Squaremax Sites (hosted, multi-tenant)
- [ ] DB: tenants, site_content (JSONB + schemaVersion), site_config, bookings, availability, messages, reviews
- [ ] /[businessSlug] server-rendered + ISR, cache-bust on save + billing webhooks
- [ ] Slug safety: reserved words, normalization, uniqueness
- [ ] Onboarding wizard: claim name → business form → pick look → add-ons → Stripe checkout → live
- [ ] Stripe: $10/mo base + $10/mo per add-on as subscription items; webhooks → tenant status
- [ ] Add-ons (full): booking, email notifications, custom domain (Caddy on-demand TLS doc)
- [ ] Add-ons (stubbed behind flags): gallery, reviews, announcements, analytics
- [ ] Admin dashboard (tenants, status, MRR, impersonate); tenant dashboard (content, design, add-ons)

## Phase 4 — Design system (three layers)
- [ ] Layer 1: ThemeSchema → CSS custom properties on tenant page root (NOT :root)
- [ ] Layer 2: variant registry { sectionType, variantId, component, propsSchema, preview }
- [ ] Layer 3: layout compositions (ordered variant ids + default theme id)
- [ ] ~8 quality themes + per-tenant token overrides
- [ ] Migrate 3 existing templates into registry; retire old usedComponents path for hosted product
- [ ] No-hardcoded-hex/font lint rule for variants

## Phase 5 — Polish & handoff
- [ ] Intake form → DB + email (top of sales funnel)
- [ ] Care Plan $100/mo Stripe product + admin tracking
- [ ] Seed data: barbershop (booking) + restaurant (gallery) demo tenants
- [ ] ARCHITECTURE.md, DEPLOY.md
- [ ] Tests: tier bands (edges at exactly $2,500/$5,000), discount math, webhooks, slug validation, booking conflicts

## Key architecture decisions (tenant dynamic site) — decided, flag changes to Maxwell
1. Content is keyed by SECTION TYPE (one hero blob, one services blob…), not by placed instance —
   layout swap = new variant list over same data, zero migration.
2. /[businessSlug] is RSC + ISR (revalidateTag per tenant), busted on content save AND Stripe status change.
3. Static variant registry (code + deploy), replacing runtime file-mutation of globalTemplates.tsx.
4. Theme = CSS custom properties inlined on tenant page ROOT ELEMENT (not :root) — instant client-side
   theme preview, marketing chrome fully isolated, impersonation-safe.
5. Curated self-hosted font set via next/font, referenced by key from themes (no runtime Google Fonts links).
6. Custom domains = middleware host-header rewrite → /[slug], Caddy on-demand TLS in front.
7. Old builder (usedComponents tree, CSS scoping, export/codegen) frozen for Custom Builds delivery;
   hosted product uses the new three-layer system exclusively.

## Environment notes
- No .env.local on this dev machine — DB/SMTP/auth creds are VPS-only. Migrations are generated,
  not applied, locally. .env.example documents everything needed.
- Custom server (server.js) wraps Next + raw `ws` — kept; port 3000.
