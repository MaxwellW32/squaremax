# Squaremax — what's next

Live follow-ups only. Shipped history is in git; scaling and pricing strategy is in
[GROWTH-PLAN.md](GROWTH-PLAN.md); go-to-market is in [MARKETING-PLAN.md](MARKETING-PLAN.md).

## Before launch (needs Max)

- [ ] **PowerTranz merchant account** — apply via NCB/Scotia/FAC. Decide USD vs JMD settlement; set `POWERTRANZ_CURRENCY` (+ `JMD_PER_USD`) accordingly. Test the full pay → callback → period-extension flow on staging credentials before going live.
- [ ] **Production env** — `CRON_SECRET`, `CUSTOM_DOMAIN_A_RECORD` (the VPS IP), R2 credentials (or accept local-disk uploads for the first clients), GA4 + Meta pixel ids.
- [ ] **Apply migration** `drizzle/0005_orders_media_reminders.sql` on the VPS; run the seed to refresh the demo tenants.
- [ ] **Daily cron** for `/api/cron/renewals` (see DEPLOY.md) and the Caddy `on_demand_tls` ask endpoint (`/api/domains/check`) — both are built, both need the server-side wiring.
- [ ] **Real photos on the demo sites** — replace the placeholder images so screenshots sell.

## Product

- [ ] **Online card payments for tenant orders** — Phase 2 of selling: each tenant connects their *own* PowerTranz (or WiPay) merchant credentials in the dashboard; the order form charges the card on their account, Squaremax takes no cut, and the tool is priced as a flat "Online payments" add-on. Orders → sales linkage already exists, so this slots in as an alternative to "Mark paid".
- [ ] **Closed dates for booking** (holidays) — availability is weekly only.
- [ ] **Per-trade landing pages** — `/for/barbers`, `/for/restaurants`, `/for/salons` (MARKETING-PLAN §2D).
- [ ] **Reviews & analytics add-ons** — still stubbed as coming-soon.
- [ ] **Cancellation / delete-site flow** — owners can take a site offline; a true delete (with export) is manual.
- [ ] **Care Plan self-serve checkout** — reuse `initiateHostedPayment`; `/care-plan` still just emails.
- [ ] **Intake persistence** — custom-build intakes are emailed only.

## Nice to have

- [ ] Media library management (delete uploads from a Media tab; today only via the picker's ledger).
- [ ] Custom CSS: `>` inside a `<style>` child is escaped by React — child combinators in per-component CSS don't work. Low impact; document or switch to a sanitised raw render.
- [ ] Pro band for custom builds: subtotals $5,001–$6,500 currently pay above itemized value.
