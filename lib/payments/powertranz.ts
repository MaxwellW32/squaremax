import { randomUUID } from "crypto";
import { env } from "@/lib/env";

// PowerTranz (First Atlantic Commerce / Fiserv Caribbean) gateway client —
// hosted-page SPI flow, so card data NEVER touches this app:
//   1. POST /api/spi/sale with ExtendedData.HostedPage + MerchantResponseUrl
//      → SpiToken + RedirectData (HTML rendering the hosted card page + 3DS).
//   2. We serve that HTML to the customer (GET /api/pay/session/<token>).
//   3. PowerTranz posts the outcome (incl. SpiToken) from the customer's
//      browser to our MerchantResponseUrl (/api/pay/callback?...).
//   4. We finalize server-side: POST /api/spi/payment with the SpiToken
//      (~5-minute TTL) → Approved / declined. The gateway response — never
//      the callback body — is the source of truth.
//
// Dev without credentials: POWERTRANZ_SIMULATE=1 (refused in production)
// swaps the gateway for an in-app approve/decline page.
// Pattern ported from the cheers project (proven in production).

export const CURRENCY = "usd"; //switch to "jmd" when the merchant account settles in JMD

const CURRENCY_NUMERIC: Record<string, string> = {
    usd: "840",
    jmd: "388",
};

const BASE_URL = env.POWERTRANZ_BASE_URL ?? "https://staging.ptranz.com";

export function appUrl(path: string): string {
    return `${env.SITE_URL}${path}`;
}

export function gatewaySimulated(): boolean {
    return env.POWERTRANZ_SIMULATE === "1" && env.NODE_ENV !== "production";
}

export function gatewayConfigured(): boolean {
    if (gatewaySimulated()) return true;
    return Boolean(env.POWERTRANZ_ID && env.POWERTRANZ_PASSWORD && env.POWERTRANZ_HPP_PAGESET);
}

function authHeaders(): Record<string, string> {
    return {
        "content-type": "application/json",
        accept: "application/json",
        "PowerTranz-PowerTranzId": env.POWERTRANZ_ID ?? "",
        "PowerTranz-PowerTranzPassword": env.POWERTRANZ_PASSWORD ?? "",
    };
}

//PowerTranz amounts are decimal major units, not cents
function decimalAmount(amountCents: number): number {
    return Number((amountCents / 100).toFixed(2));
}

export type GatewayInit = {
    spiToken: string;
    redirectData: string;
    transactionIdentifier: string;
};

//start a hosted-page card payment; orderId is our reference in the portal
export async function initiateHostedPayment(opts: {
    amountCents: number;
    orderId: string;
    responseUrl: string;
}): Promise<GatewayInit> {
    if (gatewaySimulated()) {
        const spiToken = `SIM-${randomUUID()}`;
        return {
            spiToken,
            transactionIdentifier: spiToken,
            redirectData: simulatedGatewayPage(opts, spiToken),
        };
    }

    const transactionIdentifier = randomUUID();
    const res = await fetch(`${BASE_URL}/api/spi/sale`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            TransactionIdentifier: transactionIdentifier,
            TotalAmount: decimalAmount(opts.amountCents),
            CurrencyCode: CURRENCY_NUMERIC[CURRENCY] ?? "840",
            ThreeDSecure: true,
            OrderIdentifier: opts.orderId,
            ExtendedData: {
                MerchantResponseUrl: opts.responseUrl,
                ThreeDSecure: { ChallengeWindowSize: 4, ChallengeIndicator: "01" },
                HostedPage: {
                    PageSet: env.POWERTRANZ_HPP_PAGESET ?? "",
                    PageName: env.POWERTRANZ_HPP_PAGENAME ?? "Default",
                },
            },
        }),
    });
    if (!res.ok) {
        throw new Error(`powertranz sale failed: HTTP ${res.status}`);
    }
    const data: {
        SpiToken?: string;
        RedirectData?: string;
        TransactionIdentifier?: string;
        Errors?: { Message?: string }[];
    } = await res.json();
    if (!data.SpiToken || !data.RedirectData) {
        throw new Error(`powertranz sale rejected: ${data.Errors?.[0]?.Message ?? "no SpiToken/RedirectData"}`);
    }
    return {
        spiToken: data.SpiToken,
        redirectData: data.RedirectData,
        transactionIdentifier: data.TransactionIdentifier ?? transactionIdentifier,
    };
}

//second SPI step after the callback: finalize with the SpiToken. No merchant
//auth headers — the token IS the authorization. Never throws: network errors
//come back as not-approved so the caller can't 500 mid-3DS.
export async function completeGatewayPayment(spiToken: string): Promise<{
    approved: boolean;
    transactionId: string | null;
    orderIdentifier: string | null;
    message: string;
}> {
    try {
        const res = await fetch(`${BASE_URL}/api/spi/payment`, {
            method: "POST",
            headers: { "content-type": "application/json", accept: "application/json" },
            body: JSON.stringify(spiToken),
        });
        if (!res.ok) {
            return { approved: false, transactionId: null, orderIdentifier: null, message: `HTTP ${res.status}` };
        }
        const data: {
            Approved?: boolean;
            IsoResponseCode?: string;
            ResponseMessage?: string;
            TransactionIdentifier?: string;
            OrderIdentifier?: string;
        } = await res.json();
        return {
            approved: data.Approved === true && data.IsoResponseCode === "00",
            transactionId: data.TransactionIdentifier ?? null,
            orderIdentifier: data.OrderIdentifier ?? null,
            message: data.ResponseMessage ?? data.IsoResponseCode ?? "unknown",
        };
    } catch (error) {
        return { approved: false, transactionId: null, orderIdentifier: null, message: error instanceof Error ? error.message : "network error" };
    }
}

//refund a settled transaction (full amount as used here); true = accepted
export async function refundGatewayPayment(transactionId: string, amountCents: number): Promise<boolean> {
    if (gatewaySimulated() || transactionId.startsWith("SIM-")) return true;
    try {
        const res = await fetch(`${BASE_URL}/api/refund`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                TransactionIdentifier: transactionId,
                TotalAmount: decimalAmount(amountCents),
                CurrencyCode: CURRENCY_NUMERIC[CURRENCY] ?? "840",
            }),
        });
        if (!res.ok) return false;
        const data: { Approved?: boolean; IsoResponseCode?: string } = await res.json();
        return data.Approved === true;
    } catch (error) {
        console.error("powertranz refund failed:", error instanceof Error ? error.message : error);
        return false;
    }
}

// ---------------------------------------------------------------------------
// Redirect-page hand-off: server actions can only return JSON, so the
// RedirectData HTML is parked here (single long-running node process) and
// served by GET /api/pay/session/<token>.
// ---------------------------------------------------------------------------

const REDIRECT_TTL_MS = 15 * 60_000;

const globalStore = globalThis as unknown as {
    __payRedirects?: Map<string, { html: string; expires: number }>;
};
const redirects = (globalStore.__payRedirects ??= new Map<string, { html: string; expires: number }>());

export function storeRedirectPage(html: string): string {
    const now = Date.now();
    for (const [key, entry] of redirects) {
        if (entry.expires < now) redirects.delete(key);
    }
    const token = randomUUID();
    redirects.set(token, { html, expires: now + REDIRECT_TTL_MS });
    return token;
}

export function getRedirectPage(token: string): string | null {
    const entry = redirects.get(token);
    if (!entry || entry.expires < Date.now()) return null;
    return entry.html;
}

//dev-only stand-in for the hosted page: approve/decline buttons that post
//back to the callback exactly like the real gateway would
function simulatedGatewayPage(
    opts: { amountCents: number; orderId: string; responseUrl: string },
    spiToken: string
): string {
    const amount = `$${(opts.amountCents / 100).toFixed(2)}`;
    return `<!doctype html><html><head><title>Simulated gateway</title></head>
<body style="font-family:sans-serif;background:#111;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;">
<div style="max-width:420px;padding:32px;border:1px solid #444;border-radius:12px;">
  <h2 style="margin:0 0 8px;">Simulated PowerTranz page</h2>
  <p style="color:#aaa;">POWERTRANZ_SIMULATE=1 — no real gateway involved.</p>
  <p>Order <strong>${opts.orderId}</strong> · Amount <strong>${amount}</strong></p>
  <form method="POST" action="${opts.responseUrl}" style="display:inline">
    <input type="hidden" name="SpiToken" value="${spiToken}" />
    <input type="hidden" name="SimApproved" value="1" />
    <button type="submit" style="padding:10px 22px;background:#2e7d32;color:#fff;border:0;border-radius:8px;cursor:pointer;">Approve payment</button>
  </form>
  <form method="POST" action="${opts.responseUrl}" style="display:inline;margin-left:8px;">
    <input type="hidden" name="SpiToken" value="${spiToken}" />
    <input type="hidden" name="SimApproved" value="0" />
    <button type="submit" style="padding:10px 22px;background:#c62828;color:#fff;border:0;border-radius:8px;cursor:pointer;">Decline</button>
  </form>
</div></body></html>`;
}
