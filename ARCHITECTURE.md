# Squaremax Architecture

Two products on one Next.js 16 app (custom `server.js`, App Router, React 19, Drizzle + Postgres, Tailwind 4, Zod 4):

1. **Custom Builds** — marketing + flat-rate configurator + intake funnel.
2. **Squaremax Sites** — multi-tenant hosted business pages at `squaremaxtech.com/{slug}`, $10/mo + $10/mo per add-on.

## Route map

- `app/(marketing)/**` — everything with the Squaremax header/footer (home, custom-builds, sites, dashboard, admin, legacy pages). The route group owns the chrome; the root layout only has providers + fonts.
- `app/[businessSlug]/` — public tenant pages. No marketing chrome; own layout loads the curated tenant fonts.
- `app/domains/[domain]/` — custom-domain rendering target (see proxy below).
- `app/api/pay/*` — payment session + callback (PowerTranz).
- `proxy.ts` — host-header check: any non-canonical host rewrites to `/domains/{host}`.

## The three-layer design system (tenant sites)

The core invariant: **content is keyed by SECTION TYPE, never by placed component.** One `hero` blob feeds any hero variant, so swapping designs never migrates data.

**Layer 1 — themes** (`lib/sites/themes.ts`): a theme is pure data (colors, font keys, weights, scale, radius). At render time `themeToStyle()` turns it into `--t-*` CSS custom properties inlined on the tenant page **root element** (never `:root`) — marketing chrome is isolated, theme preview is an instant style swap, and two tenants can render in one tree. Fonts come from a curated set loaded via `next/font` in `app/[businessSlug]/layout.tsx`; themes reference keys, never font names.

**Layer 2 — variant registry** (`lib/sites/registry.tsx`): every section type (navbar, hero, about, services, gallery, testimonials, hours, contact, booking, footer) has one Zod content schema (`lib/sites/content.ts`) and N visual variants (`components/sites/sections/*`). Variants are styled **exclusively** with `--t-*` tokens — no hex, no font-family (verify: `grep -rE '#[0-9a-fA-F]{3,6}|font-family' components/sites/sections/`). Every variant receives the same `SectionProps` contract.

**Layer 3 — compositions** (`lib/sites/compositions.ts`): a named design = ordered list of variant ids + default theme id. Per-tenant `config.variantOverrides` swaps any variant for a sibling of the same section type.

`components/sites/TenantSite.tsx` resolves theme → composition → overrides and renders. It is server-renderable end-to-end; interactive bits (message form, booking widget) are client islands. The same component powers the public page, the onboarding "pick your look" preview, and the dashboard design tab (with `preview` to disable the islands).

### How to add…

- **A variant**: one component in `components/sites/sections/`, one entry in `lib/sites/registry.tsx`. Tokens only.
- **A theme**: one entry in `lib/sites/themes.ts` (new font? add its key + `next/font` load in the tenant layout).
- **A composition**: one entry in `lib/sites/compositions.ts`.
- **An add-on**: one entry in `lib/sites/addons.ts` (status `available` gates purchasability), plus its section/capability. Flags live in `tenant.config.enabledAddons`; billing picks the price up automatically.
- **A configurator service / tier band change**: edit `lib/pricing/catalog.ts` only. Tests in `tests/pricing.test.ts` pin the band edges.

## Multi-tenant request flow

```
GET /joes-barbershop
  → app/[businessSlug]/page.tsx
  → getTenantBySlugCached(slug)            (unstable_cache, tag `tenant:{slug}`, 1h TTL)
  → effectiveStatus(tenant)                (computed from currentPeriodEnd — see billing)
  → visible?  TenantSite : paused placeholder
```

Every mutation (content save, design change, add-on toggle, successful payment) calls `revalidateTag("tenant:{slug}", "max")` — cache aggressively, correct immediately. NOTE: `unstable_cache` JSON-serializes, so `Date` columns arrive as ISO strings on cache hits; `effectiveStatus` normalizes.

Slug safety: `lib/sites/slug.ts` — normalization + a generous reserved list (protects future marketing routes; a tenant who owns `/pricing` would block that page forever).

## Billing (PowerTranz, prepaid periods — the cheers pattern)

No provider-managed subscriptions. A tenant subscription is a **prepaid 30-day period tracked in our DB**:

```
startTenantCheckout(tenantId)                    serverFunctions/handleTenantBilling.tsx
  → insert PENDING tenantPayments row first
  → POST /api/spi/sale (hosted page + 3DS)       lib/payments/powertranz.ts
  → park RedirectData HTML, browser → /api/pay/session/{token}
  → gateway posts outcome → /api/pay/callback    (intentionally unauthenticated)
      → re-verify server-side via POST /api/spi/payment (SpiToken)  ← source of truth
      → CAS promote pending → succeeded (idempotent under replays)
      → currentPeriodEnd = max(now, old end) + 30 days; status → live
      → revalidateTag
```

- Effective status is **computed at read time** (`lib/sites/status.ts`): active → grace (7 days, page stays up) → suspended (paused placeholder). **No cron.** Renewals are user-initiated from the dashboard.
- Amount charged = `monthlyTotal(enabledAddons)` at checkout time; the add-on snapshot is stored on the payment row for the audit trail. Toggling add-ons mid-cycle changes the page immediately and the price from the next renewal.
- Local dev: `POWERTRANZ_SIMULATE=1` renders an in-app approve/decline page that posts to the callback exactly like the gateway (refused in production).

## Custom domains (add-on)

Caddy (on-demand TLS) proxies the tenant's domain to the app → `proxy.ts` sees a non-canonical `Host` → rewrites to `/domains/{host}` → looks up `tenants.customDomain` (cached, tag `tenant-domain:{host}`) → renders `TenantSite`. See DEPLOY.md for the Caddy config.

## Custom Builds funnel

`lib/pricing/catalog.ts` is the single source of truth (services, tier bands ≤$2,500 / ≤$5,000 / above, presets, use-case chips). The configurator (`components/marketing/Configurator.tsx`) recomputes quotes client-side; the intake (`/custom-builds/start` → `serverFunctions/handleIntake.tsx`) **recomputes the quote server-side from service ids** — client totals are never trusted — and emails the studio inbox.

## Legacy builder

The pre-overhaul builder (`app/(marketing)/websites/**`, `components/websites/**`, `usedComponents` tables, export/codegen pipeline) is frozen: kept working for Custom Builds delivery, excluded from new-code lint standards, not used by the hosted product. Retire at will.

## Email

`lib/email/transporter.ts` (server-only, recipients from trusted sources) does SMTP. `sendNodeEmail` (client-callable action) is pinned to the studio inbox — never accept a recipient from the client. Tenant notifications (booking confirmations, message alerts) go through `sendEmailInBackground` so SMTP hiccups never break a booking.

## Tests

`npm test` (Vitest, `tests/`): tier-band edges at exactly $2,500/$5,000, discount math, slug normalization/reserved words, booking slot generation + conflict overlap, effective-status transitions. All pure functions — no DB needed.
