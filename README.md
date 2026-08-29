# Squaremax

Two products on one Next.js 16 app:

1. **Squaremax Sites** — hosted business websites at `squaremaxtech.com/{slug}`, $5/month base plus $5/month per add-on (booking, notifications, store & inventory, custom domain). Clients build and edit their own page from a dashboard.
2. **Custom Builds** — bespoke flat-rate development work, sold through a configurator and intake funnel at `/custom-builds`.

## Running it

```bash
npm install
cp .env.example .env.local   # fill it in — lib/env.ts validates at boot and fails loudly
npm run dev                  # http://localhost:3000
```

Set `POWERTRANZ_SIMULATE=1` in `.env.local` so checkout completes without a real gateway.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Vitest suite (pure functions, no DB needed) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run deploy` | `deploy.sh` — pull, install, build, pm2 restart |

Seed the two demo tenants (`/fade-district`, `/pepper-and-thyme`) with
`npx tsx scripts/seedDemoTenants.ts` — idempotent.

## Where things live

| Path | |
|---|---|
| `app/(marketing)/**` | Marketing site, contact, client dashboard, admin — everything wearing the Squaremax header/footer |
| `app/[businessSlug]/**` | A client's public hosted site (+ `/account`, their own customer portal) |
| `app/domains/[domain]/**` | The same pages served over a client's custom domain (`proxy.ts` rewrites by Host) |
| `lib/sites/**` | The hosted-site engine: content schemas, themes, variant registry, templates, billing status |
| `components/sites/**` | Section variants, the dashboard editor, and the public-page islands |
| `db/schema.ts` | Drizzle schema — `drizzle/*.sql` holds hand-written additive migrations, applied manually |

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing the hosted-site engine — the instance
model and the caching rules are load-bearing. [DEPLOY.md](DEPLOY.md) covers the VPS, Caddy and
backups; [GROWTH-PLAN.md](GROWTH-PLAN.md) covers scaling and pricing as clients arrive.
