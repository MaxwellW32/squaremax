"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import TenantSite, { EditorGap, RenderableComponent, RenderablePage } from "@/components/sites/TenantSite"
import { categoryLabels, SiteMeta } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { ProductLite } from "@/lib/sites/sectionProps"
import { variantsById } from "@/lib/sites/registry"
import { componentsForPage, siblingComponents } from "@/lib/sites/site"

//============================================================
// The canvas: the live site IS the editor. Hover any component
// and it lights up with its name — the site reads as a stack of
// swappable pieces. Click one to select it: a floating toolbar
// appears on the component (change design / reorder / remove)
// and the sidebar opens its content form. Thin "+ Add here"
// strips live between components so new sections drop exactly
// where you point. Links and buttons inside the preview never
// navigate — clicks select instead.
//============================================================

type Rect = { top: number; left: number; width: number; height: number }

//union of the wrapper's child boxes (the wrapper itself is
//display:contents), in the scroller's CONTENT coordinates so the
//overlay scrolls with the page
function instanceRect(scroller: HTMLElement, id: string): Rect | null {
    const wrapper = scroller.querySelector(`[data-c="${id}"]`)
    if (!(wrapper instanceof HTMLElement)) return null

    let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity
    for (const child of Array.from(wrapper.children)) {
        if (child.tagName === "STYLE") continue
        const box = child.getBoundingClientRect()
        if (box.width === 0 && box.height === 0) continue
        top = Math.min(top, box.top)
        left = Math.min(left, box.left)
        right = Math.max(right, box.right)
        bottom = Math.max(bottom, box.bottom)
    }
    if (top === Infinity) return null

    const base = scroller.getBoundingClientRect()
    return {
        top: top - base.top + scroller.scrollTop,
        left: left - base.left + scroller.scrollLeft,
        width: right - left,
        height: bottom - top,
    }
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
    if (a === null || b === null) return a === b
    return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

//the in-flow "+ Add here" strip rendered between components: zero
//height (no layout shift), reveals a line + pill on hover
function GapStrip({ gap, busy, onAdd }: { gap: EditorGap; busy: boolean; onAdd: (gap: EditorGap) => void }) {
    return (
        <div data-gap className="relative z-30 h-0">
            <div className="absolute inset-x-0 top-0 flex h-6 -translate-y-1/2 items-center justify-center opacity-0 transition-opacity duration-100 hover:opacity-100 focus-within:opacity-100">
                <span aria-hidden className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-cobalt/60" />
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onAdd(gap)}
                    className="relative rounded-full border border-cobalt bg-white px-3 py-0.5 text-xs font-bold text-cobalt shadow-md transition-colors hover:bg-cobalt hover:text-white disabled:opacity-50"
                >
                    + Add here
                </button>
            </div>
        </div>
    )
}

export default function EditorCanvas(props: {
    tenantId: string
    slug: string
    meta: SiteMeta
    config: SiteConfig
    pages: RenderablePage[]
    components: RenderableComponent[]
    currentPageId: string
    products?: ProductLite[]
    selectedId: string | null
    busy: boolean
    onSelect: (id: string | null) => void
    onAddAt: (gap: EditorGap) => void
    onSwapDesign: (id: string) => void
    onMove: (id: string, direction: "up" | "down") => void
    onDelete: (id: string) => void
}) {
    const scrollerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)

    const [hover, hoverSet] = useState<{ id: string; rect: Rect } | null>(null)
    const hoverRef = useRef<typeof hover>(null)
    const [selectedRect, selectedRectSet] = useState<Rect | null>(null)
    const selectedRectRef = useRef<Rect | null>(null)

    const applyHover = useCallback((next: { id: string; rect: Rect } | null) => {
        const prev = hoverRef.current
        if (prev === null && next === null) return
        if (prev !== null && next !== null && prev.id === next.id && sameRect(prev.rect, next.rect)) return
        hoverRef.current = next
        hoverSet(next)
    }, [])

    const applySelectedRect = useCallback((next: Rect | null) => {
        if (sameRect(selectedRectRef.current, next)) return
        selectedRectRef.current = next
        selectedRectSet(next)
    }, [])

    const recomputeSelected = useCallback(() => {
        const scroller = scrollerRef.current
        if (scroller === null || props.selectedId === null) {
            applySelectedRect(null)
            return
        }
        applySelectedRect(instanceRect(scroller, props.selectedId))
    }, [props.selectedId, applySelectedRect])

    //keep the selected outline glued to its component: content edits,
    //image loads, window resizes and (sticky navbars) scrolling all
    //move boxes around. Everything runs in observer/event callbacks.
    useEffect(() => {
        const scroller = scrollerRef.current
        const canvas = canvasRef.current
        if (scroller === null || canvas === null) return

        let raf = requestAnimationFrame(recomputeSelected)
        const schedule = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(recomputeSelected)
        }

        const observer = new ResizeObserver(schedule)
        observer.observe(canvas)
        scroller.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        return () => {
            cancelAnimationFrame(raf)
            observer.disconnect()
            scroller.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
        }
    }, [recomputeSelected, props.components])

    //when a selection happens off-canvas (sidebar outline, fresh add),
    //bring the component into view
    useEffect(() => {
        if (props.selectedId === null) return
        const scroller = scrollerRef.current
        if (scroller === null) return
        const id = props.selectedId
        const raf = requestAnimationFrame(() => {
            const rect = instanceRect(scroller, id)
            if (rect === null) return
            const viewTop = scroller.scrollTop
            const viewBottom = viewTop + scroller.clientHeight
            if (rect.top > viewBottom - 60 || rect.top + rect.height < viewTop + 60) {
                scroller.scrollTo({ top: Math.max(0, rect.top - 24), behavior: "smooth" })
            }
        })
        return () => cancelAnimationFrame(raf)
    }, [props.selectedId])

    const handleMouseMove = (event: React.MouseEvent) => {
        const scroller = scrollerRef.current
        const target = event.target instanceof Element ? event.target : null
        if (scroller === null || target === null || target.closest("[data-gap]") !== null) {
            applyHover(null)
            return
        }
        const wrapper = target.closest("[data-c]")
        if (!(wrapper instanceof HTMLElement) || wrapper.dataset.c === undefined) {
            applyHover(null)
            return
        }
        const id = wrapper.dataset.c
        const rect = instanceRect(scroller, id)
        applyHover(rect === null ? null : { id, rect })
    }

    //the canvas owns every click: links/buttons in the preview never
    //navigate — a click means "select this component"
    const handleClickCapture = (event: React.MouseEvent) => {
        const target = event.target instanceof Element ? event.target : null
        if (target !== null && target.closest("[data-gap]") !== null) return
        event.preventDefault()
        event.stopPropagation()
        const wrapper = target?.closest("[data-c]")
        props.onSelect(wrapper instanceof HTMLElement ? wrapper.dataset.c ?? null : null)
    }

    const visible = componentsForPage(props.components, props.currentPageId)
    const selected = props.components.find(component => component.id === props.selectedId) ?? null
    const siblings = selected !== null ? siblingComponents(props.components, selected) : []
    const selectedIndex = selected !== null ? siblings.findIndex(sibling => sibling.id === selected.id) : -1

    const currentPage = props.pages.find(page => page.id === props.currentPageId)
    const pagePath = currentPage === undefined || currentPage.slug === "" ? "" : `/${currentPage.slug}`

    const renderEditorGap = useCallback((gap: EditorGap) => (
        <GapStrip gap={gap} busy={props.busy} onAdd={props.onAddAt} />
    ), [props.busy, props.onAddAt])

    //toolbar sits just above the selected component, or tucks inside
    //it when the component is at the very top of the canvas
    const toolbarTop = selectedRect === null ? 0 : selectedRect.top >= 46 ? selectedRect.top - 42 : selectedRect.top + 8

    return (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {/* faux browser chrome — makes "this is your real site" tangible */}
            <div className="flex items-center gap-2 border-b border-line px-4 py-2">
                <span aria-hidden className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-line" />
                    <span className="size-2.5 rounded-full bg-line" />
                    <span className="size-2.5 rounded-full bg-line" />
                </span>
                <span className="mx-auto truncate rounded-md bg-paper px-3 py-1 font-mono text-xs text-mist">
                    squaremaxtech.com/{props.slug}{pagePath}
                </span>
                <span className="text-xs text-mist">{props.busy ? "Saving…" : "Click any part to edit it"}</span>
            </div>

            <div ref={scrollerRef} className="relative max-h-[78vh] min-h-[420px] overflow-y-auto overscroll-contain">
                <div
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => applyHover(null)}
                    onClickCapture={handleClickCapture}
                    className="cursor-pointer"
                >
                    <TenantSite
                        meta={props.meta}
                        config={props.config}
                        slug={props.slug}
                        basePath={`/${props.slug}`}
                        tenantId={props.tenantId}
                        pages={props.pages}
                        components={props.components}
                        currentPageId={props.currentPageId}
                        products={props.products}
                        preview
                        renderEditorGap={renderEditorGap}
                    />
                </div>

                {/* empty page: a real invitation instead of a blank void — on its
                    own card so it stays readable on dark tenant themes */}
                {visible.length === 0 && (
                    <div className="absolute inset-0 grid place-items-center p-8">
                        <div className="grid justify-items-center gap-3 rounded-xl border border-line bg-paper p-8 text-center text-ink shadow-lg">
                            <p className="font-display text-xl font-bold">A blank canvas</p>
                            <p className="max-w-xs text-sm text-mist">Your site builds top to bottom — navigation, hero, sections, footer. Add the first piece.</p>
                            <button
                                type="button"
                                disabled={props.busy}
                                onClick={() => props.onAddAt({ after: null, before: null })}
                                className="rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50"
                            >
                                + Add your first section
                            </button>
                        </div>
                    </div>
                )}

                {/* hover outline + name chip */}
                {hover !== null && hover.id !== props.selectedId && (() => {
                    const component = props.components.find(candidate => candidate.id === hover.id)
                    if (component === undefined) return null
                    return (
                        <div className="pointer-events-none absolute z-40" style={{ top: hover.rect.top, left: hover.rect.left, width: hover.rect.width, height: hover.rect.height }}>
                            <div className="absolute inset-0 rounded-sm border-2 border-cobalt/50" />
                            <span className="absolute left-2 top-2 rounded-md bg-cobalt/90 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                {categoryLabels[component.category]}
                            </span>
                        </div>
                    )
                })()}

                {/* selected outline */}
                {selected !== null && selectedRect !== null && (
                    <div className="pointer-events-none absolute z-40" style={{ top: selectedRect.top, left: selectedRect.left, width: selectedRect.width, height: selectedRect.height }}>
                        <div className="absolute inset-0 rounded-sm border-2 border-cobalt shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
                    </div>
                )}

                {/* floating toolbar for the selected component */}
                {selected !== null && selectedRect !== null && (
                    <div
                        className="absolute z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-line bg-white p-1 shadow-lg"
                        style={{ top: toolbarTop, left: selectedRect.left + selectedRect.width / 2 }}
                    >
                        <span className="px-2 text-xs font-bold text-ink">
                            {categoryLabels[selected.category]}
                            <span className="ml-1.5 hidden font-normal text-mist sm:inline">{variantsById[selected.variantId]?.label ?? selected.variantId}</span>
                        </span>
                        <button
                            type="button"
                            disabled={props.busy}
                            onClick={() => props.onSwapDesign(selected.id)}
                            className="rounded-md bg-cobalt px-2.5 py-1 text-xs font-bold text-white hover:bg-ink disabled:opacity-50"
                        >
                            Change design
                        </button>
                        <button
                            type="button"
                            aria-label="Move up"
                            title="Move up"
                            disabled={props.busy || selectedIndex <= 0}
                            onClick={() => props.onMove(selected.id, "up")}
                            className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-mist hover:text-ink disabled:opacity-40"
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            aria-label="Move down"
                            title="Move down"
                            disabled={props.busy || selectedIndex === -1 || selectedIndex >= siblings.length - 1}
                            onClick={() => props.onMove(selected.id, "down")}
                            className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-mist hover:text-ink disabled:opacity-40"
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            aria-label="Remove component"
                            title="Remove"
                            disabled={props.busy}
                            onClick={() => props.onDelete(selected.id)}
                            className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-mist hover:border-brand hover:text-brand disabled:opacity-40"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
