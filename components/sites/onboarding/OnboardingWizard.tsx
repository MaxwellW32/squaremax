"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import TenantSite from "@/components/sites/TenantSite"
import { SiteMeta, defaultSiteMeta, BusinessInfo } from "@/lib/sites/content"
import { SiteConfig, defaultSiteConfig } from "@/lib/sites/config"
import { themes } from "@/lib/sites/themes"
import { siteTemplates, instantiateTemplate } from "@/lib/sites/siteTemplates"
import { addons, BASE_MONTHLY_PRICE, monthlyTotal, AddonId } from "@/lib/sites/addons"
import { checkSlugAvailability, createDraftTenant, setTenantAddons } from "@/serverFunctions/handleTenants"
import { setSiteTheme, updateBusinessInfo } from "@/serverFunctions/handleSiteBuilder"
import { startTenantCheckout } from "@/serverFunctions/handleTenantBilling"

const steps = ["Claim your name", "Pick a starting point", "Your business", "Add-ons", "Go live"] as const

type ResumeTenant = {
    id: string
    slug: string
    meta: SiteMeta
    config: SiteConfig
}

export default function OnboardingWizard({ signedIn, resumeTenant, cancelled, initialName }: {
    signedIn: boolean
    resumeTenant: ResumeTenant | null
    cancelled: boolean
    initialName?: string
}) {
    const [step, stepSet] = useState(resumeTenant !== null ? 2 : 0)
    const [busy, busySet] = useState(false)

    //step 0 (initialName survives the sign-in round trip via the callback url)
    const [businessName, businessNameSet] = useState(resumeTenant?.meta.business.name ?? initialName ?? "")
    const [slugInfo, slugInfoSet] = useState<{ slug: string; available: boolean; reason?: string } | null>(null)
    const [checkingSlug, checkingSlugSet] = useState(false)
    const slugDebounce = useRef<NodeJS.Timeout | undefined>(undefined)
    const slugRequestId = useRef(0)

    //step 1 — template + theme (local until the tenant is created)
    const [templateId, templateIdSet] = useState("storefront-classic")
    const [themeId, themeIdSet] = useState<string | null>(null) //null = template default

    //draft tenant
    const [tenantId, tenantIdSet] = useState<string | null>(resumeTenant?.id ?? null)
    const [tenantSlug, tenantSlugSet] = useState<string | null>(resumeTenant?.slug ?? null)
    const [meta, metaSet] = useState<SiteMeta>(resumeTenant?.meta ?? defaultSiteMeta(""))
    const [config, configSet] = useState<SiteConfig>(resumeTenant?.config ?? defaultSiteConfig("linen"))

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
    const input = "rounded-md border border-line bg-surface px-3 py-2.5 font-normal"

    const chosenTemplate = siteTemplates.find(template => template.id === templateId) ?? siteTemplates[0]
    const previewThemeId = themeId ?? chosenTemplate.themeId

    //live template preview: the template is instantiated CLIENT-SIDE with the
    //typed business name — the same copy-per-component routine that later runs
    //on the server, so what you see is exactly what you get
    const preview = useMemo(() => {
        const previewMeta = defaultSiteMeta(businessName.trim() !== "" ? businessName.trim() : "Your business")
        const { pages, components } = instantiateTemplate(chosenTemplate, previewMeta.business)
        return { previewMeta, pages, components }
    }, [chosenTemplate, businessName])

    const claimContinue = async () => {
        if (checkingSlug || slugInfo === null || !slugInfo.available) return

        if (!signedIn) {
            //carry the typed name through the auth round trip
            const returnTo = `/sites/start?name=${encodeURIComponent(businessName.trim())}`
            window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`
            return
        }

        stepSet(1)
    }

    //create the tenant: copies the chosen template component-by-component
    const createFromTemplate = async () => {
        if (slugInfo === null || !slugInfo.available) return
        busySet(true)
        try {
            const created = await createDraftTenant({
                businessName: businessName.trim(),
                slug: slugInfo.slug,
                templateId: chosenTemplate.id,
            })
            tenantIdSet(created.tenantId)
            tenantSlugSet(created.slug)
            metaSet(defaultSiteMeta(businessName.trim()))

            if (themeId !== null && themeId !== chosenTemplate.themeId) {
                await setSiteTheme(created.tenantId, { themeId, themeOverrides: {} })
            }
            configSet({ ...config, themeId: previewThemeId })

            window.history.replaceState(null, "", `/sites/start?tenant=${created.tenantId}`)
            stepSet(2)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't create your site")
        } finally {
            busySet(false)
        }
    }

    const saveBusiness = async (nextStep: number) => {
        if (tenantId === null) return
        busySet(true)
        try {
            await updateBusinessInfo(tenantId, meta.business, meta.seo)
            stepSet(nextStep)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't save")
        } finally {
            busySet(false)
        }
    }

    const saveAddons = async (nextStep: number) => {
        if (tenantId === null) return
        busySet(true)
        try {
            await setTenantAddons(tenantId, config.enabledAddons)
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

    const setBusiness = (patch: Partial<BusinessInfo>) => metaSet({ ...meta, business: { ...meta.business, ...patch } })

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

            {/* step 1 — template + theme, with a real instantiated preview */}
            {step === 1 && (
                <div className="grid gap-6">
                    <div className="grid gap-1">
                        <h1 className="font-display text-3xl font-bold normal-case">Pick a starting point</h1>
                        <p className="text-mist">
                            A template is copied into your site component by component — then every piece is yours to
                            edit, reorder, restyle or swap for another design. Or start from a blank canvas.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        <div className="grid content-start gap-5">
                            <div className="grid gap-2">
                                {siteTemplates.map(template => (
                                    <button key={template.id} type="button"
                                        onClick={() => { templateIdSet(template.id); themeIdSet(null) }}
                                        className={`grid gap-0.5 rounded-lg border p-3 text-left ${templateId === template.id ? "border-cobalt bg-surface" : "border-line bg-surface/60 hover:border-mist"}`}>
                                        <span className="font-display font-bold">{template.name}</span>
                                        <span className="text-xs text-mist">{template.description}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-semibold uppercase tracking-wide text-mist">Theme — any theme fits any template</p>
                                <div className="flex flex-wrap gap-2">
                                    {themes.map(theme => (
                                        <button key={theme.id} type="button" title={theme.name}
                                            onClick={() => themeIdSet(theme.id)}
                                            className={`grid size-11 place-items-center overflow-hidden rounded-full border-2 ${previewThemeId === theme.id ? "border-cobalt" : "border-line"}`}
                                            style={{ backgroundColor: theme.colors.background }}>
                                            <span className="size-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="button" disabled={busy} onClick={createFromTemplate}
                                className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                                {busy ? "Setting up your site…" : "Use this — continue"}
                            </button>
                        </div>

                        {/* live preview of the instantiated template */}
                        <div className="overflow-hidden rounded-xl border border-line bg-surface">
                            <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
                                <span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" /><span className="size-2.5 rounded-full bg-line" />
                                <span className="ml-2 truncate font-mono text-xs text-mist">squaremaxtech.com/{slugInfo?.slug ?? tenantSlug ?? ""}</span>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto">
                                <TenantSite
                                    meta={preview.previewMeta}
                                    config={{ schemaVersion: 2, themeId: previewThemeId, themeOverrides: {}, enabledAddons: ["booking", "inventory"] }}
                                    slug={slugInfo?.slug ?? ""}
                                    basePath=""
                                    tenantId="preview"
                                    pages={preview.pages.map(page => ({ id: page.id, slug: page.slug, title: page.title, order: page.order }))}
                                    components={preview.components}
                                    currentPageId={preview.pages[0]?.id ?? ""}
                                    products={[
                                        { id: "demo-1", name: "Sample product", description: "Shows when you add products in the Store tab.", priceCents: 2500, imageSrc: "", stock: 5, trackStock: true },
                                        { id: "demo-2", name: "Another product", description: "", priceCents: 1200, imageSrc: "", stock: 12, trackStock: true },
                                    ]}
                                    preview
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* step 2 — business info */}
            {step === 2 && (
                <div className="grid max-w-2xl gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">Tell us about {meta.business.name || "your business"}</h1>
                    <p className="text-mist">Your components read these everywhere — phone, WhatsApp, address. All editable later.</p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Tagline
                            <input className={input} value={meta.business.tagline} placeholder="Sharp cuts, no waiting"
                                onChange={e => setBusiness({ tagline: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Industry
                            <input className={input} value={meta.business.industry} placeholder="Barbershop"
                                onChange={e => setBusiness({ industry: e.target.value })} />
                        </label>
                    </div>

                    <label className="grid gap-1 text-sm font-semibold">About your business
                        <textarea rows={4} className={input} value={meta.business.description} placeholder="Tell customers your story…"
                            onChange={e => setBusiness({ description: e.target.value })} />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Phone
                            <input className={input} value={meta.business.phone} onChange={e => setBusiness({ phone: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">WhatsApp (with country code)
                            <input className={input} placeholder="18761234567" value={meta.business.whatsapp} onChange={e => setBusiness({ whatsapp: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Email
                            <input className={input} value={meta.business.email} onChange={e => setBusiness({ email: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Address
                            <input className={input} value={meta.business.address} onChange={e => setBusiness({ address: e.target.value })} />
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button type="button" disabled={busy} onClick={() => saveBusiness(3)}
                            className="rounded-lg bg-cobalt px-6 py-3 font-display text-lg font-bold text-white hover:bg-ink disabled:opacity-50">
                            Save & choose add-ons
                        </button>
                    </div>
                    <p className="text-xs text-mist">
                        Fine-tune every section (services, photos, hours, menus) from your dashboard&apos;s Website tab after checkout.
                    </p>
                </div>
            )}

            {/* step 3 — add-ons */}
            {step === 3 && (
                <div className="grid max-w-2xl gap-4">
                    <h1 className="font-display text-3xl font-bold normal-case">Add exactly what you need</h1>
                    <p className="text-mist">Your website is ${BASE_MONTHLY_PRICE}/month. Each add-on is $5 — toggle them anytime, billing follows.</p>

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

                    <button type="button" disabled={busy} onClick={() => saveAddons(4)}
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
                            <li>Your website — ${BASE_MONTHLY_PRICE}/mo</li>
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
                            Back
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
