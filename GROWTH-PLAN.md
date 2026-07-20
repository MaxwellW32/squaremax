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

### Now (launch pricing — validate the market)
- Website **$5/mo**, each add-on (booking, notifications, store & inventory,
  custom domain) **+$5/mo**.
- **Grandfather every early client at this price forever.** It costs you almost
  nothing and becomes your loyalty story.

### Target list pricing (after the first wave, ~50–100 clients)
Market anchors: Squarespace $16–23, Wix $17+, Fresha/Booksy $30+ for booking alone.

| Offer | Price | What's in it |
|---|---|---|
| Website | **$10/mo** | Site, hosting, SSL, up to 5 pages |
| Any single add-on | **+$5/mo** | Booking, notifications, store, domain |
| **Service bundle** ⭐ | **$15/mo** | Website + booking + notifications |
| **Storefront bundle** | **$20/mo** | Everything |
| Annual prepay | **2 months free** | Better cash flow for you |

Bundles are the real product — they raise average revenue and make choosing easy.
Push the Service bundle as the default recommendation.

### One-time fees
- **No mandatory signup/onboarding fee** — it kills self-serve conversion on a
  low-monthly product.
- **Concierge setup — $75–100 one-time (optional):** "Send us your menu, photos
  and hours — we build your site for you." Same revenue, framed as a service
  people happily pay for.

### Transaction fee on product sales
- **Not yet.** Today customers order via WhatsApp and owners record sales
  themselves — you can't collect a fee on money you never touch, and taxing the
  *recording* of sales discourages using the feature that makes clients sticky.
- **When you add online checkout** for their customers (PowerTranz payouts):
  charge **2% on payments processed through the platform** (undercuts Shopify's
  ~2.9%). Never a fee on cash/counter sales they merely record.

---

## 6. Order of build priorities (each unlocks revenue)

1. **Image uploads in the editor** (R2 + CDN) → makes galleries/logos real,
   unlocks the Growth pack.
2. **Online checkout for tenant customers** → unlocks the 2% transaction fee.
3. **Reviews & analytics add-ons** (already stubbed as coming-soon) → two more
   $5 modules with near-zero infra cost.
4. Annual billing + concierge setup offer in the onboarding flow.

---

## 7. Non-negotiables as you grow

- Nightly off-box database backups, tested restore once a quarter.
- Keep the prepaid-period billing model (no cron, no surprise charges) — it's
  simple and it works.
- Every price change: grandfather existing clients, announce, never mid-cycle.
- Support is your real cost. Bundles and good defaults (templates, placeholders,
  concierge setup) exist to keep support tickets low.
