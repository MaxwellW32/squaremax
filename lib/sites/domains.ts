//============================================================
// Custom-domain helpers (pure). A tenant connects an apex like
// "joesbarber.com"; requests for "www.joesbarber.com" resolve to
// the same site. The platform's own hosts can never be claimed.
//============================================================

export const PLATFORM_HOSTS = new Set([
    "squaremaxtech.com",
    "www.squaremaxtech.com",
    "localhost",
    "127.0.0.1",
])

const hostnamePattern = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/

//what a tenant typed -> the apex/subdomain we store
export function normalizeDomain(input: string): { ok: true; domain: string } | { ok: false; error: string } {
    let value = input.trim().toLowerCase()
    value = value.replace(/^[a-z]+:\/\//, "") //https://
    value = value.split("/")[0] ?? "" //trailing path
    value = value.split(":")[0] ?? "" //port
    value = value.replace(/^www\./, "")
    value = value.replace(/\.$/, "")

    if (value === "") return { ok: false, error: "enter your domain, like yourbusiness.com" }
    if (!hostnamePattern.test(value)) return { ok: false, error: "that doesn't look like a domain — try yourbusiness.com" }
    if (PLATFORM_HOSTS.has(value) || value.endsWith(".squaremaxtech.com")) return { ok: false, error: "that domain belongs to Squaremax" }
    return { ok: true, domain: value }
}

//an incoming Host header -> the stored domain to look up
export function hostToLookupDomain(host: string): string {
    return host.trim().toLowerCase().split(":")[0].replace(/^www\./, "").replace(/\.$/, "").slice(0, 255)
}

export function isPlatformHost(host: string): boolean {
    const bare = host.trim().toLowerCase().split(":")[0]
    return PLATFORM_HOSTS.has(bare)
}
