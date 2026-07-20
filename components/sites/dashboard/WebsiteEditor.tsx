"use client"
import React, { useMemo, useState } from "react"
import toast from "react-hot-toast"
import TenantSite, { RenderableComponent, RenderablePage } from "@/components/sites/TenantSite"
import { SiteMeta, ComponentData, categoryLabels } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { ComponentStyles } from "@/lib/sites/styles"
import { ThemeColors } from "@/lib/sites/themes"
import { ProductLite } from "@/lib/sites/sectionProps"
import { variantsById, VariantEntry } from "@/lib/sites/registry"
import { sortByOrder, PAGE_LIMIT } from "@/lib/sites/site"
import { siteTemplates } from "@/lib/sites/siteTemplates"
import ComponentDataForm from "./editorForms"
import ComponentPicker, { PickerMode } from "./ComponentPicker"
import {
    addComponent, addSitePage, applySiteTemplate, deleteComponent, deleteSitePage,
    getSiteForOwner, moveComponent, relocateComponent, swapComponentVariant,
    updateComponentData, updateComponentStyles, updateSitePage,
} from "@/serverFunctions/handleSiteBuilder"

//============================================================
// The website editor: pages on the left, the selected location's
// components as an ordered list, a detail panel for the selected
// instance (its own data + design + style), and a live preview.
// Every structural change goes through a server action, then the
// whole site is re-fetched — simple and always consistent.
//============================================================

type Location = { region: "header" } | { region: "footer" } | { region: "main"; pageId: string }

const input = "rounded-md border border-line bg-surface px-3 py-2 text-sm font-normal"
const primaryButton = "rounded-lg bg-cobalt px-4 py-2 text-sm font-display font-bold text-white hover:bg-ink disabled:opacity-50"
const quietButton = "rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:text-ink"

const tokenLabels: Record<keyof ThemeColors, string> = {
    background: "Background",
    surface: "Card surface",
    text: "Text",
    textMuted: "Muted text",
    primary: "Primary",
    primaryContrast: "On primary",
    accent: "Accent",
    border: "Borders",
}

export default function WebsiteEditor(props: {
    tenantId: string
    slug: string
    meta: SiteMeta
    config: SiteConfig
    initialPages: RenderablePage[]
    initialComponents: RenderableComponent[]
    products?: ProductLite[]
}) {
    const [pages, pagesSet] = useState<RenderablePage[]>(sortByOrder(props.initialPages))
    const [components, componentsSet] = useState<RenderableComponent[]>(props.initialComponents)
    const [location, locationSet] = useState<Location>({ region: "main", pageId: sortByOrder(props.initialPages)[0]?.id ?? "" })
    const [selectedId, selectedIdSet] = useState<string | null>(null)
    const [busy, busySet] = useState(false)

    //local unsaved edits for the selected component
    const [draftData, draftDataSet] = useState<ComponentData | null>(null)
    const [draftStyles, draftStylesSet] = useState<ComponentStyles | null>(null)

    //page manager state
    const [newPageTitle, newPageTitleSet] = useState("")
    const [pickerMode, pickerModeSet] = useState<PickerMode | null>(null)

    const homePage = pages.find(page => page.slug === "") ?? pages[0]
    const currentPageId = location.region === "main" ? location.pageId : homePage?.id ?? ""

    const locationComponents = useMemo(() => sortByOrder(components.filter(component =>
        component.region === (location.region === "main" ? "main" : location.region) &&
        (location.region !== "main" || component.pageId === location.pageId),
    )), [components, location])

    const selected = components.find(component => component.id === selectedId) ?? null

    const refresh = async () => {
        const site = await getSiteForOwner(props.tenantId)
        pagesSet(sortByOrder(site.pages))
        componentsSet(site.components)
        return site
    }

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

    const select = (component: RenderableComponent | null) => {
        selectedIdSet(component?.id ?? null)
        draftDataSet(component?.data ?? null)
        draftStylesSet(component?.styles ?? { tokens: {}, css: "" })
    }

    //preview reflects unsaved edits of the selected component instantly
    const previewComponents = useMemo(() => components.map(component => {
        if (component.id !== selectedId) return component
        return {
            ...component,
            data: draftData ?? component.data,
            styles: draftStyles ?? component.styles,
        }
    }), [components, selectedId, draftData, draftStyles])

    return (
        <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
            {/* ============ left: structure + editing ============ */}
            <div className="grid content-start gap-4">
                {/* location switcher */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => { locationSet({ region: "header" }); select(null) }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${location.region === "header" ? "bg-ink text-white" : "border border-line text-mist hover:text-ink"}`}>
                        Header
                    </button>
                    {pages.map(page => (
                        <button key={page.id} type="button" onClick={() => { locationSet({ region: "main", pageId: page.id }); select(null) }}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${location.region === "main" && location.pageId === page.id ? "bg-cobalt text-white" : "border border-line text-mist hover:text-ink"}`}>
                            {page.slug === "" ? "Home" : page.title}
                        </button>
                    ))}
                    <button type="button" onClick={() => { locationSet({ region: "footer" }); select(null) }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${location.region === "footer" ? "bg-ink text-white" : "border border-line text-mist hover:text-ink"}`}>
                        Footer
                    </button>
                </div>

                {/* page management for the selected page */}
                {location.region === "main" && (() => {
                    const page = pages.find(candidate => candidate.id === location.pageId)
                    if (page === undefined) return null
                    return (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2">
                            <input className={input} value={page.title} aria-label="Page title"
                                onChange={e => pagesSet(prev => prev.map(candidate => candidate.id === page.id ? { ...candidate, title: e.target.value } : candidate))} />
                            {page.slug !== "" && (
                                <span className="font-mono text-xs text-mist">/{props.slug}/{page.slug}</span>
                            )}
                            <button type="button" disabled={busy} className={quietButton}
                                onClick={() => run(async () => {
                                    await updateSitePage(props.tenantId, page.id, { slug: page.slug, title: page.title })
                                }, "Page saved")}>
                                Save name
                            </button>
                            {page.slug !== "" && (
                                <button type="button" disabled={busy} className={`${quietButton} hover:text-brand`}
                                    onClick={() => {
                                        if (!window.confirm(`Delete the "${page.title}" page and everything on it?`)) return
                                        run(async () => {
                                            await deleteSitePage(props.tenantId, page.id)
                                            const site = await refresh()
                                            const home = sortByOrder(site.pages).find(candidate => candidate.slug === "")
                                            locationSet({ region: "main", pageId: home?.id ?? "" })
                                            select(null)
                                        }, "Page deleted")
                                    }}>
                                    Delete page
                                </button>
                            )}
                        </div>
                    )
                })()}

                {/* new page */}
                {pages.length < PAGE_LIMIT && (
                    <div className="flex flex-wrap items-center gap-2">
                        <input className={input} placeholder="New page name (e.g. About)" value={newPageTitle} onChange={e => newPageTitleSet(e.target.value)} />
                        <button type="button" disabled={busy || newPageTitle.trim() === ""} className={quietButton}
                            onClick={() => run(async () => {
                                const title = newPageTitle.trim()
                                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
                                if (slug === "") throw new Error("give the page a simple name")
                                const created = await addSitePage(props.tenantId, { slug, title })
                                await refresh()
                                locationSet({ region: "main", pageId: created.id })
                                newPageTitleSet("")
                            }, "Page added")}>
                            + Add page
                        </button>
                        <span className="text-xs text-mist">{pages.length}/{PAGE_LIMIT} pages</span>
                    </div>
                )}

                {/* component list for this location */}
                <div className="grid gap-1.5">
                    {locationComponents.length === 0 && (
                        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-mist">
                            Nothing here yet — add your first component below.
                        </p>
                    )}
                    {locationComponents.map((component, componentIndex) => (
                        <div key={component.id}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${selectedId === component.id ? "border-cobalt bg-surface" : "border-line bg-surface/60 hover:border-mist"}`}>
                            <button type="button" className="grid grow gap-0.5 text-left" onClick={() => select(component)}>
                                <span className="text-sm font-semibold">{categoryLabels[component.category]}</span>
                                <span className="text-xs text-mist">{variantsById[component.variantId]?.label ?? component.variantId}</span>
                            </button>
                            <button type="button" aria-label="Move up" disabled={busy || componentIndex === 0} className={quietButton}
                                onClick={() => run(async () => { await moveComponent(props.tenantId, component.id, "up"); await refresh() })}>↑</button>
                            <button type="button" aria-label="Move down" disabled={busy || componentIndex === locationComponents.length - 1} className={quietButton}
                                onClick={() => run(async () => { await moveComponent(props.tenantId, component.id, "down"); await refresh() })}>↓</button>
                            <button type="button" aria-label="Delete component" disabled={busy} className={`${quietButton} hover:text-brand`}
                                onClick={() => {
                                    if (!window.confirm(`Remove this ${categoryLabels[component.category].toLowerCase()}?`)) return
                                    run(async () => {
                                        await deleteComponent(props.tenantId, component.id)
                                        if (selectedId === component.id) select(null)
                                        await refresh()
                                    }, "Removed")
                                }}>×</button>
                        </div>
                    ))}
                </div>

                {/* add component — opens the design picker */}
                <button type="button" disabled={busy} className={primaryButton}
                    onClick={() => pickerModeSet({ kind: "add" })}>
                    + Add component
                </button>

                {/* ============ selected component panel ============ */}
                {selected !== null && draftData !== null && (
                    <div className="grid gap-4 rounded-xl border border-cobalt/40 bg-surface p-4">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className="font-display text-lg font-bold">{categoryLabels[selected.category]}</p>
                            <button type="button" className={quietButton} onClick={() => select(null)}>Close</button>
                        </div>

                        {/* design swap — data stays, look changes */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold">Design: <span className="font-normal text-mist">{variantsById[selected.variantId]?.label ?? selected.variantId}</span></span>
                            <button type="button" disabled={busy} className={quietButton}
                                onClick={() => pickerModeSet({ kind: "swap", category: selected.category, currentVariantId: selected.variantId })}>
                                Change design
                            </button>
                        </div>

                        {/* the instance's own data */}
                        <ComponentDataForm value={draftData} onChange={draftDataSet} />
                        <button type="button" disabled={busy} className={primaryButton}
                            onClick={() => run(async () => {
                                await updateComponentData(props.tenantId, selected.id, draftData)
                                await refresh()
                            }, "Saved — your page is updated")}>
                            Save content
                        </button>

                        {/* per-instance style overrides */}
                        <details className="grid gap-3 rounded-lg border border-line p-3">
                            <summary className="cursor-pointer text-sm font-semibold">Style overrides (this component only)</summary>
                            <div className="mt-3 grid gap-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(tokenLabels) as (keyof ThemeColors)[]).map(tokenKey => {
                                        const current = draftStyles?.tokens[tokenKey] ?? ""
                                        return (
                                            <div key={tokenKey} className="flex items-center gap-1.5 text-xs">
                                                <input type="color" value={current !== "" ? current : "#888888"} aria-label={tokenLabels[tokenKey]}
                                                    className="size-7 cursor-pointer rounded border border-line"
                                                    onChange={e => draftStylesSet(prev => ({ css: prev?.css ?? "", tokens: { ...prev?.tokens, [tokenKey]: e.target.value } }))} />
                                                <span className={current !== "" ? "font-semibold" : "text-mist"}>{tokenLabels[tokenKey]}</span>
                                                {current !== "" && (
                                                    <button type="button" className="text-mist hover:text-brand" aria-label={`Reset ${tokenLabels[tokenKey]}`}
                                                        onClick={() => draftStylesSet(prev => {
                                                            const tokens = { ...prev?.tokens }
                                                            delete tokens[tokenKey]
                                                            return { css: prev?.css ?? "", tokens }
                                                        })}>×</button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <label className="grid gap-1 text-xs font-semibold">Custom CSS (scoped to this component)
                                    <textarea rows={4} className={`${input} font-mono`} placeholder={`.my-class {\n  letter-spacing: 0.1em;\n}`}
                                        value={draftStyles?.css ?? ""}
                                        onChange={e => draftStylesSet(prev => ({ tokens: prev?.tokens ?? {}, css: e.target.value }))} />
                                </label>

                                <button type="button" disabled={busy} className={primaryButton}
                                    onClick={() => run(async () => {
                                        await updateComponentStyles(props.tenantId, selected.id, draftStyles ?? { tokens: {}, css: "" })
                                        await refresh()
                                    }, "Style saved")}>
                                    Save style
                                </button>
                            </div>
                        </details>

                        {/* move to another page/region */}
                        <label className="grid gap-1 text-xs font-semibold">Move to
                            <select className={input} disabled={busy} value=""
                                onChange={e => {
                                    if (e.target.value === "") return
                                    const target: Location = e.target.value === "header" ? { region: "header" }
                                        : e.target.value === "footer" ? { region: "footer" }
                                            : { region: "main", pageId: e.target.value }
                                    run(async () => {
                                        await relocateComponent(props.tenantId, selected.id, {
                                            region: target.region,
                                            pageId: target.region === "main" ? target.pageId : null,
                                        })
                                        await refresh()
                                        locationSet(target)
                                    }, "Moved")
                                }}>
                                <option value="">Choose…</option>
                                <option value="header">Header (every page)</option>
                                {pages.map(page => (
                                    <option key={page.id} value={page.id}>{page.slug === "" ? "Home page" : `${page.title} page`}</option>
                                ))}
                                <option value="footer">Footer (every page)</option>
                            </select>
                        </label>
                    </div>
                )}

                {/* start over from a template */}
                <details className="rounded-lg border border-line p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-mist">Start over from a template</summary>
                    <div className="mt-3 grid gap-2">
                        {siteTemplates.map(template => (
                            <button key={template.id} type="button" disabled={busy}
                                className="grid gap-0.5 rounded-lg border border-line p-3 text-left hover:border-cobalt"
                                onClick={() => {
                                    if (!window.confirm(`Replace your whole site with the "${template.name}" starter? Current pages and components are removed.`)) return
                                    run(async () => {
                                        await applySiteTemplate(props.tenantId, template.id)
                                        const site = await refresh()
                                        const home = sortByOrder(site.pages).find(candidate => candidate.slug === "")
                                        locationSet({ region: "main", pageId: home?.id ?? "" })
                                        select(null)
                                    }, "Template applied — make it yours")
                                }}>
                                <span className="font-display font-bold">{template.name}</span>
                                <span className="text-xs text-mist">{template.description}</span>
                            </button>
                        ))}
                    </div>
                </details>
            </div>

            {/* the design picker overlay (add + swap) */}
            {pickerMode !== null && (
                <ComponentPicker
                    mode={pickerMode}
                    meta={props.meta}
                    config={props.config}
                    onClose={() => pickerModeSet(null)}
                    onPick={(entry: VariantEntry) => {
                        const mode = pickerMode
                        pickerModeSet(null)
                        if (mode.kind === "add") {
                            run(async () => {
                                const created = await addComponent(props.tenantId, {
                                    region: location.region,
                                    pageId: location.region === "main" ? location.pageId : null,
                                    category: entry.category,
                                    variantId: entry.variantId,
                                })
                                await refresh()
                                select(created as RenderableComponent)
                            }, `${categoryLabels[entry.category]} added — make it yours`)
                        } else if (entry.variantId !== mode.currentVariantId) {
                            run(async () => {
                                const componentId = selectedId
                                if (componentId === null) return
                                await swapComponentVariant(props.tenantId, componentId, entry.variantId)
                                await refresh()
                            }, "Design swapped — your content stayed put")
                        }
                    }}
                />
            )}

            {/* ============ right: live preview ============ */}
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
                <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-mist">
                    Preview — {location.region === "header" ? "showing Home (header appears on every page)" : location.region === "footer" ? "showing Home (footer appears on every page)" : (pages.find(page => page.id === location.pageId)?.title ?? "page")}
                </p>
                <div className="max-h-[80vh] overflow-y-auto">
                    <TenantSite
                        meta={props.meta}
                        config={props.config}
                        slug={props.slug}
                        basePath={`/${props.slug}`}
                        tenantId={props.tenantId}
                        pages={pages}
                        components={previewComponents}
                        currentPageId={currentPageId}
                        products={props.products}
                        preview
                    />
                </div>
            </div>
        </div>
    )
}
