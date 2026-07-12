# Squaremax Overhaul — Progress Tracker

Working directly on `master`. All six phases executed 2026-07-12. This file now tracks
what shipped and the follow-ups worth doing next.

## Shipped ✔

### Phase 0 — Modernization
- [x] Next 14→16.2, React 18→19.2, Zod 3→4.4, Tailwind 3→4.3, Drizzle 0.34→0.45, next-auth beta.31; TS pinned 5.9; ESLint 9 flat config
- [x] Dead deps removed (jotai, socket.io ×2, react-moment, uuid, stripe); dead code removed (testIt, globalState)
- [x] Static template registry (no more runtime source-file mutation)
- [x] lib/env.ts (Zod-validated env) + .env.example
- [x] SECURITY: path traversal fixed in /api/userImages/view; upload mime allowlist; sendNodeEmail recipient pinned (was an open relay)
- [x] websiteTemplates typechecked; broken imports fixed

### Phase 1+2 — Marketing + configurator
- [x] Token system (ink/paper/brand/cobalt/mist/line, Space Grotesk + Geist), blueprint-grid signature
- [x] Pages: Home (two-path hero + live configurator), /custom-builds (+terms, 5-step timeline), /sites, /care-plan; nav tightened to 5 items
- [x] Configurator: typed catalog (lib/pricing/catalog.ts), tier bands, flat-rate discount, presets, use-case chips, count-up (reduced-motion aware)
- [x] Intake funnel: /custom-builds/start, server-side quote recompute, emails studio inbox

### Phase 3+4 — Squaremax Sites (hosted, multi-tenant)
- [x] Three-layer design system: themes→CSS vars on tenant root · variant registry (16 variants/10 section types, token-only) · compositions (3 designs)
- [x] Content keyed by section type; swap any variant within its class; any theme × any layout
- [x] /[businessSlug]: RSC + per-slug cache tag, paused placeholder; marketing chrome isolated in (marketing) group
- [x] Slug safety (normalize + reserved list); DB: tenants/payments/bookings/availability/messages (additive migration APPLIED to prod)
- [x] Billing: PowerTranz prepaid periods (cheers pattern) — checkout, session, callback (server re-verify, CAS, +30 days); simulate mode for dev
- [x] Onboarding wizard (claim → business form → pick look w/ live preview → add-ons → pay) + go-live QR page
- [x] Tenant dashboard (content/design/add-ons/renew/bookings+availability/messages); admin dashboard (tenants, status, MRR)
- [x] Add-ons live: booking, email notifications, custom domain (proxy rewrite + /domains route); stubbed behind flags: gallery, reviews, announcements, analytics

### Phase 5 — Polish
- [x] Seed: fade-district (barbershop, booking+email) + pepper-and-thyme (restaurant, gallery) — live in DB
- [x] Tests (33, vitest): tier-band edges $2,500/$5,000, discount, slug, booking conflicts, status transitions
- [x] ARCHITECTURE.md, DEPLOY.md (Caddy on-demand TLS, backups, pm2)
- [x] Care Plan page (/care-plan)
- [x] Smoke-tested in dev server: home, configurator, wizard, both tenant pages

## Follow-ups (next sessions)
- [ ] Tenant image uploads in wizard/dashboard (wire existing /api/userImages into hero/about/gallery fields)
- [ ] Care Plan self-serve checkout (reuse initiateHostedPayment + a carePlanPayments table; page currently emails)
- [ ] Renewal reminder emails (system cron hitting a small authed route — see DEPLOY.md)
- [ ] Caddy on_demand_tls "ask" endpoint (/api/domains/check) + dashboard field to set customDomain
- [ ] Build remaining add-ons: gallery upload UI, reviews, announcements, analytics
- [ ] Retire legacy builder (app/(marketing)/websites, usedComponents, export pipeline) once Custom Builds delivery moves off it
- [ ] Cancellation flow (tenant-initiated cancel → status "cancelled")
- [ ] Consider Pro band pricing: subtotals $5,001–$6,500 currently pay ABOVE itemized value ("$6,500 flat, minimum" copy covers it, but consider Pro at $5,500 or band at >$6,500)

## Key architecture decisions (final)
1. Content keyed by SECTION TYPE — swap designs with zero data migration.
2. /[businessSlug] = RSC + unstable_cache per-slug tags; busted on save AND billing change. (Cache serializes Dates to strings — effectiveStatus normalizes.)
3. Static variant registry; variants are code, shipped by deploy.
4. Theme = CSS vars on the tenant ROOT ELEMENT, never :root.
5. Curated next/font set, referenced by key from themes.
6. Custom domains = proxy.ts host rewrite → /domains/[host]; Caddy on-demand TLS.
7. Billing = PowerTranz hosted page + prepaid periods in OUR db (cheers pattern), status computed at read time, no cron.
8. Legacy builder frozen, not extended.
