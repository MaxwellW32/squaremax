# Deploying Squaremax to the VPS

Stack on the box: Node 20+ (24 recommended), Postgres, Caddy (reverse proxy + TLS), pm2 (process manager).

## Environment

Copy `.env.example` → `.env.local` next to the app and fill everything in. `lib/env.ts` validates at boot and fails loudly on misconfig. Production notes:

- `AUTH_URL` — unset in production behind Caddy (Auth.js infers), keep `AUTH_TRUST_HOST=true`.
- `SITE_URL=https://squaremaxtech.com` — used for payment callbacks, QR codes, emails, upload URLs.
- `POWERTRANZ_*` — production credentials + production base URL from FAC. Never set `POWERTRANZ_SIMULATE` in production (the code refuses it, but don't). If the merchant account settles in JMD, set `POWERTRANZ_CURRENCY=jmd`. The site quotes USD; the gateway is charged the converted amount and both figures are stored on the payment row. The USD→JMD rate is fetched once per Jamaica calendar day (open.er-api.com), `JMD_RATE_MARGIN_PERCENT` (default 3) is added and the result rounded up to a whole J$. Set `JMD_PER_USD` only if you want to pin the rate by hand.
- `CRON_SECRET` — any long random string; the renewal-reminder cron below sends it as a bearer token.
- `CUSTOM_DOMAIN_A_RECORD` — the VPS's public IP. Shown to clients in the Plan tab as the A record to create, and used by the "Check DNS" button.
- `R2_*` — Cloudflare R2 bucket for uploads. Leave all five unset and uploads land on local disk in `userUploadedData/` (gitignored), served by `/api/uploads/…`. Fine for the first clients; move to R2 before images become a backup problem (GROWTH-PLAN §2).
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` — ad measurement on the marketing site only.
- Sign-in is email magic links via the SMTP settings; `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` are optional and only add buttons when present.

## Build & run

```bash
git pull
npm ci
npm run build          # next build (Turbopack)
pm2 startOrRestart ecosystem.config.js   # supervises `next start` directly
pm2 save
```

`ecosystem.config.js` runs the Next binary on port 3000. **Run exactly one instance** (`exec_mode: fork`, not cluster): the payment redirect-page store is in-process memory.

### Zero-downtime-ish deploys

`next build` builds into `.next` while the old process keeps serving; the pm2 restart gap is sub-second. For true zero downtime later: build into a fresh release dir and flip a symlink before `pm2 reload`.

## Caddy (reverse proxy + custom domains)

```caddy
{
    # tenant domains get certificates automatically, but only after the app
    # confirms the host belongs to a paying, visible tenant
    on_demand_tls {
        ask http://localhost:3000/api/domains/check
    }
}

squaremaxtech.com, www.squaremaxtech.com {
    reverse_proxy localhost:3000
}

# tenant custom domains — cert issued on first request, on demand
https:// {
    tls {
        on_demand
    }
    reverse_proxy localhost:3000
}
```

Flow: the owner connects `joesbarber.com` in the Plan tab → they add an A record for `@` and `www` pointing at `CUSTOM_DOMAIN_A_RECORD` → on the first visit Caddy asks `/api/domains/check?domain=joesbarber.com` (200 only for a known tenant with the add-on on and a live site), issues the cert, and proxies with the tenant's `Host` → `proxy.ts` rewrites to `/domains/{host}` → the site renders with `basePath=""`. `www.` is normalised to the apex everywhere, so both hosts serve the same site.

## Postgres backups

Nightly dump + 14-day retention (crontab on the VPS):

```bash
# /etc/cron.d/squaremax-backup
0 3 * * * postgres pg_dump squaremax | gzip > /var/backups/squaremax/$(date +\%F).sql.gz
15 3 * * * root find /var/backups/squaremax -mtime +14 -delete
```

If uploads are on local disk, back up `userUploadedData/` too (rsync to the same off-box target). With R2 the bucket is the backup.

Restore drill: `gunzip -c FILE | psql squaremax_restore` against a scratch DB, spot-check `tenants`.

## Renewal reminders (daily cron)

Subscriptions are prepaid and never auto-charged; the app never runs its own scheduler. A system cron calls the reminder route once a day and the app emails owners whose period ends within 5 days, then once more when a period has lapsed into the 7-day grace window. Each email is sent exactly once per period (the tenant row remembers which period end it covered).

```bash
# /etc/cron.d/squaremax-renewals   (CRON_SECRET from .env.local)
30 9 * * * root curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://squaremaxtech.com/api/cron/renewals >> /var/log/squaremax-renewals.log 2>&1
```

The route answers with `{ checked, reminded, lapsed, failures }` so the log doubles as a receipt.

## Migrations

Schema lives in `db/schema.ts` (Drizzle). New DDL goes in `drizzle/*.sql` as **additive, idempotent** files, applied inside a transaction:

```bash
node --env-file=.env.local -e "
const {Pool}=require('pg');const fs=require('fs');
const p=new Pool({connectionString:process.env.DATABASE_URL});
(async()=>{const c=await p.connect();await c.query('begin');
await c.query(fs.readFileSync('drizzle/0005_orders_media_reminders.sql','utf8'));
await c.query('commit');c.release();await p.end();console.log('ok')})()"
```

(`drizzle-kit push` works interactively on the VPS too — it needs a TTY.)

## Smoke checklist after each deploy

1. `/` renders, `/pricing` shows three plan cards with the current prices.
2. `/signin` renders; requesting a magic link delivers an email.
3. `/fade-district` renders with the booking panel; `/pepper-and-thyme` shows the shop with an order form (seeded demos — `npx tsx scripts/seedDemoTenants.ts`).
4. `/sites/start` walks to the payment step (simulate off in prod: expect the real hosted page).
5. `POST /api/pay/callback` replay of an old payment does NOT extend a period (CAS guard).
6. `curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/renewals` returns JSON, not 401/503.
7. `curl "/api/domains/check?domain=squaremaxtech.com"` → 200; an unknown domain → 404.
8. `pm2 logs squaremax --lines 50` clean.
