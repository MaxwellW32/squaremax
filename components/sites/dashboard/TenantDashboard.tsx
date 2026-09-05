"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { SiteMeta, BusinessInfo, socialLinkSchema } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { addons, addonsForBundle, bundles, priceQuote, AddonId } from "@/lib/sites/addons"
import { PaymentRow } from "@/lib/sites/billing"
import { EffectiveStatus, effectiveStatus } from "@/lib/sites/status"
import { OrderRow } from "@/lib/sites/orders"
import { RenderableComponent, RenderablePage } from "@/components/sites/TenantSite"
import { ProductLite } from "@/lib/sites/sectionProps"
import { setBookingStatus, markMessageRead, setTenantAvailability, setTenantAddons } from "@/serverFunctions/handleTenants"
import { updateBusinessInfo } from "@/serverFunctions/handleSiteBuilder"
import WebsiteEditor from "./WebsiteEditor"
import SubscriptionTab, { BillingCurrency } from "./SubscriptionTab"
import StoreTab, { ProductRow, SaleRow, SalesSummary } from "./StoreTab"
import OrdersTab from "./OrdersTab"
import CustomersTab, { CustomerRow } from "./CustomersTab"
import MarketingTab, { AnnouncementRow } from "./MarketingTab"
import DomainCard from "./DomainCard"
import ImageField, { UploadContext } from "./ImageField"

//============================================================
// The tenant dashboard: run the whole business from a phone.
//  Overview   — what needs you now, a launch checklist, share tools
//  Website    — the canvas editor + site-wide design
//  Business   — the profile every component reads (phone, socials, SEO)
//  Orders     — website orders · Store — products, counter sales, reports
//  Bookings / Customers / Messages / Marketing — operations
//  Plan       — tools (add-ons), custom domain, paying, receipts
// Tabs live in the URL (?tab=) so payment callbacks and emails can
// deep-link, and the strip scrolls sideways on small screens.
//============================================================

export const dashboardTabIds = ["overview", "website", "business", "orders", "store", "bookings", "customers", "messages", "marketing", "plan"] as const
export type DashboardTabId = (typeof dashboardTabIds)[number]

const tabLabels: Record<DashboardTabId, string> = {
    overview: "Overview",
    website: "Website",
    business: "Business",
    orders: "Orders",
    store: "Store",
    bookings: "Bookings",
    customers: "Customers",
    messages: "Messages",
    marketing: "Marketing",
    plan: "Plan & billing",
}

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

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const input = "rounded-md border border-line bg-surface px-3 py-2 font-normal"
const card = "grid content-start gap-3 rounded-xl border border-line bg-surface p-5"
const eyebrow = "text-xs font-semibold uppercase tracking-wide text-mist"

//does any placed component carry a real image yet?
function hasAnyImage(components: RenderableComponent[], meta: SiteMeta): boolean {
    if (meta.business.logoUrl !== "") return true
    return components.some(component => /"(imageSrc|src|photoSrc|logoImageSrc|beforeSrc|afterSrc)":"(https?:)?\//.test(JSON.stringify(component.data)))
}

//has the owner told visitors what they sell?
function hasOffer(components: RenderableComponent[], products: ProductRow[]): boolean {
    if (products.some(product => product.active)) return true
    return components.some(component => {
        const data = component.data
        if (data.category === "services") return data.items.length > 0
        if (data.category === "priceList") return data.sections.some(section => section.items.length > 0)
        if (data.category === "pricingPlans") return data.plans.length > 0
        return false
    })
}

function csvCell(value: string | number | boolean): string {
    const text = String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export default function TenantDashboard(props: {
    tenantId: string
    slug: string
    liveUrl: string
    qrDataUrl: string
    initialTab: DashboardTabId
    justPaid: boolean
    checkoutCancelled: boolean
    status: EffectiveStatus
    currentPeriodEnd: string | null
    payments: PaymentRow[]
    paidDaysLeft: number
    renewBaseISO: string
    currency: BillingCurrency
    initialMeta: SiteMeta
    initialConfig: SiteConfig
    domain: { domain: string | null; aRecord: string | null }
    pages: RenderablePage[]
    components: RenderableComponent[]
    products: ProductRow[]
    sales: SaleRow[]
    salesSummary: SalesSummary | null
    orders: OrderRow[]
    customers: CustomerRow[]
    announcements: AnnouncementRow[]
    otherTenants: { id: string; businessName: string }[]
    bookings: BookingRow[]
    messages: MessageRow[]
    availability: AvailabilityRow[]
}) {
    const [tab, tabSetRaw] = useState<DashboardTabId>(props.initialTab)
    const [busy, busySet] = useState(false)

    const [meta, metaSet] = useState<SiteMeta>(props.initialMeta)
    const [config, configSet] = useState<SiteConfig>(props.initialConfig)
    //the plan tab can take the site offline / back online, so the badge and
    //the tab both read this rather than the server prop
    const [rawStatus, rawStatusSet] = useState<"draft" | "live" | "cancelled" | null>(null)
    const [bookings, bookingsSet] = useState(props.bookings)
    const [messages, messagesSet] = useState(props.messages)
    const [orders, ordersSet] = useState(props.orders)
    const [availability, availabilitySet] = useState<AvailabilityRow[]>(props.availability)
    const [showPastBookings, showPastBookingsSet] = useState(false)
    const [checklistDismissed, checklistDismissedSet] = useState(false)
    //"now" is fixed at mount so the upcoming/past split is stable across renders
    const [now] = useState(() => Date.now())

    const quote = priceQuote(config.enabledAddons)
    const monthly = quote.monthly

    //server-computed status until the owner flips the site off/on in this session
    const status: EffectiveStatus = rawStatus === null
        ? props.status
        : effectiveStatus({ status: rawStatus, currentPeriodEnd: props.currentPeriodEnd })

    const tabSet = (next: DashboardTabId) => {
        tabSetRaw(next)
        const url = new URL(window.location.href)
        url.searchParams.set("tab", next)
        url.searchParams.delete("paid")
        url.searchParams.delete("cancelled")
        window.history.replaceState(null, "", url.toString())
    }

    //payment callbacks land here with ?paid=1 / ?cancelled=1
    useEffect(() => {
        if (props.justPaid) toast.success("Payment received — thank you! Your site is covered.")
        if (props.checkoutCancelled) toast("Checkout closed — nothing was charged.")
        if (props.justPaid || props.checkoutCancelled) {
            const url = new URL(window.location.href)
            url.searchParams.delete("paid")
            url.searchParams.delete("cancelled")
            window.history.replaceState(null, "", url.toString())
        }
    }, [props.justPaid, props.checkoutCancelled])

    const run = async (work: () => Promise<unknown>, success: string) => {
        if (busy) return //disabled= only applies after re-render; block double-clicks
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

    const saveAddons = () => run(async () => {
        await setTenantAddons(props.tenantId, config.enabledAddons)
    }, "Tools saved")

    const setBusiness = (patch: Partial<BusinessInfo>) => metaSet({ ...meta, business: { ...meta.business, ...patch } })

    const toggleAddon = (id: AddonId) => {
        const enabledAddons: AddonId[] = config.enabledAddons.includes(id)
            ? config.enabledAddons.filter(candidate => candidate !== id)
            : [...config.enabledAddons, id]
        configSet({ ...config, enabledAddons })
    }

    const statusCopy: Record<EffectiveStatus, { label: string; className: string }> = {
        draft: { label: "Draft — not public yet", className: "bg-line text-mist" },
        active: { label: "Live", className: "bg-emerald-100 text-emerald-800" },
        grace: { label: "Payment due — still online", className: "bg-amber-100 text-amber-800" },
        suspended: { label: "Paused — renew to go back online", className: "bg-red-100 text-red-800" },
        cancelled: { label: "Offline", className: "bg-line text-mist" },
    }

    const newOrders = orders.filter(order => order.status === "new").length
    const pendingBookings = bookings.filter(booking => booking.status === "pending").length
    const unreadMessages = messages.filter(message => !message.read).length
    const storeOn = config.enabledAddons.includes("inventory")
    const bookingOn = config.enabledAddons.includes("booking")
    const hasShopSection = props.components.some(component => component.category === "products")

    const badges: Partial<Record<DashboardTabId, number>> = { orders: newOrders, bookings: pendingBookings, messages: unreadMessages }

    //launch checklist — the five things that turn a template into a business
    const checklist = useMemo(() => {
        const items: { id: string; label: string; done: boolean; tab: DashboardTabId; hint: string }[] = [
            { id: "contact", label: "Add your phone or WhatsApp", done: meta.business.phone !== "" || meta.business.whatsapp !== "", tab: "business", hint: "Every section reads it — contact, footer, orders." },
            { id: "offer", label: storeOn ? "Add your products" : "List your services or menu", done: hasOffer(props.components, props.products), tab: storeOn ? "store" : "website", hint: storeOn ? "Products show in your shop section with an order form." : "Click the Services section on your site and fill it in." },
            { id: "photos", label: "Add a photo or your logo", done: hasAnyImage(props.components, meta), tab: "website", hint: "Tap any image spot on your site, then Upload." },
            ...(bookingOn ? [{ id: "hours", label: "Set your weekly hours", done: availability.length > 0, tab: "bookings" as DashboardTabId, hint: "Customers can only book inside these hours." }] : []),
            { id: "live", label: "Go live", done: status === "active" || status === "grace", tab: "plan", hint: "Your first payment publishes the site." },
        ]
        return items
    }, [meta, storeOn, bookingOn, availability.length, status, props.components, props.products])
    const checklistDone = checklist.filter(item => item.done).length
    const showChecklist = !checklistDismissed && checklistDone < checklist.length

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(props.liveUrl)
            toast.success("Link copied")
        } catch {
            toast.error("couldn't copy — long-press the link instead")
        }
    }

    const exportCustomers = () => {
        const rows = [
            ["Name", "Email", "Phone", "Email updates", "WhatsApp updates", "Joined"],
            ...props.customers.map(customer => [
                customer.name, customer.email, customer.phone, customer.notifyEmail ? "yes" : "no", customer.notifyWhatsapp ? "yes" : "no",
                new Date(customer.createdAt).toISOString().slice(0, 10),
            ]),
        ]
        const csv = rows.map(row => row.map(csvCell).join(",")).join("\n")
        const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }))
        const link = document.createElement("a")
        link.href = url
        link.download = `${props.slug}-customers.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const upcomingBookings = bookings
        .filter(booking => booking.status !== "cancelled" && new Date(booking.startsAt).getTime() >= now)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    const pastBookings = bookings.filter(booking => !upcomingBookings.includes(booking))

    const banner: { title: string; body: string; cta: string } | null =
        status === "draft" ? { title: "Your site isn't public yet", body: "Finish the checklist below, then pay for your first month to publish it. Nothing goes live until you say so.", cta: `Publish for US$${monthly}` }
            : status === "grace" ? { title: "Your paid period has ended", body: "Your site stays online for a few more days. Renew now and nothing changes for your visitors.", cta: "Renew now" }
                : status === "suspended" ? { title: "Your site is paused", body: "Visitors currently see a holding page. Renew and it's back instantly, exactly as you left it.", cta: "Renew now" }
                    : status === "cancelled" ? { title: "You took your site offline", body: "Nothing was deleted. Bring it back whenever you like.", cta: "Bring it back" }
                        : null

    return (
        <UploadContext.Provider value={{ tenantId: props.tenantId }}>
            <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:py-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h1 className="truncate font-display text-2xl font-bold normal-case md:text-3xl">{meta.business.name}</h1>
                        <a href={props.liveUrl} target="_blank" rel="noreferrer" className="truncate font-mono text-sm text-cobalt hover:underline">
                            {props.liveUrl.replace(/^https?:\/\//, "")} ↗
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/sites/start" className="hidden rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:border-cobalt hover:text-cobalt sm:inline-block">
                            + New site
                        </Link>
                        <button type="button" onClick={() => tabSet("plan")} className={`rounded-full px-3 py-1 text-sm font-semibold ${statusCopy[status].className}`}>
                            {statusCopy[status].label}
                        </button>
                    </div>
                </div>

                {/* tab strip: sticky under the header, scrolls sideways on phones */}
                <nav aria-label="Dashboard sections" className="sticky top-16 z-30 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur">
                    <div className="-mb-px flex gap-1 overflow-x-auto pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {dashboardTabIds.map(id => {
                            const badge = badges[id] ?? 0
                            return (
                                <button key={id} type="button" onClick={() => tabSet(id)} aria-current={tab === id ? "page" : undefined}
                                    className={`shrink-0 whitespace-nowrap px-3 py-3 text-sm font-semibold ${tab === id ? "border-b-2 border-cobalt text-ink" : "border-b-2 border-transparent text-mist hover:text-ink"}`}>
                                    {tabLabels[id]}
                                    {badge > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-xs text-white ${id === "messages" ? "bg-brand" : "bg-cobalt"}`}>{badge}</span>}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* ================= OVERVIEW ================= */}
                {tab === "overview" && (
                    <div className="grid gap-4">
                        {banner !== null && (
                            <div className={`grid gap-2 rounded-xl border-2 p-5 sm:flex sm:items-center sm:justify-between ${status === "suspended" ? "border-red-400 bg-red-50" : status === "grace" ? "border-amber-400 bg-amber-50" : "border-cobalt/40 bg-surface"}`}>
                                <div className="grid gap-0.5">
                                    <p className="font-display text-lg font-bold">{banner.title}</p>
                                    <p className="max-w-xl text-sm text-mist">{banner.body}</p>
                                </div>
                                <button type="button" onClick={() => tabSet("plan")} className="w-fit rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink">
                                    {banner.cta}
                                </button>
                            </div>
                        )}

                        {/* what needs you now */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {storeOn && (
                                <button type="button" onClick={() => tabSet("orders")} className={`grid gap-0.5 rounded-xl border p-4 text-left ${newOrders > 0 ? "border-cobalt bg-cobalt/5" : "border-line bg-surface"}`}>
                                    <span className="font-display text-3xl font-bold">{newOrders}</span>
                                    <span className="text-sm text-mist">new order{newOrders === 1 ? "" : "s"}</span>
                                </button>
                            )}
                            {bookingOn && (
                                <button type="button" onClick={() => tabSet("bookings")} className={`grid gap-0.5 rounded-xl border p-4 text-left ${pendingBookings > 0 ? "border-cobalt bg-cobalt/5" : "border-line bg-surface"}`}>
                                    <span className="font-display text-3xl font-bold">{pendingBookings}</span>
                                    <span className="text-sm text-mist">booking{pendingBookings === 1 ? "" : "s"} to confirm</span>
                                </button>
                            )}
                            <button type="button" onClick={() => tabSet("messages")} className={`grid gap-0.5 rounded-xl border p-4 text-left ${unreadMessages > 0 ? "border-brand bg-brand/5" : "border-line bg-surface"}`}>
                                <span className="font-display text-3xl font-bold">{unreadMessages}</span>
                                <span className="text-sm text-mist">unread message{unreadMessages === 1 ? "" : "s"}</span>
                            </button>
                            {storeOn && props.salesSummary !== null ? (
                                <button type="button" onClick={() => tabSet("store")} className="grid gap-0.5 rounded-xl border border-line bg-surface p-4 text-left">
                                    <span className="font-display text-3xl font-bold">${(props.salesSummary.revenueCents / 100).toFixed(0)}</span>
                                    <span className="text-sm text-mist">sales this month</span>
                                </button>
                            ) : (
                                <button type="button" onClick={() => tabSet("customers")} className="grid gap-0.5 rounded-xl border border-line bg-surface p-4 text-left">
                                    <span className="font-display text-3xl font-bold">{props.customers.length}</span>
                                    <span className="text-sm text-mist">customer account{props.customers.length === 1 ? "" : "s"}</span>
                                </button>
                            )}
                        </div>

                        <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
                            {/* launch checklist */}
                            {showChecklist ? (
                                <div className={card}>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className={eyebrow}>Get set up · {checklistDone}/{checklist.length} done</p>
                                        <button type="button" onClick={() => checklistDismissedSet(true)} className="text-xs text-mist hover:text-ink">Hide</button>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-line">
                                        <div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${(checklistDone / checklist.length) * 100}%` }} />
                                    </div>
                                    <ul className="grid gap-1.5">
                                        {checklist.map(item => (
                                            <li key={item.id}>
                                                <button type="button" onClick={() => tabSet(item.tab)} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${item.done ? "border-line bg-surface/60" : "border-line bg-paper hover:border-cobalt"}`}>
                                                    <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold ${item.done ? "bg-emerald-600 text-white" : "border-2 border-line"}`}>{item.done ? "✓" : ""}</span>
                                                    <span className="grid gap-0.5">
                                                        <span className={`text-sm font-semibold ${item.done ? "text-mist line-through" : ""}`}>{item.label}</span>
                                                        {!item.done && <span className="text-xs text-mist">{item.hint}</span>}
                                                    </span>
                                                    {!item.done && <span className="ml-auto text-xs font-semibold text-cobalt">Do it →</span>}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className={card}>
                                    <p className={eyebrow}>Your site</p>
                                    <p className="text-sm text-mist">
                                        <strong className="text-ink">{props.pages.length}</strong> page{props.pages.length === 1 ? "" : "s"} · <strong className="text-ink">{props.components.length}</strong> sections ·{" "}
                                        <strong className="text-ink">{props.customers.length}</strong> customer account{props.customers.length === 1 ? "" : "s"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => tabSet("website")} className="rounded-lg bg-cobalt px-4 py-2 text-sm font-display font-bold text-white hover:bg-ink">Edit my site</button>
                                        <button type="button" onClick={() => tabSet("business")} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink">Business details</button>
                                    </div>
                                    <p className="text-xs text-mist">Tip: on the Website tab, tap any part of your site to change it. Swap a design and your words stay.</p>
                                </div>
                            )}

                            {/* share */}
                            <div className={card}>
                                <p className={eyebrow}>Share your site</p>
                                <div className="flex items-center gap-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={props.qrDataUrl} alt={`QR code for ${props.liveUrl}`} className="size-24 rounded-lg border border-line bg-white p-1" />
                                    <div className="grid min-w-0 gap-1.5 text-sm">
                                        <p className="truncate font-mono text-xs text-mist">{props.liveUrl.replace(/^https?:\/\//, "")}</p>
                                        <button type="button" onClick={copyLink} className="w-fit rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white hover:bg-ink">Copy link</button>
                                        <a href={`https://wa.me/?text=${encodeURIComponent(`${meta.business.name} — ${props.liveUrl}`)}`} target="_blank" rel="noreferrer" className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-semibold hover:border-emerald-600 hover:text-emerald-700">Share on WhatsApp</a>
                                        <a href={props.qrDataUrl} download={`${props.slug}-qr.png`} className="w-fit text-xs font-semibold text-cobalt hover:underline">Download QR for the counter</a>
                                    </div>
                                </div>
                                <p className="text-xs text-mist">Put the link in your Instagram bio and WhatsApp Business profile. Print the QR for the counter and your flyers.</p>
                            </div>
                        </div>

                        <div className="grid gap-1 rounded-xl border border-line bg-surface p-5 text-sm sm:flex sm:items-center sm:justify-between">
                            <div className="grid gap-0.5">
                                <p className={eyebrow}>Plan</p>
                                <p><span className="font-display text-xl font-bold">US${monthly}/month</span>{quote.bundle !== null && <span className="ml-2 text-xs font-semibold text-emerald-700">{quote.bundle.name}</span>}</p>
                                <p className="text-mist">
                                    {props.currentPeriodEnd !== null
                                        ? `Paid through ${new Date(props.currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/Jamaica" })} — ${props.paidDaysLeft} day${props.paidDaysLeft === 1 ? "" : "s"} left`
                                        : "No active period yet."}
                                </p>
                            </div>
                            <button type="button" onClick={() => tabSet("plan")} className="w-fit rounded-lg border border-ink px-4 py-2 font-display font-bold hover:bg-ink hover:text-white">
                                {status === "active" ? "Manage plan" : `Pay US$${monthly} & go live`}
                            </button>
                        </div>
                    </div>
                )}

                {/* ================= WEBSITE ================= */}
                {tab === "website" && (
                    <WebsiteEditor
                        tenantId={props.tenantId}
                        slug={props.slug}
                        meta={meta}
                        config={config}
                        onConfigChange={configSet}
                        initialPages={props.pages}
                        initialComponents={props.components}
                        products={props.products.filter(product => product.active).map((product): ProductLite => ({
                            id: product.id, name: product.name, description: product.description,
                            priceCents: product.priceCents, imageSrc: product.imageSrc, taxRateBps: product.taxRateBps,
                            stock: product.stock, trackStock: product.trackStock,
                        }))}
                    />
                )}

                {/* ================= BUSINESS ================= */}
                {tab === "business" && (
                    <div className="grid max-w-2xl gap-4">
                        <p className="text-sm text-mist">Every section of your site reads these — change your number once and it updates everywhere.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="grid gap-1 text-sm font-semibold">Business name
                                <input className={input} value={meta.business.name} onChange={e => setBusiness({ name: e.target.value })} />
                            </label>
                            <label className="grid gap-1 text-sm font-semibold">Tagline
                                <input className={input} placeholder="Sharp cuts, no waiting" value={meta.business.tagline} onChange={e => setBusiness({ tagline: e.target.value })} />
                            </label>
                        </div>
                        <label className="grid gap-1 text-sm font-semibold">About your business
                            <textarea rows={3} className={input} value={meta.business.description} onChange={e => setBusiness({ description: e.target.value })} />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="grid gap-1 text-sm font-semibold">Phone
                                <input className={input} type="tel" inputMode="tel" placeholder="876-555-0142" value={meta.business.phone} onChange={e => setBusiness({ phone: e.target.value })} />
                            </label>
                            <label className="grid gap-1 text-sm font-semibold">WhatsApp number
                                <input className={input} type="tel" inputMode="tel" placeholder="18765550142" value={meta.business.whatsapp} onChange={e => setBusiness({ whatsapp: e.target.value })} />
                                <span className="text-xs font-normal text-mist">Digits only, with country code: 1876… for Jamaica. Powers the WhatsApp buttons and order messages.</span>
                            </label>
                            <label className="grid gap-1 text-sm font-semibold">Email
                                <input className={input} type="email" inputMode="email" value={meta.business.email} onChange={e => setBusiness({ email: e.target.value })} />
                                <span className="text-xs font-normal text-mist">Where booking, order and message alerts go (with the Notifications tool).</span>
                            </label>
                            <label className="grid gap-1 text-sm font-semibold">Address
                                <input className={input} value={meta.business.address} onChange={e => setBusiness({ address: e.target.value })} />
                            </label>
                        </div>
                        <ImageField label="Logo" value={meta.business.logoUrl} onChange={logoUrl => setBusiness({ logoUrl })} />

                        <fieldset className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                            <legend className="px-1 text-sm font-semibold">Social links</legend>
                            {meta.business.socials.map((social, socialIndex) => (
                                <div key={socialIndex} className="grid grid-cols-[110px_1fr_auto] gap-2 sm:grid-cols-[130px_1fr_auto]">
                                    <select className={input} value={social.platform} onChange={e => {
                                        const socials = [...meta.business.socials]
                                        socials[socialIndex] = { ...social, platform: socialLinkSchema.shape.platform.parse(e.target.value) }
                                        setBusiness({ socials })
                                    }}>
                                        {socialLinkSchema.shape.platform.options.map(platform => (
                                            <option key={platform} value={platform}>{platform}</option>
                                        ))}
                                    </select>
                                    <input className={`${input} min-w-0`} placeholder="https://…" inputMode="url" value={social.url} onChange={e => {
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

                        <details className="rounded-lg border border-line p-4">
                            <summary className="cursor-pointer text-sm font-semibold">Search engine settings (optional)</summary>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <label className="grid gap-1 text-sm font-semibold">Title in Google
                                    <input className={input} placeholder={`${meta.business.name}${meta.business.tagline !== "" ? ` — ${meta.business.tagline}` : ""}`} value={meta.seo.title} onChange={e => metaSet({ ...meta, seo: { ...meta.seo, title: e.target.value } })} />
                                </label>
                                <label className="grid gap-1 text-sm font-semibold">Description in Google
                                    <input className={input} value={meta.seo.description} onChange={e => metaSet({ ...meta, seo: { ...meta.seo, description: e.target.value } })} />
                                </label>
                            </div>
                        </details>

                        <button type="button" disabled={busy} onClick={saveBusiness}
                            className="w-fit rounded-lg bg-cobalt px-6 py-3 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                            Save business info
                        </button>
                    </div>
                )}

                {/* ================= ORDERS ================= */}
                {tab === "orders" && (
                    <OrdersTab
                        tenantId={props.tenantId}
                        enabled={storeOn}
                        hasShopSection={hasShopSection}
                        initialOrders={orders}
                        onOrdersChange={ordersSet}
                        onOpenStore={() => tabSet("plan")}
                    />
                )}

                {/* ================= STORE ================= */}
                {tab === "store" && (
                    <StoreTab
                        tenantId={props.tenantId}
                        enabled={storeOn}
                        initialProducts={props.products}
                        initialSales={props.sales}
                        initialSummary={props.salesSummary}
                    />
                )}

                {/* ================= CUSTOMERS ================= */}
                {tab === "customers" && (
                    <div className="grid gap-3">
                        {props.customers.length > 0 && (
                            <button type="button" onClick={exportCustomers} className="w-fit rounded-md border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white">
                                ⬇ Export customers (CSV)
                            </button>
                        )}
                        <CustomersTab tenantId={props.tenantId} initialCustomers={props.customers} otherTenants={props.otherTenants} />
                    </div>
                )}

                {/* ================= BOOKINGS ================= */}
                {tab === "bookings" && (
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                        <div className="grid content-start gap-3">
                            {!bookingOn && (
                                <p className="rounded-lg border border-line bg-surface p-4 text-sm text-mist">
                                    Online booking is off. Turn on the <strong className="text-ink">Online booking</strong> tool in Plan &amp; billing and customers can book themselves in from your site, 24/7.
                                </p>
                            )}
                            <p className={eyebrow}>Upcoming · {upcomingBookings.length}</p>
                            {upcomingBookings.length === 0 && <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-mist">No upcoming bookings.</p>}
                            {upcomingBookings.map(booking => (
                                <BookingCard key={booking.id} booking={booking} busy={busy} onConfirm={() => run(async () => {
                                    await setBookingStatus(props.tenantId, booking.id, "confirmed")
                                    bookingsSet(prev => prev.map(b => b.id === booking.id ? { ...b, status: "confirmed" } : b))
                                }, "Booking confirmed — the customer has been told")} onCancel={() => run(async () => {
                                    await setBookingStatus(props.tenantId, booking.id, "cancelled")
                                    bookingsSet(prev => prev.map(b => b.id === booking.id ? { ...b, status: "cancelled" } : b))
                                }, "Booking cancelled")} />
                            ))}

                            {pastBookings.length > 0 && (
                                <button type="button" onClick={() => showPastBookingsSet(open => !open)} className="w-fit text-xs font-semibold text-mist hover:text-ink">
                                    {showPastBookings ? "Hide" : "Show"} {pastBookings.length} past or cancelled booking{pastBookings.length === 1 ? "" : "s"}
                                </button>
                            )}
                            {showPastBookings && pastBookings.map(booking => (
                                <BookingCard key={booking.id} booking={booking} busy={busy} muted />
                            ))}
                        </div>

                        {/* weekly availability — rounded rows + status dots (cheers-style) */}
                        <div className="grid h-fit content-start gap-2.5 rounded-2xl border border-line bg-surface p-5">
                            <p className={eyebrow}>Weekly hours</p>
                            <p className="-mt-1 text-xs text-mist">The times customers can book. Tap a day to open or close it.</p>
                            {dayNames.map((dayName, dayOfWeek) => {
                                const rule = availability.find(r => r.dayOfWeek === dayOfWeek)
                                const open = rule !== undefined
                                return (
                                    <div
                                        key={dayName}
                                        className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${open ? "border-emerald-500/40 bg-paper" : "border-line bg-surface/60"}`}
                                    >
                                        <button
                                            type="button"
                                            aria-label={open ? `Close ${dayName}` : `Open ${dayName}`}
                                            onClick={() => availabilitySet(prev => open
                                                ? prev.filter(r => r.dayOfWeek !== dayOfWeek)
                                                : [...prev, { dayOfWeek, openTime: "09:00", closeTime: "17:00", slotMinutes: 30 }])}
                                            className={`flex min-w-24 items-center gap-2 text-sm ${open ? "font-semibold text-ink" : "text-mist"}`}
                                        >
                                            <span aria-hidden className={`h-2 w-2 rounded-full ${open ? "bg-emerald-500" : "bg-line"}`} />
                                            {dayName.slice(0, 3)}
                                        </button>

                                        {open ? (
                                            <span className="ml-auto flex items-center gap-1.5">
                                                <input type="time" value={rule.openTime}
                                                    className="rounded-xl border border-line bg-surface px-2 py-1.5 text-xs outline-none transition-colors focus:border-cobalt"
                                                    onChange={e => availabilitySet(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, openTime: e.target.value } : r))} />
                                                <span className="text-xs text-mist">to</span>
                                                <input type="time" value={rule.closeTime}
                                                    className="rounded-xl border border-line bg-surface px-2 py-1.5 text-xs outline-none transition-colors focus:border-cobalt"
                                                    onChange={e => availabilitySet(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, closeTime: e.target.value } : r))} />
                                            </span>
                                        ) : (
                                            <span className="ml-auto text-xs text-mist">Closed</span>
                                        )}
                                    </div>
                                )
                            })}
                            <button type="button" disabled={busy} onClick={() => run(() => setTenantAvailability(props.tenantId, availability), "Hours saved")}
                                className="mt-1.5 rounded-xl bg-cobalt px-5 py-2.5 text-sm font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                                Save hours
                            </button>
                        </div>
                    </div>
                )}

                {/* ================= MESSAGES ================= */}
                {tab === "messages" && (
                    <div className="grid max-w-2xl gap-2">
                        {messages.length === 0 && <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-mist">No messages yet — the contact form on your site delivers here.</p>}
                        {messages.map(message => (
                            <div key={message.id} className={`grid gap-1 rounded-lg border p-4 ${message.read ? "border-line bg-surface/60" : "border-cobalt bg-surface"}`}>
                                <div className="flex items-baseline justify-between gap-2 text-sm">
                                    <p className="font-semibold">{message.name} <a className="font-normal text-cobalt hover:underline" href={`mailto:${message.email}`}>{message.email}</a></p>
                                    <span className="text-xs text-mist">{new Date(message.createdAt).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "America/Jamaica" })}</span>
                                </div>
                                <p className="whitespace-pre-line text-sm text-mist">{message.body}</p>
                                <div className="flex gap-3">
                                    <a className="text-xs font-semibold text-cobalt hover:underline" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: your message to ${meta.business.name}`)}`}>Reply by email</a>
                                    {!message.read && (
                                        <button type="button" disabled={busy} className="text-xs font-semibold text-mist hover:text-ink"
                                            onClick={() => run(async () => {
                                                await markMessageRead(props.tenantId, message.id)
                                                messagesSet(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m))
                                            }, "Marked read")}>
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ================= MARKETING ================= */}
                {tab === "marketing" && (
                    <MarketingTab
                        tenantId={props.tenantId}
                        enabled={config.enabledAddons.includes("notifications")}
                        customerCount={props.customers.length}
                        initialAnnouncements={props.announcements}
                    />
                )}

                {/* ================= PLAN & BILLING ================= */}
                {tab === "plan" && (
                    <div className="grid gap-4">
                        {/* tools */}
                        <div className={card}>
                            <div className="grid gap-0.5">
                                <p className={eyebrow}>Your tools</p>
                                <p className="text-sm text-mist">Switch tools on or off any time. Bundles apply themselves — you always pay the lowest price for what&apos;s on.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {bundles.map(bundle => {
                                    const active = quote.bundle?.id === bundle.id
                                    return (
                                        <button key={bundle.id} type="button" onClick={() => configSet({ ...config, enabledAddons: addonsForBundle(bundle.id) })}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-line text-mist hover:border-ink hover:text-ink"}`}>
                                            {bundle.name} · US${bundle.monthlyPrice}/mo{bundle.recommended && !active ? " ★" : ""}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="grid gap-2">
                                {addons.map(addon => {
                                    const enabled = config.enabledAddons.includes(addon.id)
                                    const comingSoon = addon.status === "coming-soon"
                                    return (
                                        <label key={addon.id} className={`flex items-start gap-3 rounded-lg border p-3.5 ${comingSoon ? "border-line opacity-60" : enabled ? "border-cobalt bg-paper" : "border-line bg-surface/60"}`}>
                                            <input type="checkbox" disabled={comingSoon} checked={enabled} className="mt-1 size-4 accent-cobalt" onChange={() => toggleAddon(addon.id)} />
                                            <span className="grid gap-0.5">
                                                <span className="flex flex-wrap items-center gap-2 font-semibold normal-case">
                                                    {addon.name} <span className="text-sm text-cobalt">+${addon.monthlyPrice}/mo</span>
                                                    {comingSoon && <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-mist">Coming soon</span>}
                                                </span>
                                                <span className="text-sm font-normal normal-case text-mist">{addon.blurb}</span>
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-ink px-4 py-3 text-white">
                                <p className="font-display text-lg font-bold">US${monthly}/month</p>
                                <p className="text-sm text-white/80">
                                    {quote.savings > 0 ? `${quote.bundle?.name} — saving $${quote.savings}/mo` : quote.itemized > monthly ? "" : "Website + selected tools"}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button type="button" disabled={busy} onClick={saveAddons}
                                    className="rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                                    Save tools
                                </button>
                                <p className="text-xs text-mist">Changes show on your site immediately; the new price applies from your next payment.</p>
                            </div>
                        </div>

                        <DomainCard
                            tenantId={props.tenantId}
                            slug={props.slug}
                            enabled={props.initialConfig.enabledAddons.includes("custom-domain") || config.enabledAddons.includes("custom-domain")}
                            initialDomain={props.domain.domain}
                            aRecord={props.domain.aRecord}
                            onEnableAddon={() => { if (!config.enabledAddons.includes("custom-domain")) toggleAddon("custom-domain") }}
                        />

                        <SubscriptionTab
                            tenantId={props.tenantId}
                            status={status}
                            currentPeriodEnd={props.currentPeriodEnd}
                            enabledAddons={config.enabledAddons}
                            initialPayments={props.payments}
                            paidDaysLeft={props.paidDaysLeft}
                            renewBaseISO={props.renewBaseISO}
                            currency={props.currency}
                            onStatusChange={rawStatusSet}
                        />
                    </div>
                )}
            </div>
        </UploadContext.Provider>
    )
}

function BookingCard({ booking, busy, muted, onConfirm, onCancel }: {
    booking: BookingRow
    busy: boolean
    muted?: boolean
    onConfirm?: () => void
    onCancel?: () => void
}) {
    const phoneDigits = booking.customerPhone.replace(/\D/g, "")
    return (
        <div className={`grid gap-2 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-center ${muted ? "border-line bg-surface/60 opacity-80" : booking.status === "pending" ? "border-cobalt/50 bg-surface" : "border-line bg-surface"}`}>
            <div className="grid gap-0.5 text-sm">
                <p className="font-semibold">{booking.serviceName} — {booking.customerName}</p>
                <p className="text-mist">{new Date(booking.startsAt).toLocaleString("en-US", { weekday: "short", dateStyle: undefined, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Jamaica" })}</p>
                <p className="flex flex-wrap gap-x-3 text-xs">
                    {booking.customerPhone !== "" && <a className="text-cobalt hover:underline" href={`tel:${booking.customerPhone}`}>📞 {booking.customerPhone}</a>}
                    {phoneDigits !== "" && <a className="text-emerald-700 hover:underline" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
                    <a className="text-cobalt hover:underline" href={`mailto:${booking.customerEmail}`}>✉️ {booking.customerEmail}</a>
                </p>
                {booking.notes !== "" && <p className="text-xs italic text-mist">“{booking.notes}”</p>}
            </div>
            <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : booking.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-line text-mist"}`}>{booking.status}</span>
                {onConfirm !== undefined && booking.status === "pending" && (
                    <button type="button" disabled={busy} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50" onClick={onConfirm}>
                        Confirm
                    </button>
                )}
                {onCancel !== undefined && booking.status !== "cancelled" && (
                    <button type="button" disabled={busy} className="rounded-md border border-line px-3 py-1.5 text-xs font-bold text-mist hover:text-brand disabled:opacity-50" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}
