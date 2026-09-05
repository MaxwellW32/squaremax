# Squaremax

Two products on one Next.js 16 app:

1. **Squaremax Sites** — hosted business websites at `squaremaxtech.com/{slug}` for small businesses (Jamaica first): US$10/month for the site, US$5 per tool (online booking, notifications, online store & orders, custom domain), bundles at US$15 / US$20, a year for the price of ten months. Clients build and run everything from a phone-friendly dashboard.
2. **Custom Builds** — bespoke flat-rate development work, sold through a configurator and intake funnel at `/custom-builds`.

## Running it

```bash
npm install
cp .env.example .env.local   # fill it in — lib/env.ts validates at boot and fails loudly
npm run dev                  # http://localhost:3000
```

Set `POWERTRANZ_SIMULATE=1` in `.env.local` so checkout completes without a real gateway. Sign-in is by email magic link (SMTP settings), so any address works locally as long as SMTP is configured.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Vitest suite (pure functions, no DB needed) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run deploy` | `deploy.sh` — pull, install, build, pm2 restart |

Apply `drizzle/*.sql` in order on a fresh database (see DEPLOY.md), then seed the two demo tenants (`/fade-district`, `/pepper-and-thyme`) with `npx tsx scripts/seedDemoTenants.ts` — idempotent.

## Where things live

| Path | |
|---|---|
| `app/(marketing)/**` | Marketing site, pricing, sign-in, contact, client dashboard, admin — everything wearing the Squaremax header/footer |
| `app/[businessSlug]/**` | A client's public hosted site (+ `/account`, their own customer portal) |
| `app/domains/[domain]/**` | The same pages served over a client's custom domain (`proxy.ts` rewrites by Host) |
| `app/api/**` | Payment callback, renewal cron, Caddy domain check, local upload serving |
| `lib/sites/**` | The hosted-site engine: pricing, content schemas, themes, variant registry, templates, billing, receipt math, orders |
| `components/sites/**` | Section variants, the dashboard, the shop/booking/account islands |
| `db/schema.ts` | Drizzle schema — `drizzle/*.sql` holds hand-written additive migrations, applied manually |

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing the hosted-site engine — the instance
model and the caching rules are load-bearing. [DEPLOY.md](DEPLOY.md) covers the VPS, Caddy, cron and
backups; [GROWTH-PLAN.md](GROWTH-PLAN.md) covers scaling and pricing; [MARKETING-PLAN.md](MARKETING-PLAN.md)
covers how to find the first hundred clients; [TODO.md](TODO.md) is what's next.
