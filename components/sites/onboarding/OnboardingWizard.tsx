"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import TenantSite from "@/components/sites/TenantSite"
import { SiteContent, defaultSiteContent, siteContentSchema, SectionType } from "@/lib/sites/content"
import { SiteConfig, defaultSiteConfig } from "@/lib/sites/config"
import { compositions } from "@/lib/sites/compositions"
import { themes } from "@/lib/sites/themes"
import { variantsById, variantsForSection } from "@/lib/sites/registry"
import { addons, BASE_MONTHLY_PRICE, monthlyTotal, AddonId } from "@/lib/sites/addons"
import { checkSlugAvailability, createDraftTenant, updateTenantConfig, updateTenantContent } from "@/serverFunctions/handleTenants"
import { startTenantCheckout } from "@/serverFunctions/handleTenantBilling"

const steps = ["Claim your name", "Your business", "Pick your look", "Add-ons", "Go live"] as const

type ResumeTenant = {
    id: string
    slug: string
    content: SiteContent
    config: SiteConfig
}

export default function OnboardingWizard({ signedIn, resumeTenant, cancelled, initialName }: {
    signedIn: boolean
    resumeTenant: ResumeTenant | null
    cancelled: boolean
    initialName?: string
}) {
    const [step, stepSet] = useState(resumeTenant !== null ? 1 : 0)
    const [busy, busySet] = useState(false)

    //step 0 (initialName survives the sign-in round trip via the callback url)
    const [businessName, businessNameSet] = useState(resumeTenant?.content.business.name ?? initialName ?? "")
    const [slugInfo, slugInfoSet] = useState<{ slug: string; available: boolean; reason?: string } | null>(null)
    const [checkingSlug, checkingSlugSet] = useState(false)
    const slugDebounce = useRef<NodeJS.Timeout | undefined>(undefined)
    const slugRequestId = useRef(0)

    //draft tenant
    const [tenantId, tenantIdSet] = useState<string | null>(resumeTenant?.id ?? null)
    const [tenantSlug, tenantSlugSet] = useState<string | null>(resumeTenant?.slug ?? null)
    const [content, contentSet] = useState<SiteContent>(resumeTenant?.content ?? defaultSiteContent(""))
    const [config, configSet] = useState<SiteConfig>(resumeTenant?.config ?? defaultSiteConfig(compositions[0].id, compositions[0].defaultThemeId))

    useEffect(() => {
        if (cancelled) toast("Payment cancelled — your page is saved, pick up where you left off.")
    }, [cancelled])

    //live slug availability check (debounced; no sync setState in the effect body)
    useEffect(() => {
        clearTimeout(slugDebounce.current)

        const empty = step !== 0 || businessName.trim() === ""
        slugDebounce.current = setTimeout(async () => {
            if (empty) {
                slugInfoSet(null)
                checkingSlugSet(false)
                return
            }

            //sequence responses: a slow reply for an older name must never
            //overwrite the result for what's currently typed
            const requestId = ++slugRequestId.current
            checkingSlugSet(true)
            try {
                const result = await checkSlugAvailability(businessName)
                if (requestId === slugRequestId.current) slugInfoSet(result)
            } catch {
                if (requestId === slugRequestId.current) slugInfoSet(null)
            } finally {
                if (requestId === slugRequestId.current) checkingSlugSet(false)
            }
        }, empty ? 0 : 350)

        return () => clearTimeout(slugDebounce.current)
    }, [businessName, step])

    const monthly = monthlyTotal(config.enabledAddons)

    const currentComposition = compositions.find(c => c.id === config.compositionId) ?? compositions[0]
    //section types present in the chosen composition, for variant swapping
    const swappableSections = useMemo(() => {
        const sectionTypes = currentComposition.sections
            .map(variantId => variantsById[variantId]?.sectionType)
            .filter((sectionType): sectionType is SectionType => sectionType !== undefined)
        return sectionTypes.filter(sectionType => variantsForSection(sectionType).length > 1)
    }, [currentComposition])

    const claimContinue = async () => {
        if (checkingSlug || slugInfo === null || !slugInfo.available) return

        if (!signedIn) {
            //carry the typed name through the auth round trip
            const returnTo = `/sites/start?name=${encodeURIComponent(businessName.trim())}`
            window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`
            return
        }

        busySet(true)
        try {
            const created = await createDraftTenant({ businessName: businessName.trim(), slug: slugInfo.slug })
            tenantIdSet(created.tenantId)
            tenantSlugSet(created.slug)
            contentSet(defaultSiteContent(businessName.trim()))
            window.history.replaceState(null, "", `/sites/start?tenant=${created.tenantId}`)
            stepSet(1)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't claim that name")
        } finally {
            busySet(false)
        }
    }

    const saveContent = async (nextStep: number) => {
        if (tenantId === null) return
        const parsed = siteContentSchema.safeParse(content)
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "check the form")
            return
        }

        busySet(true)
        try {
            await updateTenantContent(tenantId, parsed.data)
            stepSet(nextStep)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't save")
        } finally {
            busySet(false)
        }
    }

    const saveConfig = async (nextStep: number) => {
        if (tenantId === null) return
        busySet(true)
        try {
            await updateTenantConfig(tenantId, config)
            stepSet(nextStep)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't save")
        } finally {
            busySet(false)
        }
    }

    const payNow = async () => {
        if (tenantId === null) return
        busySet(true)
        try {
            const { url } = await startTenantCheckout(tenantId)
            window.location.href = url
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't start checkout")
            busySet(false)
        }
    }

    const input = "rounded-md border border-line bg-surface px-3 py-2.5 font-normal"

    return (
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
            {/* progress */}
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {steps.map((label, index) => (
                    <li key={label} className="flex items-center gap-2">
                        <span className={`grid size-7 place-items-center rounded-full font-display text-xs font-bold ${index < step ? "bg-cobalt text-white" : index === step ? "bg-ink text-white" : "bg-line text-mist"}`}>
                            {index < step ? "✓" : index + 1}
                        </span>
                        <span className={index === step ? "font-semibold text-ink" : "text-mist"}>{label}</span>
                        {index < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-line" />}
                    </li>
                ))}
            </ol>

            {/* step 0 — claim */}
            {step === 0 && (
                <div className="grid max-w-xl gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">What&apos;s your business called?</h1>

                    <input
                        autoFocus
                        value={businessName}
                        onChange={e => businessNameSet(e.target.value)}
                        placeholder="Joe's Barbershop"
                        className={`${input} text-lg`}
                    />

                    <div className="rounded-lg border border-line bg-surface p-4 font-mono text-sm">
                        squaremaxtech.com/
                        <span className={slugInfo?.available === false ? "font-bold text-brand" : "font-bold text-cobalt"}>
                            {slugInfo?.slug || "your-business"}
                        </span>
                        <p className="mt-2 font-sans text-xs">
                            {checkingSlug ? <span className="text-mist">Checking…</span>
                                : slugInfo === null ? <span className="text-mist">Your web address appears here</span>
                                    : slugInfo.available ? <span className="font-semibold text-emerald-600">✓ Available</span>
                                        : <span className="font-semibold text-brand">✗ {slugInfo.reason}</span>}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={claimContinue}
                        disabled={busy || checkingSlug || slugInfo === null || !slugInfo.available}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50"
                    >
                        {signedIn ? "Claim it — continue" : "Sign in & claim it"}
                    </button>
                </div>
            )}

            {/* step 1 — business form */}
            {step === 1 && (
                <div className="grid max-w-2xl gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">Tell us about {content.business.name || "your business"}</h1>
                    <p className="text-mist">Everything is editable later from your dashboard.</p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Tagline
                            <input className={input} value={content.business.tagline} placeholder="Sharp cuts, no waiting"
                                onChange={e => {
                                    //mirror into the hero subheading until the owner customizes it
                                    const heroUntouched = content.hero.subheading === "Welcome — we're glad you're here." || content.hero.subheading === content.business.tagline
                                    contentSet({
                                        ...content,
                                        business: { ...content.business, tagline: e.target.value },
                                        hero: heroUntouched ? { ...content.hero, subheading: e.target.value } : content.hero,
                                    })
                                }} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Industry
                            <input className={input} value={content.business.industry} placeholder="Barbershop"
                                onChange={e => contentSet({ ...content, business: { ...content.business, industry: e.target.value } })} />
                        </label>
                    </div>

                    <label className="grid gap-1 text-sm font-semibold">About your business
                        <textarea rows={4} className={input} value={content.about.body} placeholder="Tell customers your story…"
                            onChange={e => contentSet({ ...content, about: { ...content.about, body: e.target.value }, business: { ...content.business, description: e.target.value.slice(0, 300) } })} />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-1 text-sm font-semibold">Phone
                            <input className={input} value={content.business.phone} onChange={e => contentSet({ ...content, business: { ...content.business, phone: e.target.value } })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Email
                            <input className={input} value={content.business.email} onChange={e => contentSet({ ...content, business: { ...content.business, email: e.target.value } })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Address
                            <input className={input} value={content.business.address} onChange={e => contentSet({ ...content, business: { ...content.business, address: e.target.value } })} />
                        </label>
                    </div>

                    {/* services editor */}
                    <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                        <legend className="px-1 text-sm font-semibold">Services (name · price · duration)</legend>
                        {content.services.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
                                <input className={input} value={item.name} placeholder="Haircut"
                                    onChange={e => {
                                        const items = [...content.services.items]; items[index] = { ...item, name: e.target.value }
                                        contentSet({ ...content, services: { ...content.services, items } })
                                    }} />
                                <input className={input} value={item.price} placeholder="$30"
                                    onChange={e => {
                                        const items = [...content.services.items]; items[index] = { ...item, price: e.target.value }
                                        contentSet({ ...content, services: { ...content.services, items } })
                                    }} />
                                <input className={input} type="number" min={5} step={5} value={item.durationMinutes ?? 30} title="Duration (minutes)"
                                    onChange={e => {
                                        const items = [...content.services.items]; items[index] = { ...item, durationMinutes: Number(e.target.value) || 30 }
                                        contentSet({ ...content, services: { ...content.services, items } })
                                    }} />
                                <button type="button" aria-label="Remove service" className="rounded-md border border-line px-3 text-mist hover:text-brand"
                                    onClick={() => contentSet({ ...content, services: { ...content.services, items: content.services.items.filter((_, i) => i !== index) } })}>×</button>
                            </div>
                        ))}
                        <button type="button" className="w-fit rounded-md border border-ink px-3 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white"
                            onClick={() => contentSet({ ...content, services: { ...content.services, items: [...content.services.items, { name: "", description: "", price: "", durationMinutes: 30 }] } })}>
                            + Add service
                        </button>
                    </fieldset>

                    {/* hours editor */}
                    <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                        <legend className="px-1 text-sm font-semibold">Opening hours</legend>
                        {content.hours.entries.map((entry, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                <input className={input} value={entry.label} placeholder="Mon–Fri"
                                    onChange={e => {
                                        const entries = [...content.hours.entries]; entries[index] = { ...entry, label: e.target.value }
                                        contentSet({ ...content, hours: { ...content.hours, entries } })
                                    }} />
                                <input className={input} value={entry.hours} placeholder="9am – 6pm"
                                    onChange={e => {
                                        const entries = [...content.hours.entries]; entries[index] = { ...entry, hours: e.target.value }
                                        contentSet({ ...content, hours: { ...content.hours, entries } })
                                    }} />
                                <button type="button" aria-label="Remove hours row" className="rounded-md border border-line px-3 text-mist hover:text-brand"
                                    onClick={() => contentSet({ ...content, hours: { ...content.hours, entries: content.hours.entries.filter((_, i) => i !== index) } })}>×</button>
                            </div>
                        ))}
                        <button type="button" className="w-fit rounded-md border border-ink px-3 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white"
                            onClick={() => contentSet({ ...content, hours: { ...content.hours, entries: [...content.hours.entries, { label: "", hours: "" }] } })}>
                            + Add hours
                        </button>
                    </fieldset>

                    <div className="flex gap-3">
                        <button type="button" disabled={busy} onClick={() => saveContent(2)}
                            className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                            Save & pick my look
                        </button>
                    </div>
                </div>
            )}

            {/* step 2 — pick your look (live preview with THEIR data) */}
            {step === 2 && (
                <div className="grid gap-6">
                    <h1 className="font-display text-3xl font-bold normal-case">Pick your look — that&apos;s your real content in there</h1>

                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        <div className="grid content-start gap-5">
                            <div className="grid gap-2">
                                <p className="text-sm font-semibold uppercase tracking-wide text-mist">Layout</p>
                                {compositions.map(composition => (
                                    <button key={composition.id} type="button"
                                        onClick={() => configSet({ ...config, compositionId: composition.id, variantOverrides: {} })}
                                        className={`grid gap-0.5 rounded-lg border p-3 text-left ${config.compositionId === composition.id ? "border-cobalt bg-surface" : "border-line bg-surface/60 hover:border-mist"}`}>
                                        <span className="font-display font-bold">{composition.name}</span>
                                        <span className="text-xs text-mist">{composition.description}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-semibold uppercase tracking-wide text-mist">Theme — any theme fits any layout</p>
                                <div className="flex flex-wrap gap-2">
                                    {themes.map(theme => (
                                        <button key={theme.id} type="button" title={theme.name}
                                            onClick={() => configSet({ ...config, themeId: theme.id })}
                                            className={`grid size-11 place-items-center overflow-hidden rounded-full border-2 ${config.themeId === theme.id ? "border-cobalt" : "border-line"}`}
                                            style={{ backgroundColor: theme.colors.background }}>
                                            <span className="size-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-semibold uppercase tracking-wide text-mist">Swap components</p>
                                {swappableSections.map(sectionType => {
                                    const options = variantsForSection(sectionType)
                                    const compositionDefault = currentComposition.sections.find(id => variantsById[id]?.sectionType === sectionType)
                                    const currentValue = config.variantOverrides[sectionType] ?? compositionDefault ?? options[0].variantId

                                    return (
                                        <label key={sectionType} className="grid gap-1 text-sm font-semibold capitalize">
                                            {sectionType}
                                            <select
                                                value={currentValue}
                                                onChange={e => configSet({ ...config, variantOverrides: { ...config.variantOverrides, [sectionType]: e.target.value } })}
                                                className="rounded-md border border-line bg-surface px-3 py-2 font-normal"
                                            >
                                                {options.map(option => (
                                                    <option key={option.variantId} value={option.variantId}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                    )
                                })}
                            </div>

                            <button type="button" disabled={busy} onClick={() => saveConfig(3)}
                                className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                                Save & choose add-ons
                            </button>
                        </div>

                        {/* live preview */}
                        <div className="overflow-hidden rounded-xl border border-line bg-surface">
                            <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
                                <span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" />
                                <span className="ml-2 truncate font-mono text-xs text-mist">squaremaxtech.com/{tenantSlug}</span>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto">
                                <TenantSite content={content} config={config} slug={tenantSlug ?? ""} preview />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* step 3 — add-ons */}
            {step === 3 && (
                <div className="grid max-w-2xl gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">Add exactly what you need</h1>
                    <p className="text-mist">Base page is ${BASE_MONTHLY_PRICE}/month. Toggle add-ons anytime — billing follows.</p>

                    <div className="grid gap-3">
                        {addons.map(addon => {
                            const enabled = config.enabledAddons.includes(addon.id)
                            const comingSoon = addon.status === "coming-soon"

                            return (
                                <label key={addon.id} className={`flex items-start gap-3 rounded-lg border p-4 ${comingSoon ? "border-line opacity-60" : enabled ? "border-cobalt bg-surface" : "border-line bg-surface/60"}`}>
                                    <input type="checkbox" disabled={comingSoon} checked={enabled} className="mt-1 size-4 accent-cobalt"
                                        onChange={() => {
                                            const enabledAddons: AddonId[] = enabled
                                                ? config.enabledAddons.filter(id => id !== addon.id)
                                                : [...config.enabledAddons, addon.id]
                                            configSet({ ...config, enabledAddons })
                                        }} />
                                    <span className="grid gap-0.5">
                                        <span className="flex items-center gap-2 font-semibold normal-case">
                                            {addon.name} <span className="text-sm text-cobalt">${addon.monthlyPrice}/mo</span>
                                            {comingSoon && <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-mist">Coming soon</span>}
                                        </span>
                                        <span className="text-sm font-normal normal-case text-mist">{addon.blurb}</span>
                                    </span>
                                </label>
                            )
                        })}
                    </div>

                    <p className="rounded-lg bg-ink px-4 py-3 font-display text-lg font-bold text-white">
                        Your total: ${monthly}/month
                    </p>

                    <button type="button" disabled={busy} onClick={() => saveConfig(4)}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save & review
                    </button>
                </div>
            )}

            {/* step 4 — go live */}
            {step === 4 && (
                <div className="grid max-w-xl gap-5">
                    <h1 className="font-display text-3xl font-bold normal-case">Ready to go live</h1>

                    <div className="grid gap-2 rounded-xl border border-line bg-surface p-6">
                        <p className="font-mono text-sm">squaremaxtech.com/<span className="font-bold text-cobalt">{tenantSlug}</span></p>
                        <ul className="grid gap-1 text-sm text-mist">
                            <li>Base page — ${BASE_MONTHLY_PRICE}/mo</li>
                            {config.enabledAddons.map(id => {
                                const addon = addons.find(a => a.id === id)
                                return addon !== undefined ? <li key={id}>{addon.name} — ${addon.monthlyPrice}/mo</li> : null
                            })}
                        </ul>
                        <p className="border-t border-line pt-2 font-display text-2xl font-bold">${monthly}/month</p>
                        <p className="text-xs text-mist">Prepaid 30 days at a time. Cancel anytime — your page pauses politely, never breaks.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button type="button" disabled={busy} onClick={payNow}
                            className="rounded-lg bg-cobalt px-6 py-3.5 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                            {busy ? "Opening secure checkout…" : `Pay $${monthly} & go live`}
                        </button>
                        <button type="button" onClick={() => stepSet(2)} className="rounded-lg border border-line px-5 py-3 font-semibold text-mist hover:text-ink">
                            Back to design
                        </button>
                    </div>

                    <p className="text-xs text-mist">
                        Payments are processed on a secure PowerTranz page — your card never touches our servers.
                        Questions first? <Link className="underline" href="/contact">Talk to us</Link>.
                    </p>
                </div>
            )}
        </div>
    )
}
