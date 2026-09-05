"use server"
import { promises as dns } from "node:dns"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { tenants } from "@/db/schema"
import { env } from "@/lib/env"
import { normalizeDomain } from "@/lib/sites/domains"
import { bustTenant, getOwnedTenant } from "@/lib/sites/owner"

//============================================================
// Custom-domain add-on (owner-gated): connect yourbusiness.com
// to the tenant. DNS is the client's job (an A record at the
// VPS); Caddy issues the certificate on the first request after
// asking /api/domains/check whether the host is ours.
//============================================================

export type DomainStatus = {
    domain: string | null
    aRecord: string | null //what clients should point at (env)
}

export async function getDomainStatus(tenantId: string): Promise<DomainStatus> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    return { domain: tenant.customDomain, aRecord: env.CUSTOM_DOMAIN_A_RECORD ?? null }
}

export async function setCustomDomain(tenantId: string, domainRaw: string): Promise<{ domain: string }> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    if (!tenant.config.enabledAddons.includes("custom-domain")) throw new Error("turn on the Custom domain add-on first")

    const normalized = normalizeDomain(z.string().max(300).parse(domainRaw))
    if (!normalized.ok) throw new Error(normalized.error)

    const clash = await db.query.tenants.findFirst({ where: eq(tenants.customDomain, normalized.domain) })
    if (clash !== undefined && clash.id !== tenant.id) throw new Error("that domain is already connected to another site")

    try {
        await db.update(tenants).set({ customDomain: normalized.domain, updatedAt: new Date() }).where(eq(tenants.id, tenant.id))
    } catch (error) {
        const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined
        const pgCode = typeof cause === "object" && cause !== null && "code" in cause ? (cause as { code?: unknown }).code : undefined
        if (pgCode === "23505") throw new Error("that domain is already connected to another site")
        throw error
    }

    //both the old domain's pages and the new one's must refresh
    bustTenant(tenant.slug, tenant.customDomain)
    bustTenant(tenant.slug, normalized.domain)
    return { domain: normalized.domain }
}

export async function clearCustomDomain(tenantId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    await db.update(tenants).set({ customDomain: null, updatedAt: new Date() }).where(eq(tenants.id, tenant.id))
    bustTenant(tenant.slug, tenant.customDomain)
    return { ok: true }
}

//a live DNS lookup so the owner can see whether their A record has landed
export async function checkCustomDomainDns(tenantId: string): Promise<{ domain: string; records: string[]; expected: string | null; pointing: boolean | null }> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    if (tenant.customDomain === null) throw new Error("no domain connected yet")

    let records: string[] = []
    try {
        records = await dns.resolve4(tenant.customDomain)
    } catch {
        records = []
    }

    const expected = env.CUSTOM_DOMAIN_A_RECORD ?? null
    return {
        domain: tenant.customDomain,
        records,
        expected,
        pointing: expected === null ? (records.length > 0 ? null : false) : records.includes(expected),
    }
}
