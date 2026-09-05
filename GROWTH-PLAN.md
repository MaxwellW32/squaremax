# Squaremax Growth Game Plan

Plain-English playbook for hosting, scaling, and pricing as the client base grows.
Written 2026-07-20. Revisit at every milestone marked ✦.

---

## 1. Hosting — what to run today

**One VPS is enough for your first few hundred clients.**

| Item | Pick | Cost (approx) |
|---|---|---|
| VPS | 2 vCPU / 4 GB RAM / 80 GB NVMe (Hetzner CPX21/31, DigitalOcean, or Vultr) | US$15–25/mo |
| Region | **US East (Ashburn/New York)** — best latency to Jamaica | — |
| Web entry | Caddy in front of the app (already the design; handles custom-domain TLS) | $0 |
| Database | Postgres on the same box | $0 |
| Backups | Nightly `pg_dump` shipped OFF the box to Backblaze B2 | ~$1/mo |
| Monitoring | UptimeRobot (free tier) pinging squaremaxtech.com + one tenant page | $0 |

**Why this works:** tenant pages are cached server-renders that only refresh when the
owner saves — so serving a client site costs almost nothing. A client's whole site
(pages + components + settings) is a few kilobytes of database text. 1,000 clients
is still under 1 GB of data.

---

## 2. The three things that actually grow

Watch these; nothing else will surprise you.

1. **Images / media** (the big one, once uploads ship)
   - Never store client images on the VPS disk.
   - Use **Cloudflare R2** for storage (no fees when images are viewed) with
     Cloudflare's free CDN in front of squaremaxtech.com.
2. **Emails sent** (announcement blasts multiply fast)
   - Hostinger SMTP is fine for booking confirmations.
   - Move announcement blasts to **Resend or Amazon SES** and cap each client
     per month (see pricing packs below).
3. **The database** (last to matter)
   - Only becomes a topic around ~2,000 clients.

---

## 3. Scaling stages — do nothing early

| ✦ Milestone | Action | Rough cost |
|---|---|---|
| 0–300 clients | Nothing. One 4 GB VPS handles it. | $25/mo |
| ~300–500 clients | Resize VPS to 4 vCPU / 8 GB (one click, minutes of downtime). Add R2 + CDN if not done. | $50/mo |
| ~1,000 clients | Resize to 8–16 GB. Move email blasts to SES/Resend if not done. | $80–120/mo |
| ~2,000 clients | Move Postgres to its own box or managed Postgres. | +$50–100/mo |
| Beyond | Second app server behind Caddy. You'll have the revenue to hire help by then. | — |

**Reality check:** 500 clients averaging US$10/mo = ~$5,000/mo revenue against
under $100/mo of infrastructure. The economics are extremely forgiving — never
pre-buy capacity.

---

## 4. Charging clients for growth (storage / email / traffic)

Meter only what costs you money — **media storage** and **emails sent** — and sell
them as fixed packs, never surprise metered bills (small businesses hate variable
invoices).

- **Included in every site:** 500 MB media + 1,000 emails/mo.
- **Growth pack — +$5/mo:** +2 GB media, +5,000 emails/mo. Stackable.
- Traffic/bandwidth: don't charge for it. The CDN makes it near-free; a client
  going viral is a success story, not a cost problem.

---

## 5. Pricing plan

### Live list pricing (implemented 2026-09-04, `lib/sites/addons.ts`)
Market anchors: Squarespace $16–23, Wix $17+, Fresha/Booksy $30+ for booking alone.

| Offer | Price | What's in it |
|---|---|---|
| Website | **US$10/mo** | Site, hosting, SSL, up to 5 pages, contact form, customer accounts |
| Any single add-on | **+US$5/mo** | Booking, notifications, store & orders, domain |
| **Service bundle** ⭐ | **US$15/mo** | Website + booking + notifications |
| **Storefront bundle** | **US$20/mo** | Everything |
| Annual prepay | **2 months free** | 12 months charged as 10 (`lib/sites/billing.ts`) |

Bundles are never chosen — `priceQuote()` always charges the cheapest price
the enabled add-ons qualify for, so a client can switch tools on and off and
the bill simply follows. Bundles are the real product: they raise average
revenue and make choosing easy. The Service bundle is marked "most popular".

Why we skipped the $5 launch price: there were no paying clients to
grandfather, $5 signals "toy", gateway fixed fees eat ~10% of a $5 charge, and
support cost per client is the same at $5 and $10. The founding-member lever is
**free concierge setup + a free month on a 3-month prepay** (MARKETING-PLAN §1),
not a permanently lower list price.

### If prices ever change
Grandfather existing clients, announce, never mid-cycle — the numbers live in
one file and the payment row snapshots the add-ons charged.

### One-time fees
- **No mandatory signup/onboarding fee** — it kills self-serve conversion on a
  low-monthly product.
- **Concierge setup — $75–100 one-time (optional):** "Send us your menu, photos
  and hours — we build your site for you." Same revenue, framed as a service
  people happily pay for.

### Selling from client stores — the plan
- **Now (shipped):** customers order from the site (cart + order form); the
  business gets the order in the dashboard, by email, and as a pre-filled
  WhatsApp thread; payment happens on pickup / bank transfer / Lynk / card
  machine; "Mark paid" turns the order into a sale (stock + reports). Zero
  fees, zero regulatory exposure, matches how Jamaican customers already buy.
- **Next: bring-your-own gateway.** Each business connects its *own* PowerTranz
  (or WiPay) merchant account in the dashboard and the order form charges the
  card on their account. Squaremax never touches the money — no FAC aggregator
  approval, no payout accounting, no chargeback liability — and sells it as a
  flat **"Online payments" add-on (US$10/mo)** instead of a percentage. Flat
  fees fit the "no surprise bills" promise better than 2%.
- **Only if volume justifies it:** Squaremax as a platform merchant with FAC's
  blessing, taking 2% and paying out. Real compliance work; not before ~100
  stores are actually transacting.
- Never a fee on cash/counter sales a business merely records.

---

## 6. Order of build priorities (each unlocks revenue)

1. ~~Image uploads in the editor~~ — shipped (R2 or local disk, WebP, 500 MB quota).
2. ~~Online orders for tenant customers~~ — shipped (order form → dashboard → sale).
3. ~~Annual billing, bundles, renewal reminders, custom-domain setup~~ — shipped.
4. **Bring-your-own-gateway card payments** for tenant orders (see §5).
5. **Reviews & analytics add-ons** (stubbed as coming-soon) → two more $5
   modules with near-zero infra cost.
6. Per-trade landing pages + concierge setup checkout (MARKETING-PLAN).

---

## 7. Non-negotiables as you grow

- Nightly off-box database backups, tested restore once a quarter.
- Keep the prepaid-period billing model (no cron, no surprise charges) — it's
  simple and it works.
- Every price change: grandfather existing clients, announce, never mid-cycle.
- Support is your real cost. Bundles and good defaults (templates, placeholders,
  concierge setup) exist to keep support tickets low.
