"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { checkCustomDomainDns, clearCustomDomain, setCustomDomain } from "@/serverFunctions/handleDomains"

//============================================================
// Custom-domain settings: connect yourbusiness.com, see exactly
// which DNS record to create, and check whether it has landed.
//============================================================

export default function DomainCard(props: {
    tenantId: string
    slug: string
    enabled: boolean
    initialDomain: string | null
    aRecord: string | null
    onEnableAddon: () => void
}) {
    const [domain, domainSet] = useState<string | null>(props.initialDomain)
    const [draft, draftSet] = useState("")
    const [busy, busySet] = useState(false)
    const [dns, dnsSet] = useState<{ records: string[]; pointing: boolean | null } | null>(null)

    const run = async (work: () => Promise<unknown>, success?: string) => {
        if (busy) return
        busySet(true)
        try {
            await work()
            if (success !== undefined) toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    if (!props.enabled) {
        return (
            <div className="grid gap-2 rounded-xl border border-line bg-surface p-5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-mist">Custom domain</p>
                <p className="text-mist">
                    Right now your site lives at <span className="font-mono text-ink">squaremaxtech.com/{props.slug}</span>. With the Custom domain add-on it
                    can live at <span className="font-mono text-ink">yourbusiness.com</span> instead — SSL included. You buy the domain (about US$10–15/year from any registrar), we do the rest.
                </p>
                <button type="button" onClick={props.onEnableAddon} className="w-fit rounded-md border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white">
                    Turn on Custom domain — $5/mo
                </button>
            </div>
        )
    }

    return (
        <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-mist">Custom domain</p>

            {domain === null ? (
                <>
                    <p className="text-mist">Enter the domain you own. We&apos;ll show you the one DNS record to add.</p>
                    <div className="flex flex-wrap gap-2">
                        <input className="min-w-0 grow rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm" placeholder="yourbusiness.com"
                            value={draft} onChange={e => draftSet(e.target.value)} inputMode="url" autoCapitalize="none" autoCorrect="off" />
                        <button type="button" disabled={busy || draft.trim() === ""} onClick={() => run(async () => {
                            const result = await setCustomDomain(props.tenantId, draft)
                            domainSet(result.domain)
                            draftSet("")
                        }, "Domain connected — now add the DNS record")}
                            className="rounded-lg bg-cobalt px-4 py-2 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            Connect
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold">{domain}</span>
                        <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cobalt hover:underline">Open ↗</a>
                    </p>

                    <div className="grid gap-2 rounded-lg bg-paper p-3">
                        <p className="font-semibold">At your domain registrar (GoDaddy, Namecheap, Cloudflare…) add:</p>
                        <table className="w-full text-left font-mono text-xs">
                            <thead><tr className="text-mist"><th className="py-1 pr-3 font-semibold">Type</th><th className="py-1 pr-3 font-semibold">Name</th><th className="py-1 font-semibold">Value</th></tr></thead>
                            <tbody>
                                <tr><td className="py-1 pr-3">A</td><td className="py-1 pr-3">@</td><td className="py-1 font-bold">{props.aRecord ?? "the IP address we email you"}</td></tr>
                                <tr><td className="py-1 pr-3">A</td><td className="py-1 pr-3">www</td><td className="py-1 font-bold">{props.aRecord ?? "the same IP address"}</td></tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-mist">DNS changes take anywhere from a few minutes to a day. Your site gets its SSL certificate automatically on the first visit after that.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" disabled={busy} onClick={() => run(async () => {
                            const result = await checkCustomDomainDns(props.tenantId)
                            dnsSet({ records: result.records, pointing: result.pointing })
                        })}
                            className="rounded-md border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white disabled:opacity-50">
                            {busy ? "Checking…" : "Check DNS"}
                        </button>
                        {dns !== null && (
                            <span className={`text-xs font-semibold ${dns.pointing === true ? "text-emerald-700" : dns.pointing === false ? "text-brand" : "text-mist"}`}>
                                {dns.pointing === true ? "✓ Pointing at us — you're live once the certificate issues"
                                    : dns.records.length === 0 ? "No A record found yet — give it a little longer"
                                        : dns.pointing === false ? `Points at ${dns.records.join(", ")} — not us yet`
                                            : `Currently resolves to ${dns.records.join(", ")}`}
                            </span>
                        )}
                        <button type="button" disabled={busy} className="ml-auto text-xs font-semibold text-mist hover:text-brand"
                            onClick={() => {
                                if (!window.confirm(`Disconnect ${domain}? Your site stays live at squaremaxtech.com/${props.slug}.`)) return
                                run(async () => { await clearCustomDomain(props.tenantId); domainSet(null); dnsSet(null) }, "Domain disconnected")
                            }}>
                            Disconnect
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
