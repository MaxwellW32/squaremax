"use client"
import React, { useMemo, useState } from "react"
import toast from "react-hot-toast"
import TenantSite from "@/components/sites/TenantSite"
import { SiteContent, siteContentSchema, SectionType } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { compositions } from "@/lib/sites/compositions"
import { themes } from "@/lib/sites/themes"
import { variantsById, variantsForSection } from "@/lib/sites/registry"
import { addons, BASE_MONTHLY_PRICE, monthlyTotal, AddonId } from "@/lib/sites/addons"
import { EffectiveStatus } from "@/lib/sites/status"
import { setBookingStatus, markMessageRead, setTenantAvailability, updateTenantConfig, updateTenantContent } from "@/serverFunctions/handleTenants"
import { startTenantCheckout } from "@/serverFunctions/handleTenantBilling"

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

const tabs = ["Overview", "Content", "Design", "Add-ons", "Bookings", "Messages"] as const
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TenantDashboard(props: {
    tenantId: string
    slug: string
    status: EffectiveStatus
    currentPeriodEnd: string | null
    initialContent: SiteContent
    initialConfig: SiteConfig
    bookings: BookingRow[]
    messages: MessageRow[]
    availability: AvailabilityRow[]
}) {
    const [tab, tabSet] = useState<(typeof tabs)[number]>("Overview")
    const [busy, busySet] = useState(false)

    const [content, contentSet] = useState<SiteContent>(props.initialContent)
    const [config, configSet] = useState<SiteConfig>(props.initialConfig)
    const [bookings, bookingsSet] = useState(props.bookings)
    const [messages, messagesSet] = useState(props.messages)
    const [availability, availabilitySet] = useState<AvailabilityRow[]>(props.availability)

    const monthly = monthlyTotal(config.enabledAddons)
    const input = "rounded-md border border-line bg-surface px-3 py-2 font-normal"

    const currentComposition = compositions.find(c => c.id === config.compositionId) ?? compositions[0]
    const swappableSections = useMemo(() => {
        const sectionTypes = currentComposition.sections
            .map(variantId => variantsById[variantId]?.sectionType)
            .filter((sectionType): sectionType is SectionType => sectionType !== undefined)
        return sectionTypes.filter(sectionType => variantsForSection(sectionType).length > 1)
    }, [currentComposition])

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

    const saveContent = () => {
        const parsed = siteContentSchema.safeParse(content)
        if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "check the form")
        run(() => updateTenantContent(props.tenantId, parsed.data), "Saved — your page is updated")
    }

    const saveConfig = () => run(() => updateTenantConfig(props.tenantId, config), "Saved — your page is updated")

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

    const statusCopy: Record<EffectiveStatus, { label: string; className: string }> = {
        draft: { label: "Draft — not public yet", className: "bg-line text-mist" },
        active: { label: "Live", className: "bg-emerald-100 text-emerald-800" },
        grace: { label: "Payment due — page still up", className: "bg-amber-100 text-amber-800" },
        suspended: { label: "Paused — renew to go back online", className: "bg-red-100 text-red-800" },
        cancelled: { label: "Cancelled", className: "bg-line text-mist" },
    }

    return (
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-1">
                    <h1 className="font-display text-3xl font-bold normal-case">{content.business.name}</h1>
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
                        className={`px-4 py-2.5 text-sm font-semibold ${tab === eachTab ? "border-b-2 border-cobalt text-ink" : "text-mist hover:text-ink"}`}>
                        {eachTab}
                        {eachTab === "Messages" && messages.some(m => !m.read) && <span className="ml-1.5 rounded-full bg-brand px-1.5 text-xs text-white">{messages.filter(m => !m.read).length}</span>}
                        {eachTab === "Bookings" && bookings.some(b => b.status === "pending") && <span className="ml-1.5 rounded-full bg-cobalt px-1.5 text-xs text-white">{bookings.filter(b => b.status === "pending").length}</span>}
                    </button>
                ))}
            </nav>

            {tab === "Overview" && (
                <div className="grid max-w-xl gap-4">
                    <div className="grid gap-2 rounded-xl border border-line bg-surface p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-mist">Subscription</p>
                        <p className="font-display text-2xl font-bold">${monthly}/month</p>
                        <p className="text-sm text-mist">
                            Base page ${BASE_MONTHLY_PRICE}/mo{config.enabledAddons.length > 0 ? ` + ${config.enabledAddons.length} add-on${config.enabledAddons.length > 1 ? "s" : ""}` : ""}.
                        </p>
                        <p className="text-sm text-mist">
                            {props.currentPeriodEnd !== null
                                ? `Paid through ${new Date(props.currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "long" })}`
                                : "No active period — pay to go live."}
                        </p>
                        <button type="button" disabled={busy} onClick={renew}
                            className="mt-1 w-fit rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            {props.status === "active" ? `Renew 30 days — $${monthly}` : `Pay $${monthly} & go live`}
                        </button>
                    </div>
                </div>
            )}

            {tab === "Content" && (
                <div className="grid max-w-2xl gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm font-semibold">Business name
                            <input className={input} value={content.business.name}
                                onChange={e => contentSet({ ...content, business: { ...content.business, name: e.target.value } })} />
                        </label>
                        <label className="grid gap-1 text-sm font-semibold">Tagline
                            <input className={input} value={content.business.tagline}
                                onChange={e => contentSet({ ...content, business: { ...content.business, tagline: e.target.value } })} />
                        </label>
                    </div>

                    <label className="grid gap-1 text-sm font-semibold">Hero heading
                        <input className={input} value={content.hero.heading}
                            onChange={e => contentSet({ ...content, hero: { ...content.hero, heading: e.target.value } })} />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold">Hero subheading
                        <input className={input} value={content.hero.subheading}
                            onChange={e => contentSet({ ...content, hero: { ...content.hero, subheading: e.target.value } })} />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold">About
                        <textarea rows={5} className={input} value={content.about.body}
                            onChange={e => contentSet({ ...content, about: { ...content.about, body: e.target.value } })} />
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

                    <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                        <legend className="px-1 text-sm font-semibold">Services (name · price · minutes)</legend>
                        {content.services.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
                                <input className={input} value={item.name} onChange={e => {
                                    const items = [...content.services.items]; items[index] = { ...item, name: e.target.value }
                                    contentSet({ ...content, services: { ...content.services, items } })
                                }} />
                                <input className={input} value={item.price} onChange={e => {
                                    const items = [...content.services.items]; items[index] = { ...item, price: e.target.value }
                                    contentSet({ ...content, services: { ...content.services, items } })
                                }} />
                                <input className={input} type="number" min={5} step={5} value={item.durationMinutes ?? 30} onChange={e => {
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

                    <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                        <legend className="px-1 text-sm font-semibold">Opening hours</legend>
                        {content.hours.entries.map((entry, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                <input className={input} value={entry.label} onChange={e => {
                                    const entries = [...content.hours.entries]; entries[index] = { ...entry, label: e.target.value }
                                    contentSet({ ...content, hours: { ...content.hours, entries } })
                                }} />
                                <input className={input} value={entry.hours} onChange={e => {
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

                    <button type="button" disabled={busy} onClick={saveContent}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save changes
                    </button>
                </div>
            )}

            {tab === "Design" && (
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
                            <p className="text-sm font-semibold uppercase tracking-wide text-mist">Theme</p>
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
                                        <select value={currentValue} className="rounded-md border border-line bg-surface px-3 py-2 font-normal"
                                            onChange={e => configSet({ ...config, variantOverrides: { ...config.variantOverrides, [sectionType]: e.target.value } })}>
                                            {options.map(option => (
                                                <option key={option.variantId} value={option.variantId}>{option.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                )
                            })}
                        </div>

                        <button type="button" disabled={busy} onClick={saveConfig}
                            className="rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            Save design
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-line bg-surface">
                        <div className="max-h-[75vh] overflow-y-auto">
                            <TenantSite content={content} config={config} slug={props.slug} preview />
                        </div>
                    </div>
                </div>
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

                    <button type="button" disabled={busy} onClick={saveConfig}
                        className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                        Save add-ons
                    </button>
                </div>
            )}

            {tab === "Bookings" && (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="grid content-start gap-2">
                        {bookings.length === 0 && <p className="text-mist">No bookings yet.</p>}
                        {bookings.map(booking => (
                            <div key={booking.id} className="grid gap-1 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                <div className="grid gap-0.5 text-sm">
                                    <p className="font-semibold">{booking.serviceName} — {booking.customerName}</p>
                                    <p className="text-mist">{new Date(booking.startsAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
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
        </div>
    )
}
