# Deploying Squaremax to the VPS

Stack on the box: Node 20+ (24 recommended), Postgres, Caddy (reverse proxy + TLS), pm2 (process manager).

## Environment

Copy `.env.example` → `.env.local` next to the app and fill everything in. `lib/env.ts` validates at boot and fails loudly on misconfig. Production notes:

- `AUTH_URL` — unset in production behind Caddy (Auth.js infers), keep `AUTH_TRUST_HOST=true`.
- `SITE_URL=https://squaremaxtech.com` — used for payment callbacks, QR codes, emails.
- `POWERTRANZ_*` — production credentials + production base URL from FAC. Never set `POWERTRANZ_SIMULATE` in production (the code refuses it, but don't).

## Build & run

```bash
git pull
npm ci
npm run build          # next build (Turbopack)
pm2 restart squaremax  # first time: pm2 start server.js --name squaremax
pm2 save
```

`server.js` serves Next + the `ws` websocket endpoint on port 3000. **Run exactly one instance** (`exec_mode: fork`, not cluster): the payment redirect-page store and ws rooms are in-process memory.

### Zero-downtime-ish deploys

`next build` builds into `.next` while the old process keeps serving; the pm2 restart gap is sub-second. For true zero downtime later: build into a fresh release dir and flip a symlink before `pm2 reload`.

## Caddy (reverse proxy + custom domains)

```caddy
{
    # allow tenant domains to get certs automatically after a DB check
    on_demand_tls {
        ask http://localhost:3000/api/domains/check   # TODO: small route that 200s when the Host is a known tenant customDomain
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

Flow: tenant points an A record at the VPS → Caddy issues a cert on demand → request hits the app with the tenant's `Host` header → `proxy.ts` rewrites to `/domains/{host}` → tenant page renders. Until the `ask` endpoint exists, restrict `on_demand_tls` to domains you've added manually (Caddy docs: on_demand_tls permission) — never run unrestricted on-demand TLS on the open internet.

## Postgres backups

Nightly dump + 14-day retention (crontab on the VPS):

```bash
# /etc/cron.d/squaremax-backup
0 3 * * * postgres pg_dump squaremax | gzip > /var/backups/squaremax/$(date +\%F).sql.gz
15 3 * * * root find /var/backups/squaremax -mtime +14 -delete
```

Restore drill: `gunzip -c FILE | psql squaremax_restore` against a scratch DB, spot-check `tenants`.

## Migrations

Schema lives in `db/schema.ts` (Drizzle). New DDL goes in `drizzle/*.sql` as **additive, idempotent** files, applied inside a transaction:

```bash
node --env-file=.env.local -e "…see drizzle/0001 apply pattern in git history…"
```

(`drizzle-kit push` works interactively on the VPS too — it needs a TTY.)

## Renewal reminders (no in-app cron by design)

Tenant status is computed from `currentPeriodEnd` at request time; nothing breaks without cron. To send "renew soon" emails, add a system cron that hits a small authed route (or a script) daily — it should email tenants whose period ends within 5 days. Until then, the grace window (7 days) plus the dashboard banner covers it.

## Smoke checklist after each deploy

1. `/` renders, configurator totals move.
2. `/fade-district` renders with booking panel (seeded demo).
3. `/sites/start` walks to the payment step (simulate off in prod: expect the real hosted page).
4. `POST /api/pay/callback` replay of an old payment does NOT extend a period (CAS guard).
5. `pm2 logs squaremax --lines 50` clean.
