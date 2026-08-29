# Squaremax — what's next

Live follow-ups only. Shipped history is in git; scaling and pricing strategy is in
[GROWTH-PLAN.md](GROWTH-PLAN.md).

## Product

- [ ] **Tenant image uploads** — hero / gallery / product fields still take URLs only. Per GROWTH-PLAN, store on Cloudflare R2 rather than the VPS disk; the old local-disk upload route was removed with the legacy builder.
- [ ] **Cancellation flow** — tenant-initiated cancel → status `cancelled`.
- [ ] **Care Plan self-serve checkout** — reuse `initiateHostedPayment` + a `carePlanPayments` table. `/care-plan` currently just emails.
- [ ] **Remaining add-ons** — gallery upload UI, reviews, analytics.

## Operations

- [ ] **Renewal reminder emails** — system cron hitting a small authed route; email tenants whose period ends within 5 days. Grace window (7 days) + dashboard banner covers it until then. See DEPLOY.md.
- [ ] **Caddy `on_demand_tls` ask endpoint** (`/api/domains/check`) + a dashboard field to set `customDomain`. Until it exists, do not run unrestricted on-demand TLS.

## Pricing

- [ ] Consider a Pro band: subtotals $5,001–$6,500 currently pay above itemized value. The "$6,500 flat, minimum" copy covers it, but a Pro tier at $5,500 — or moving the band to >$6,500 — would be fairer.
