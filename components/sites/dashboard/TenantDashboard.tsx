"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { SiteMeta, BusinessInfo, socialLinkSchema } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { themes, themeColorsSchema, ThemeColors } from "@/lib/sites/themes"
import { addons, BASE_MONTHLY_PRICE, monthlyTotal, AddonId } from "@/lib/sites/addons"
import { EffectiveStatus } from "@/lib/sites/status"
import { RenderableComponent, RenderablePage } from "@/components/sites/TenantSite"
import { ProductLite } from "@/lib/sites/sectionProps"
import { setBookingStatus, markMessageRead, setTenantAvailability, setTenantAddons } from "@/serverFunctions/handleTenants"
import { setSiteTheme, updateBusinessInfo } from "@/serverFunctions/handleSiteBuilder"
import { startTenantCheckout } from "@/serverFunctions/handleTenantBilling"
import WebsiteEditor from "./WebsiteEditor"
import StoreTab, { ProductRow, SaleRow, SalesSummary } from "./StoreTab"
import CustomersTab, { CustomerRow } from "./CustomersTab"
import MarketingTab, { AnnouncementRow } from "./MarketingTab"

//============================================================
// The tenant dashboard: run the whole business from one place.
//  Website   — the instance-based page builder
//  Design    — site-wide theme (components can override per instance)
//  Business  — profile every component reads (phone, socials, SEO)
//  Store     — inventory add-on · Customers — the tenant's own users
//  Bookings/Messages/Marketing/Add-ons — operations
//============================================================

type BookingRow = {
    id: string
    serviceName: string
    customerName: string
    customerEmail: string
    customerPhone: string
    startsAt: Date
    endsAt: Date
    status: "pending" | "confirmed" | "cancelled"
    notes: string
}

type MessageRow = {
    id: string
    name: string
    email: string
    body: string
    read: boolean
    createdAt: Date
}

type AvailabilityRow = {
    dayOfWeek: number
    openTime: string
    closeTime: string
    slotMinutes: number
}

const tabs = ["Overview", "Website", "Design", "Business", "Store", "Customers", "Bookings", "Messages", "Marketing", "Add-ons"] as const
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const tokenLabels: Record<keyof ThemeColors, string> = {
    background: "Background", surface: "Surface", text: "Text", textMuted: "Muted text",
    primary: "Primary", primaryContrast: "On primary", accent: "Accent", border: "Borders",
}

export default function TenantDashboard(props: {
    tenantId: string
    slug: string
    status: EffectiveStatus
    currentPeriodEnd: string | null
    initialMeta: SiteMeta
    initialConfig: SiteConfig
    pages: RenderablePage[]
    components: RenderableComponent[]
    products: ProductRow[]
    sales: SaleRow[]
    salesSummary: SalesSummary | null
    customers: CustomerRow[]
    announcements: AnnouncementRow[]
    otherTenants: { id: string; businessName: string }[]
    bookings: BookingRow[]
    messages: MessageRow[]
    availability: AvailabilityRow[]
}) {
    const [tab, tabSet] = useState<(typeof tabs)[number]>("Overview")
    const [busy, busySet] = useState(false)

    const [meta, metaSet] = useState<SiteMeta>(props.initialMeta)
    const [config, configSet] = useState<SiteConfig>(props.initialConfig)
    const [bookings, bookingsSet] = useState(props.bookings)
    const [messages, messagesSet] = useState(props.messages)
    const [availability, availabilitySet] = useState<AvailabilityRow[]>(props.availability)

    const monthly = monthlyTotal(config.enabledAddons)
    const input = "rounded-md border border-line bg-surface px-3 py-2 font-normal"

    const run = async (work: () => Promise<unknown>, success: string) => {
        busySet(true)
        try {
            await work()
            toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    const saveBusiness = () => run(async () => {
        await updateBusinessInfo(props.tenantId, meta.business, meta.seo)
    }, "Saved — your whole site picked it up")

    const saveTheme = () => run(async () => {
        await setSiteTheme(props.tenantId, { themeId: config.themeId, themeOverrides: config.themeOverrides })
    }, "Theme saved")

    const saveAddons = () => run(async () => {
        await setTenantAddons(props.tenantId, config.enabledAddons)
    }, "Add-ons saved")

    const renew = async () => {
        busySet(true)
        try {
            const { url } = await startTenantCheckout(props.tenantId)
            window.location.href = url
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't start checkout")
            busySet(false)
        }
    }

    const setBusiness = (patch: Partial<BusinessInfo>) => metaSet({ ...meta, business: { ...meta.business, ...patch } })

    const statusCopy: Record<EffectiveStatus, { label: string; className: string }> = {
        draft: { label: "Draft — not public yet", className: "bg-line text-mist" },
        active: { label: "Live", className: "bg-emerald-100 text-emerald-800" },
        grace: { label: "Payment due — page still up", className: "bg-amber-100 text-amber-800" },
        suspended: { label: "Paused — renew to go back online", className: "bg-red-100 text-red-800" },
        cancelled: { label: "Cancelled", className: "bg-line text-mist" },
    }

    return (
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-1">
                    <h1 className="font-display text-3xl font-bold normal-case">{meta.business.name}</h1>
                    <a href={`/${props.slug}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-cobalt hover:underline">
                        squaremaxtech.com/{props.slug} ↗
                    </a>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusCopy[props.status].className}`}>
                    {statusCopy[props.status].label}
                </span>
            </div>

            <nav className="flex flex-wrap gap-1 border-b border-line">
                {tabs.map(eachTab => (
                    <button key={eachTab} type="button" onClick={() => tabSet(eachTab)}
                        className={`px-3.5 py-2.5 text-sm font-semibold ${tab === eachTab ? "border-b-2 border-cobalt text-ink" : "text-mist hover:text-ink"}`}>
                        {eachTab}
                        {eachTab === "Messages" && messages.some(m => !m.read) && <span className="ml-1.5 rounded-full bg-brand px-1.5 text-xs text-white">{messages.filter(m => !m.read).length}</span>}
                        {eachTab === "Bookings" && bookings.some(b => b.status === "pending") && <span className="ml-1.5 rounded-full bg-cobalt px-1.5 text-xs text-white">{bookings.filter(b => b.status === "pending").length}</span>}
                    </button>
                ))}
            </nav>

            {tab === "Overview" && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 rounded-xl border border-line bg-surface p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Subscription</p>
                        <p className="font-display text-2xl font-bold">${monthly}/month</p>
                        <p className="text-sm text-mist">
                            Website ${BASE_MONTHLY_PRICE}/mo{config.enabledAddons.length > 0 ? ` + ${config.enabledAddons.length} add-on${config.enabledAddons.length > 1 ? "s" : ""} at $5 each` : ""}.
                        </p>
                        <p className="text-sm text-mist">
                            {props.currentPeriodEnd !== null
                                ? `Paid through ${new Date(props.currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/Jamaica" })}`
                                : "No active period — pay to go live."}
                        </p>
                        <button type="button" disabled={busy} onClick={renew}
                            className="mt-1 w-fit rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            {props.status === "active" ? `Renew 30 days — $${monthly}` : `Pay $${monthly} & go live`}
                        </button>
                    </div>

                    <div className="grid content-start gap-2 rounded-xl border border-line bg-surface p-6 text-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">At a glance</p>
                        <p><strong>{props.pages.length}</strong> page{props.pages.length === 1 ? "" : "s"} · <strong>{props.components.length}</strong> components on your site</p>
                        <p><strong>{props.customers.length}</strong> customer account{props.customers.length === 1 ? "" : "s"}</p>
                        <p><strong>{bookings.filter(b => b.status === "pending").length}</strong> booking{bookings.filter(b => b.status === "pending").length === 1 ? "" : "s"} awaiting confirmation</p>
                        <p><strong>{messages.filter(m => !m.read).length}</strong> unread message{messages.filter(m => !m.read).length === 1 ? "" : "s"}</p>
                        {props.salesSummary !== null && config.enabledAddons.includes("inventory") && (
                            <p><strong>${(props.salesSummary.revenueCents / 100).toFixed(2)}</strong> in sales this month</p>
                        )}
                        <p className="pt-1 text-xs text-mist">Edit your site in the Website tab — every component is yours to reorder, restyle or swap.</p>
                    </div>
                </div>
            )}

            {tab === "Website" && (
                <WebsiteEditor
                    tenantId={props.tenantId}
                    slug={props.slug}
                    meta={meta}
                    config={config}
                    initialPages={props.pages}
                    initialComponents={props.components}
                    products={props.products.filter(product => product.active).map((product): ProductLite => ({
                        id: product.id, name: product.name, description: product.description,
                        priceCents: product.priceCents, imageSrc: product.imageSrc,
                        stock: product.stock, trackStock: product.trackStock,
                    }))}
                />
            )}

            {tab === "Design" && (
                <div className="grid max-w-2xl gap-5">
                    <div className="grid gap-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Theme — colors & fonts for the whole site</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {themes.map(theme => (
                                <button key={theme.id} type="button"
                                    onClick={() => configSet({ ...config, themeId: theme.id, themeOverrides: {} })}
                                    className={`flex items-center gap-3 rounded-lg border p-3 text-left ${config.themeId === theme.id ? "border-cobalt bg-surface" : "border-line bg-surface/60 hover:border-mist"}`}>
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line" style={{ backgroundColor: theme.colors.background }}>
                                        <span className="size-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                                    </span>
                                    <span className="grid gap-0.5">
                                        <span className="font-display font-bold">{theme.name}</span>
                                        <span className="text-xs text-mist">{theme.fonts.heading} / {theme.fonts.body}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Fine-tune colors (optional)</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {themeColorsSchema.keyof().options.map(tokenKey => {
                                const themeDefault = themes.find(theme => theme.id === config.themeId)?.colors[tokenKey] ?? "#888888"
                                const current = config.themeOverrides[tokenKey] ?? ""
                                return (
                                    <div key={tokenKey} className="flex items-center gap-1.5 text-xs">
                                        <input type="color" value={current !== "" ? current : themeDefault} aria-label={tokenLabels[tokenKey]}
                                            className="size-8 cursor-pointer rounded border border-line"
                                            onChange={e => configSet({ ...config, themeOverrides: { ...config.themeOverrides, [tokenKey]: e.target.value } })} />
                                        <span className={current !== "" ? "font-semibold" : "text-mist"}>{tokenLabels[tokenKey]}</span>
                                        {current !== "" && (
                                            <button type="button" className="text-mist hover:text-brand" aria-label={`Reset ${tokenLabels[tokenKey]}`}
                                                onClick={() => {
                                                    const themeOverrides = { ...config.themeOverrides }
                                                    delete themeOverrides[tokenKey]
                                                    configSet({ ...config, themeOverrides })
                                                }}>×</button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-xs text-mist">Individual components can override these again from the Website tab — instance styles always win.</p>
                    </div>

                    <button type="button" disabled={busy} onClick={saveTheme}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save design
                    </button>
                </div>
            )}

            {tab === "Business" && (
                <div className="grid max-w-2xl gap-4">
                    <p className="text-sm text-mist">Every component on your site reads these — change your number once, it updates everywhere.</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Business name
                            <input className={input} value={meta.business.name} onChange={e => setBusiness({ name: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Tagline
                            <input className={input} value={meta.business.tagline} onChange={e => setBusiness({ tagline: e.target.value })} />
                        </label>
                    </div>
                    <label className="grid gap-1 text-sm font-semibold">Description
                        <textarea rows={3} className={input} value={meta.business.description} onChange={e => setBusiness({ description: e.target.value })} />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Phone
                            <input className={input} value={meta.business.phone} onChange={e => setBusiness({ phone: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">WhatsApp number (with country code)
                            <input className={input} placeholder="e.g. 18761234567" value={meta.business.whatsapp} onChange={e => setBusiness({ whatsapp: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Email
                            <input className={input} value={meta.business.email} onChange={e => setBusiness({ email: e.target.value })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Address
                            <input className={input} value={meta.business.address} onChange={e => setBusiness({ address: e.target.value })} />
                        </label>
                    </div>
                    <label className="grid gap-1 text-sm font-semibold">Logo URL
                        <input className={input} value={meta.business.logoUrl} onChange={e => setBusiness({ logoUrl: e.target.value })} />
                    </label>

                    <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                        <legend className="px-1 text-sm font-semibold">Social links</legend>
                        {meta.business.socials.map((social, socialIndex) => (
                            <div key={socialIndex} className="grid grid-cols-[130px_1fr_auto] gap-2">
                                <select className={input} value={social.platform} onChange={e => {
                                    const socials = [...meta.business.socials]
                                    socials[socialIndex] = { ...social, platform: socialLinkSchema.shape.platform.parse(e.target.value) }
                                    setBusiness({ socials })
                                }}>
                                    {socialLinkSchema.shape.platform.options.map(platform => (
                                        <option key={platform} value={platform}>{platform}</option>
                                    ))}
                                </select>
                                <input className={input} placeholder="https://…" value={social.url} onChange={e => {
                                    const socials = [...meta.business.socials]
                                    socials[socialIndex] = { ...social, url: e.target.value }
                                    setBusiness({ socials })
                                }} />
                                <button type="button" aria-label="Remove social link" className="rounded-md border border-line px-3 text-mist hover:text-brand"
                                    onClick={() => setBusiness({ socials: meta.business.socials.filter((_, i) => i !== socialIndex) })}>×</button>
                            </div>
                        ))}
                        <button type="button" className="w-fit rounded-md border border-ink px-3 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white"
                            onClick={() => setBusiness({ socials: [...meta.business.socials, { platform: "instagram", url: "" }] })}>
                            + Add social
                        </button>
                    </fieldset>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">SEO title (search results)
                            <input className={input} value={meta.seo.title} onChange={e => metaSet({ ...meta, seo: { ...meta.seo, title: e.target.value } })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">SEO description
                            <input className={input} value={meta.seo.description} onChange={e => metaSet({ ...meta, seo: { ...meta.seo, description: e.target.value } })} />
                        </label>
                    </div>

                    <button type="button" disabled={busy} onClick={saveBusiness}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save business info
                    </button>
                </div>
            )}

            {tab === "Store" && (
                <StoreTab
                    tenantId={props.tenantId}
                    enabled={config.enabledAddons.includes("inventory")}
                    initialProducts={props.products}
                    initialSales={props.sales}
                    initialSummary={props.salesSummary}
                />
            )}

            {tab === "Customers" && (
                <CustomersTab tenantId={props.tenantId} initialCustomers={props.customers} otherTenants={props.otherTenants} />
            )}

            {tab === "Bookings" && (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="grid content-start gap-2">
                        {bookings.length === 0 && <p className="text-mist">No bookings yet.</p>}
                        {bookings.map(booking => (
                            <div key={booking.id} className="grid gap-1 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                <div className="grid gap-0.5 text-sm">
                                    <p className="font-semibold">{booking.serviceName} — {booking.customerName}</p>
                                    <p className="text-mist">{new Date(booking.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Jamaica" })}</p>
                                    <p className="text-mist">{booking.customerEmail}{booking.customerPhone !== "" ? ` · ${booking.customerPhone}` : ""}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : booking.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-line text-mist"}`}>{booking.status}</span>
                                    {booking.status === "pending" && (
                                        <button type="button" disabled={busy} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                                            onClick={() => run(async () => {
                                                await setBookingStatus(props.tenantId, booking.id, "confirmed")
                                                bookingsSet(prev => prev.map(b => b.id === booking.id ? { ...b, status: "confirmed" } : b))
                                            }, "Booking confirmed")}>
                                            Confirm
                                        </button>
                                    )}
                                    {booking.status !== "cancelled" && (
                                        <button type="button" disabled={busy} className="rounded-md border border-line px-3 py-1.5 text-xs font-bold text-mist hover:text-brand"
                                            onClick={() => run(async () => {
                                                await setBookingStatus(props.tenantId, booking.id, "cancelled")
                                                bookingsSet(prev => prev.map(b => b.id === booking.id ? { ...b, status: "cancelled" } : b))
                                            }, "Booking cancelled")}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid h-fit content-start gap-2 rounded-lg border border-line bg-surface p-4">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Weekly availability</p>
                        {dayNames.map((dayName, dayOfWeek) => {
                            const rule = availability.find(r => r.dayOfWeek === dayOfWeek)
                            return (
                                <div key={dayName} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                                    <span className={rule !== undefined ? "font-semibold" : "text-mist"}>{dayName}</span>
                                    {rule !== undefined ? (
                                        <span className="flex items-center gap-1">
                                            <input type="time" value={rule.openTime} className="rounded border border-line px-1 py-0.5 text-xs"
                                                onChange={e => availabilitySet(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, openTime: e.target.value } : r))} />
                                            –
                                            <input type="time" value={rule.closeTime} className="rounded border border-line px-1 py-0.5 text-xs"
                                                onChange={e => availabilitySet(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, closeTime: e.target.value } : r))} />
                                            <button type="button" aria-label={`Close ${dayName}`} className="px-1 text-mist hover:text-brand"
                                                onClick={() => availabilitySet(prev => prev.filter(r => r.dayOfWeek !== dayOfWeek))}>×</button>
                                        </span>
                                    ) : (
                                        <button type="button" className="text-xs font-semibold text-cobalt hover:underline"
                                            onClick={() => availabilitySet(prev => [...prev, { dayOfWeek, openTime: "09:00", closeTime: "17:00", slotMinutes: 30 }])}>
                                            + Open
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        <button type="button" disabled={busy} onClick={() => run(() => setTenantAvailability(props.tenantId, availability), "Availability saved")}
                            className="mt-1 rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-ink disabled:opacity-50">
                            Save availability
                        </button>
                    </div>
                </div>
            )}

            {tab === "Messages" && (
                <div className="grid max-w-2xl gap-2">
                    {messages.length === 0 && <p className="text-mist">No messages yet.</p>}
                    {messages.map(message => (
                        <div key={message.id} className={`grid gap-1 rounded-lg border p-4 ${message.read ? "border-line bg-surface/60" : "border-cobalt bg-surface"}`}>
                            <div className="flex items-baseline justify-between gap-2 text-sm">
                                <p className="font-semibold">{message.name} <a className="font-normal text-cobalt hover:underline" href={`mailto:${message.email}`}>{message.email}</a></p>
                                <span className="text-xs text-mist">{new Date(message.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                            </div>
                            <p className="whitespace-pre-line text-sm text-mist">{message.body}</p>
                            {!message.read && (
                                <button type="button" disabled={busy} className="w-fit text-xs font-semibold text-cobalt hover:underline"
                                    onClick={() => run(async () => {
                                        await markMessageRead(props.tenantId, message.id)
                                        messagesSet(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m))
                                    }, "Marked read")}>
                                    Mark read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {tab === "Marketing" && (
                <MarketingTab
                    tenantId={props.tenantId}
                    enabled={config.enabledAddons.includes("notifications")}
                    customerCount={props.customers.length}
                    initialAnnouncements={props.announcements}
                />
            )}

            {tab === "Add-ons" && (
                <div className="grid max-w-2xl gap-4">
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

                    <p className="rounded-lg bg-ink px-4 py-3 font-display text-lg font-bold text-white">New total: ${monthly}/month</p>
                    <p className="text-xs text-mist">Changes apply to your page immediately; the new price applies from your next renewal.</p>

                    <button type="button" disabled={busy} onClick={saveAddons}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save add-ons
                    </button>
                </div>
            )}
        </div>
    )
}
