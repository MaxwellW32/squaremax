"use client"
import React, { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { EditorGap, RenderableComponent, RenderablePage } from "@/components/sites/TenantSite"
import { SiteMeta, ComponentData, ComponentCategory, categoryLabels } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { ComponentStyles } from "@/lib/sites/styles"
import { ThemeColors, themeColorsSchema, themes } from "@/lib/sites/themes"
import { ProductLite } from "@/lib/sites/sectionProps"
import { variantsById, VariantEntry } from "@/lib/sites/registry"
import { sortByOrder, componentsForPage, placementForGap, ComponentRegion, PAGE_LIMIT } from "@/lib/sites/site"
import { siteTemplates } from "@/lib/sites/siteTemplates"
import ComponentDataForm from "./editorForms"
import ComponentPicker, { PickerMode } from "./ComponentPicker"
import EditorCanvas from "./EditorCanvas"
import {
    addComponent, addSitePage, applySiteTemplate, deleteComponent, deleteSitePage,
    getSiteForOwner, moveComponent, relocateComponent, setSiteTheme, swapComponentVariant,
    updateComponentData, updateComponentStyles, updateSitePage,
} from "@/serverFunctions/handleSiteBuilder"

//============================================================
// The website editor, canvas-first: the live site fills the
// screen and is edited in place — hover shows the stack of
// components, clicking selects one, a floating toolbar swaps
// designs, and the sidebar becomes that component's content
// form (one standard form per component TYPE, so a design swap
// keeps every word). Every mutation is a server action followed
// by a full re-fetch — simple and always consistent.
//
// With nothing selected the sidebar has two faces — Page (what's
// on this page) and Design (site-wide colors & fonts). Design
// lives here rather than in a tab of its own so every theme
// change is previewed on the canvas beside it, and instance
// style overrides sit one click away on the same screen.
//============================================================

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

type PickerState =
    | { kind: "add"; gap: EditorGap }
    | { kind: "swap"; componentId: string; category: ComponentCategory; currentVariantId: string }

export default function WebsiteEditor(props: {
    tenantId: string
    slug: string
    meta: SiteMeta
    config: SiteConfig
    //the theme is edited here, so the owner of the state is the dashboard
    onConfigChange: (config: SiteConfig) => void
    initialPages: RenderablePage[]
    initialComponents: RenderableComponent[]
    products?: ProductLite[]
}) {
    const [pages, pagesSet] = useState<RenderablePage[]>(sortByOrder(props.initialPages))
    const [components, componentsSet] = useState<RenderableComponent[]>(props.initialComponents)
    const [currentPageId, currentPageIdSet] = useState<string>(sortByOrder(props.initialPages)[0]?.id ?? "")
    const [selectedId, selectedIdSet] = useState<string | null>(null)
    const [busy, busySet] = useState(false)
    const [picker, pickerSet] = useState<PickerState | null>(null)

    //local unsaved edits for the selected component
    const [draftData, draftDataSet] = useState<ComponentData | null>(null)
    const [draftStyles, draftStylesSet] = useState<ComponentStyles | null>(null)
    const [contentDirty, contentDirtySet] = useState(false)
    const [styleDirty, styleDirtySet] = useState(false)

    const [newPageTitle, newPageTitleSet] = useState("")

    //which face the sidebar shows while no component is selected
    const [sidebarMode, sidebarModeSet] = useState<"page" | "design">("page")
    const [designDirty, designDirtySet] = useState(false)

    const selected = components.find(component => component.id === selectedId) ?? null
    const currentPage = pages.find(page => page.id === currentPageId)
    const visible = useMemo(() => componentsForPage(components, currentPageId), [components, currentPageId])
    const hasUnsaved = contentDirty || styleDirty

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

    //theme edits render on the canvas immediately; Save writes them site-wide
    const editConfig = (patch: Partial<SiteConfig>) => {
        props.onConfigChange({ ...props.config, ...patch })
        designDirtySet(true)
    }

    const saveDesign = () => run(async () => {
        await setSiteTheme(props.tenantId, { themeId: props.config.themeId, themeOverrides: props.config.themeOverrides })
        designDirtySet(false)
    }, "Design saved — every page picked it up")

    const select = (component: RenderableComponent | null) => {
        selectedIdSet(component?.id ?? null)
        draftDataSet(component?.data ?? null)
        draftStylesSet(component?.styles ?? { tokens: {}, css: "" })
        contentDirtySet(false)
        styleDirtySet(false)
    }

    //every selection change funnels through here so unsaved edits are
    //never lost silently
    const confirmDiscard = () => !hasUnsaved || window.confirm("Discard your unsaved changes to the selected component?")

    const trySelect = (id: string | null) => {
        if (id === selectedId) return
        if (!confirmDiscard()) return
        select(id === null ? null : components.find(component => component.id === id) ?? null)
    }

    const trySwitchPage = (pageId: string) => {
        if (pageId === currentPageId) return
        if (!confirmDiscard()) return
        select(null)
        currentPageIdSet(pageId)
    }

    //Escape deselects (the picker handles its own Escape while open)
    useEffect(() => {
        if (picker !== null) return
        const handleKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || selectedId === null) return
            const active = document.activeElement
            if (active instanceof HTMLElement && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) {
                active.blur()
                return
            }
            if (!hasUnsaved || window.confirm("Discard your unsaved changes to the selected component?")) select(null)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    })

    //preview reflects unsaved edits of the selected component instantly
    const previewComponents = useMemo(() => components.map(component => {
        if (component.id !== selectedId) return component
        return {
            ...component,
            data: draftData ?? component.data,
            styles: draftStyles ?? component.styles,
        }
    }), [components, selectedId, draftData, draftStyles])

    const addedNote = (category: ComponentCategory): string => {
        const label = categoryLabels[category]
        if (category === "navbar") return `${label} added to your header — it shows on every page`
        if (category === "footer") return `${label} added — it shows on every page`
        return `${label} added — make it yours`
    }

    const openAddPicker = (gap: EditorGap) => {
        if (!confirmDiscard()) return
        select(null)
        pickerSet({ kind: "add", gap })
    }

    const openSwapPicker = (componentId: string) => {
        const component = components.find(candidate => candidate.id === componentId)
        if (component === undefined) return
        pickerSet({ kind: "swap", componentId, category: component.category, currentVariantId: component.variantId })
    }

    const removeComponent = (componentId: string) => {
        const component = components.find(candidate => candidate.id === componentId)
        if (component === undefined) return
        if (!window.confirm(`Remove this ${categoryLabels[component.category].toLowerCase()}?`)) return
        run(async () => {
            await deleteComponent(props.tenantId, componentId)
            if (selectedId === componentId) select(null)
            await refresh()
        }, "Removed")
    }

    const pickerMode: PickerMode | null = picker === null ? null
        : picker.kind === "add" ? { kind: "add" }
            : { kind: "swap", category: picker.category, currentVariantId: picker.currentVariantId }

    return (
        <div className="grid gap-4">
            {/* ============ top bar: pages + live link ============ */}
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-mist">Pages</span>
                {pages.map(page => (
                    <button key={page.id} type="button" onClick={() => trySwitchPage(page.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${currentPageId === page.id ? "bg-cobalt text-white" : "border border-line text-mist hover:text-ink"}`}>
                        {page.slug === "" ? "Home" : page.title}
                    </button>
                ))}
                <span className="text-xs text-mist">{pages.length}/{PAGE_LIMIT}</span>
                <a href={`/${props.slug}`} target="_blank" rel="noreferrer"
                    className="ml-auto rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-cobalt hover:border-cobalt">
                    View live site ↗
                </a>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[1fr_400px]">
                {/* ============ the canvas ============ */}
                <EditorCanvas
                    tenantId={props.tenantId}
                    slug={props.slug}
                    meta={props.meta}
                    config={props.config}
                    pages={pages}
                    components={previewComponents}
                    currentPageId={currentPageId}
                    products={props.products}
                    selectedId={selectedId}
                    busy={busy}
                    onSelect={trySelect}
                    onAddAt={openAddPicker}
                    onSwapDesign={openSwapPicker}
                    onMove={(componentId, direction) => run(async () => {
                        await moveComponent(props.tenantId, componentId, direction)
                        await refresh()
                    })}
                    onDelete={removeComponent}
                />

                {/* ============ sidebar ============ */}
                {selected !== null && draftData !== null ? (
                    /* -------- selected component: its own content form -------- */
                    <div className="grid content-start gap-4 rounded-xl border border-cobalt/40 bg-surface p-4">
                        <div className="flex items-baseline justify-between gap-2">
                            <div className="grid gap-0.5">
                                <p className="font-display text-lg font-bold">{categoryLabels[selected.category]}</p>
                                <p className="text-xs text-mist">{variantsById[selected.variantId]?.label ?? selected.variantId}</p>
                            </div>
                            <button type="button" className={quietButton} onClick={() => trySelect(null)}>Close</button>
                        </div>

                        {/* design swap — data stays, look changes */}
                        <button type="button" disabled={busy} className={`${quietButton} w-fit`}
                            onClick={() => openSwapPicker(selected.id)}>
                            Change design — your content stays
                        </button>

                        {/* the instance's own data: one standard form per component type */}
                        <ComponentDataForm value={draftData} onChange={next => { draftDataSet(next); contentDirtySet(true) }} />
                        <div className="flex items-center gap-2">
                            <button type="button" disabled={busy || !contentDirty} className={primaryButton}
                                onClick={() => run(async () => {
                                    await updateComponentData(props.tenantId, selected.id, draftData)
                                    await refresh()
                                    contentDirtySet(false)
                                }, "Saved — your page is updated")}>
                                Save content
                            </button>
                            {contentDirty && <span className="text-xs font-semibold text-amber-600">Unsaved changes</span>}
                        </div>

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
                                                    onChange={e => { draftStylesSet(prev => ({ css: prev?.css ?? "", tokens: { ...prev?.tokens, [tokenKey]: e.target.value } })); styleDirtySet(true) }} />
                                                <span className={current !== "" ? "font-semibold" : "text-mist"}>{tokenLabels[tokenKey]}</span>
                                                {current !== "" && (
                                                    <button type="button" className="text-mist hover:text-brand" aria-label={`Reset ${tokenLabels[tokenKey]}`}
                                                        onClick={() => {
                                                            draftStylesSet(prev => {
                                                                const tokens = { ...prev?.tokens }
                                                                delete tokens[tokenKey]
                                                                return { css: prev?.css ?? "", tokens }
                                                            })
                                                            styleDirtySet(true)
                                                        }}>×</button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <label className="grid gap-1 text-xs font-semibold">Custom CSS (scoped to this component)
                                    <textarea rows={4} className={`${input} font-mono`} placeholder={`.my-class {\n  letter-spacing: 0.1em;\n}`}
                                        value={draftStyles?.css ?? ""}
                                        onChange={e => { draftStylesSet(prev => ({ tokens: prev?.tokens ?? {}, css: e.target.value })); styleDirtySet(true) }} />
                                </label>

                                <button type="button" disabled={busy || !styleDirty} className={primaryButton}
                                    onClick={() => run(async () => {
                                        await updateComponentStyles(props.tenantId, selected.id, draftStyles ?? { tokens: {}, css: "" })
                                        await refresh()
                                        styleDirtySet(false)
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
                                    const value = e.target.value
                                    const region: ComponentRegion = value === "header" ? "header" : value === "footer" ? "footer" : "main"
                                    run(async () => {
                                        await relocateComponent(props.tenantId, selected.id, {
                                            region,
                                            pageId: region === "main" ? value : null,
                                        })
                                        await refresh()
                                        if (region === "main") currentPageIdSet(value)
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

                        <button type="button" disabled={busy}
                            className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-mist hover:border-brand hover:text-brand"
                            onClick={() => removeComponent(selected.id)}>
                            Remove this component
                        </button>
                    </div>
                ) : (
                    /* -------- nothing selected: this page, or the site's look -------- */
                    <div className="grid content-start gap-4">
                        {/* which face of the sidebar */}
                        <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface p-1">
                            {(["page", "design"] as const).map(mode => (
                                <button key={mode} type="button" onClick={() => sidebarModeSet(mode)}
                                    aria-pressed={sidebarMode === mode}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold ${sidebarMode === mode ? "bg-cobalt text-white" : "text-mist hover:text-ink"}`}>
                                    {mode === "page" ? "This page" : "Design"}
                                    {mode === "design" && designDirty && (
                                        <span className={`ml-1.5 inline-block size-1.5 rounded-full align-middle ${sidebarMode === mode ? "bg-white" : "bg-amber-500"}`} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {sidebarMode === "design" ? (
                        /* -------- site-wide look: previewed live on the canvas -------- */
                        <>
                            <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-mist">Theme — colors & fonts for every page</p>
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                    {themes.map(theme => (
                                        <button key={theme.id} type="button"
                                            onClick={() => editConfig({ themeId: theme.id, themeOverrides: {} })}
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-left ${props.config.themeId === theme.id ? "border-cobalt bg-cobalt/5" : "border-line hover:border-mist"}`}>
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

                            <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-mist">Fine-tune colors (optional)</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
                                    {themeColorsSchema.keyof().options.map(tokenKey => {
                                        const themeDefault = themes.find(theme => theme.id === props.config.themeId)?.colors[tokenKey] ?? "#888888"
                                        const current = props.config.themeOverrides[tokenKey] ?? ""
                                        return (
                                            <div key={tokenKey} className="flex items-center gap-1.5 text-xs">
                                                <input type="color" value={current !== "" ? current : themeDefault} aria-label={tokenLabels[tokenKey]}
                                                    className="size-8 shrink-0 cursor-pointer rounded border border-line"
                                                    onChange={e => editConfig({ themeOverrides: { ...props.config.themeOverrides, [tokenKey]: e.target.value } })} />
                                                <span className={`truncate ${current !== "" ? "font-semibold" : "text-mist"}`}>{tokenLabels[tokenKey]}</span>
                                                {current !== "" && (
                                                    <button type="button" className="ml-auto shrink-0 text-mist hover:text-brand" aria-label={`Reset ${tokenLabels[tokenKey]}`}
                                                        onClick={() => {
                                                            const themeOverrides = { ...props.config.themeOverrides }
                                                            delete themeOverrides[tokenKey]
                                                            editConfig({ themeOverrides })
                                                        }}>×</button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-mist">Single components can override these again — select one on the canvas, then &ldquo;Style overrides&rdquo;.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button type="button" disabled={busy || !designDirty} className={primaryButton} onClick={saveDesign}>
                                    Save design
                                </button>
                                {designDirty && <span className="text-xs font-semibold text-amber-600">Unsaved — the canvas is a preview</span>}
                            </div>
                        </>
                        ) : (
                        <>
                        <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">On this page — top to bottom</p>
                            {visible.length === 0 && (
                                <p className="rounded-lg border border-dashed border-line px-4 py-5 text-center text-sm text-mist">
                                    A blank canvas — add your first section.
                                </p>
                            )}
                            <div className="grid gap-1">
                                {visible.map(component => (
                                    <button key={component.id} type="button" onClick={() => trySelect(component.id)}
                                        className="flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-2 text-left hover:border-cobalt">
                                        <span className="grid grow gap-0.5">
                                            <span className="text-sm font-semibold">{categoryLabels[component.category]}</span>
                                            <span className="text-xs text-mist">{variantsById[component.variantId]?.label ?? component.variantId}</span>
                                        </span>
                                        {component.region !== "main" && (
                                            <span className="rounded-full bg-line px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mist">
                                                Every page
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button type="button" disabled={busy} className={primaryButton}
                                onClick={() => openAddPicker({ after: visible[visible.length - 1] ?? null, before: null })}>
                                + Add a section
                            </button>
                            <p className="text-xs text-mist">Tip: click any part of your site on the left to edit it in place.</p>
                        </div>

                        {/* page settings */}
                        {currentPage !== undefined && (
                            <div className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-mist">Page settings</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <input className={input} value={currentPage.title} aria-label="Page title"
                                        onChange={e => pagesSet(prev => prev.map(candidate => candidate.id === currentPage.id ? { ...candidate, title: e.target.value } : candidate))} />
                                    <button type="button" disabled={busy} className={quietButton}
                                        onClick={() => run(async () => {
                                            await updateSitePage(props.tenantId, currentPage.id, { slug: currentPage.slug, title: currentPage.title })
                                        }, "Page saved")}>
                                        Save name
                                    </button>
                                </div>
                                {currentPage.slug !== "" && (
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-mono text-xs text-mist">/{props.slug}/{currentPage.slug}</span>
                                        <button type="button" disabled={busy} className={`${quietButton} hover:text-brand`}
                                            onClick={() => {
                                                if (!window.confirm(`Delete the "${currentPage.title}" page and everything on it?`)) return
                                                run(async () => {
                                                    await deleteSitePage(props.tenantId, currentPage.id)
                                                    const site = await refresh()
                                                    const home = sortByOrder(site.pages).find(candidate => candidate.slug === "")
                                                    currentPageIdSet(home?.id ?? "")
                                                    select(null)
                                                }, "Page deleted")
                                            }}>
                                            Delete page
                                        </button>
                                    </div>
                                )}

                                {pages.length < PAGE_LIMIT && (
                                    <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                                        <input className={input} placeholder="New page name (e.g. About)" value={newPageTitle} onChange={e => newPageTitleSet(e.target.value)} />
                                        <button type="button" disabled={busy || newPageTitle.trim() === ""} className={quietButton}
                                            onClick={() => run(async () => {
                                                const title = newPageTitle.trim()
                                                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
                                                if (slug === "") throw new Error("give the page a simple name")
                                                const created = await addSitePage(props.tenantId, { slug, title })
                                                await refresh()
                                                currentPageIdSet(created.id)
                                                newPageTitleSet("")
                                            }, "Page added")}>
                                            + Add page
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="px-1 text-xs text-mist">
                            Colors & fonts for the whole site are under <strong>Design</strong> above; your name, phone and socials in the <strong>Business</strong> tab — every component reads them automatically.
                        </p>

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
                                                //templates carry their own theme — take the server's word for it
                                                props.onConfigChange(site.tenant.config)
                                                designDirtySet(false)
                                                const home = sortByOrder(site.pages).find(candidate => candidate.slug === "")
                                                currentPageIdSet(home?.id ?? "")
                                                select(null)
                                            }, "Template applied — make it yours")
                                        }}>
                                        <span className="font-display font-bold">{template.name}</span>
                                        <span className="text-xs text-mist">{template.description}</span>
                                    </button>
                                ))}
                            </div>
                        </details>
                        </>
                        )}
                    </div>
                )}
            </div>

            {/* the design picker overlay (add + swap) */}
            {picker !== null && pickerMode !== null && (
                <ComponentPicker
                    mode={pickerMode}
                    meta={props.meta}
                    config={props.config}
                    onClose={() => pickerSet(null)}
                    onPick={(entry: VariantEntry) => {
                        const active = picker
                        pickerSet(null)
                        if (active.kind === "add") {
                            const target = placementForGap(entry.category, active.gap, currentPageId, components)
                            run(async () => {
                                const created = await addComponent(props.tenantId, {
                                    region: target.region,
                                    pageId: target.pageId,
                                    category: entry.category,
                                    variantId: entry.variantId,
                                    beforeId: target.beforeId,
                                })
                                await refresh()
                                select(created as RenderableComponent)
                            }, addedNote(entry.category))
                        } else if (entry.variantId !== active.currentVariantId) {
                            run(async () => {
                                await swapComponentVariant(props.tenantId, active.componentId, entry.variantId)
                                await refresh()
                            }, "Design swapped — your content stayed put")
                        }
                    }}
                />
            )}
        </div>
    )
}
