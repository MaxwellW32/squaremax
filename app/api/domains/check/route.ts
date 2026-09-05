import { eq } from "drizzle-orm"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { hostToLookupDomain, isPlatformHost } from "@/lib/sites/domains"
import { effectiveStatus, isPubliclyVisible } from "@/lib/sites/status"

//Caddy on-demand TLS "ask" endpoint: 200 = issue a certificate for this
//host, anything else = refuse. Only hosts that belong to a paying, visible
//tenant (or the platform itself) ever get one, so nobody can point a random
//domain at the VPS and burn Let's Encrypt rate limits.
//
//Caddyfile:  on_demand_tls { ask http://localhost:3000/api/domains/check }

export async function GET(request: Request) {
    const domain = new URL(request.url).searchParams.get("domain") ?? ""
    if (domain === "") return new Response("missing domain", { status: 400 })

    if (isPlatformHost(domain)) return new Response("ok", { status: 200 })

    const lookup = hostToLookupDomain(domain)
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.customDomain, lookup) })
    if (tenant === undefined) return new Response("unknown domain", { status: 404 })
    if (!tenant.config.enabledAddons.includes("custom-domain")) return new Response("add-on not enabled", { status: 403 })
    if (!isPubliclyVisible(effectiveStatus(tenant))) return new Response("site not live", { status: 403 })

    return new Response("ok", { status: 200 })
}
