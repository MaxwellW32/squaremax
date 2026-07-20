"use client"
import React, { useEffect, useMemo, useState } from "react"
import { categoryGroups, categoryLabels, ComponentCategory, sampleComponentData, SiteMeta } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { themesById, themeToStyle, themes } from "@/lib/sites/themes"
import { tenantFontsClassName } from "@/lib/sites/fonts"
import { variants, variantsById, VariantEntry } from "@/lib/sites/registry"
import { SectionProps, SiteCtx } from "@/lib/sites/sectionProps"

//============================================================
// The add/swap design picker: browse by goal-oriented groups
// ("Selling & converting", "Trust & proof", …), see every design
// rendered LIVE in the site's own theme with friendly sample
// data, plus a Recent tab of designs you've used lately.
//============================================================

const RECENT_KEY = "sq-recent-designs"
const RECENT_MAX = 12

function readRecents(): string[] {
    try {
        const raw = localStorage.getItem(RECENT_KEY)
        const parsed: unknown = raw === null ? [] : JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
    } catch {
        return []
    }
}

export function rememberRecentDesign(variantId: string) {
    try {
        const next = [variantId, ...readRecents().filter(id => id !== variantId)].slice(0, RECENT_MAX)
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
        //storage unavailable — recents just won't persist
    }
}

//one design rendered small: a fixed virtual viewport scaled down, so every
//preview shows real desktop proportions in the tenant's own theme
function DesignPreview({ entry, meta, config }: { entry: VariantEntry; meta: SiteMeta; config: SiteConfig }) {
    const theme = themesById[config.themeId] ?? themes[0]

    const ctx: SiteCtx = useMemo(() => ({
        tenantId: "picker-preview",
        slug: "preview",
        basePath: "",
        business: meta.business,
        pages: [{ slug: "", title: "Home" }, { slug: "about", title: "About" }],
        enabledAddons: ["booking", "notifications", "inventory", "custom-domain"],
        products: [
            { id: "p1", name: "Sample product", description: "Looks great here.", priceCents: 2500, imageSrc: "", stock: 5, trackStock: true },
            { id: "p2", name: "Another one", description: "", priceCents: 1200, imageSrc: "", stock: 0, trackStock: true },
            { id: "p3", name: "Best seller", description: "", priceCents: 4000, imageSrc: "", stock: 9, trackStock: true },
        ],
        preview: true,
    }), [meta.business])

    const data = useMemo(() => sampleComponentData(entry.category, meta.business), [entry.category, meta.business])
    const Component = entry.component as React.ComponentType<SectionProps>

    return (
        <div className="pointer-events-none h-44 w-full overflow-hidden rounded-t-xl border-b border-line" aria-hidden>
            <div
                className={`${tenantFontsClassName} origin-top-left`}
                style={{
                    ...themeToStyle(theme, config.themeOverrides),
                    backgroundColor: "var(--t-bg)",
                    fontFamily: "var(--t-font-body)",
                    color: "var(--t-text)",
                    width: 900,
                    transform: "scale(0.335)",
                    minHeight: 525,
                }}
            >
                <Component data={data} id={`pv-${entry.variantId}`} ctx={ctx} />
            </div>
        </div>
    )
}

function DesignCard({ entry, meta, config, current, onPick }: {
    entry: VariantEntry
    meta: SiteMeta
    config: SiteConfig
    current: boolean
    onPick: (entry: VariantEntry) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onPick(entry)}
            className={`group grid content-start overflow-hidden rounded-xl border text-left transition-shadow hover:shadow-lg ${current ? "border-cobalt ring-2 ring-cobalt/30" : "border-line hover:border-mist"}`}
        >
            <DesignPreview entry={entry} meta={meta} config={config} />
            <span className="flex items-center justify-between gap-2 bg-surface px-3 py-2.5">
                <span className="grid gap-0.5">
                    <span className="text-sm font-semibold">{entry.label}</span>
                    <span className="text-xs text-mist">{categoryLabels[entry.category]}</span>
                </span>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${current ? "bg-line text-mist" : "bg-cobalt text-white opacity-0 transition-opacity group-hover:opacity-100"}`}>
                    {current ? "Current" : "Use"}
                </span>
            </span>
        </button>
    )
}

export type PickerMode =
    | { kind: "add" }
    | { kind: "swap"; category: ComponentCategory; currentVariantId: string }

export default function ComponentPicker({ mode, meta, config, onPick, onClose }: {
    mode: PickerMode
    meta: SiteMeta
    config: SiteConfig
    onPick: (entry: VariantEntry) => void
    onClose: () => void
}) {
    const swapCategory = mode.kind === "swap" ? mode.category : null

    const groups = useMemo(() => {
        if (swapCategory !== null) {
            return [{ id: "swap", label: `${categoryLabels[swapCategory]} designs`, blurb: "Same content, different look — your data stays put.", categories: [swapCategory] }]
        }
        return categoryGroups
    }, [swapCategory])

    const [activeGroupId, activeGroupIdSet] = useState(groups[0].id)
    const [recents, recentsSet] = useState<string[]>([])
    useEffect(() => {
        //deferred: localStorage is browser-only and lint bans sync setState here
        const timer = setTimeout(() => recentsSet(readRecents()), 0)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    const recentEntries = recents
        .map(id => variantsById[id])
        .filter((entry): entry is VariantEntry => entry !== undefined)
        .filter(entry => swapCategory === null || entry.category === swapCategory)

    const showRecentTab = recentEntries.length > 0 && swapCategory === null
    const activeGroup = activeGroupId === "recent" ? null : groups.find(group => group.id === activeGroupId) ?? groups[0]

    const pick = (entry: VariantEntry) => {
        rememberRecentDesign(entry.variantId)
        onPick(entry)
    }

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Choose a component design">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

            <div className="relative grid max-h-[88vh] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl">
                {/* header + group tabs */}
                <div className="grid gap-3 border-b border-line px-5 pb-0 pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-0.5">
                            <h2 className="font-display text-xl font-bold normal-case">
                                {mode.kind === "swap" ? `Swap the ${categoryLabels[mode.category].toLowerCase()} design` : "Add a component"}
                            </h2>
                            <p className="text-xs text-mist">
                                {mode.kind === "swap"
                                    ? "Previews use your theme — your content carries over exactly as-is."
                                    : "Previews use your theme and sample content. Everything is editable after adding."}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-mist hover:text-ink">
                            Close
                        </button>
                    </div>

                    <nav className="flex flex-wrap gap-1">
                        {showRecentTab && (
                            <button type="button" onClick={() => activeGroupIdSet("recent")}
                                className={`px-3.5 py-2 text-sm font-semibold ${activeGroupId === "recent" ? "border-b-2 border-cobalt text-ink" : "text-mist hover:text-ink"}`}>
                                ★ Recent
                            </button>
                        )}
                        {groups.map(group => (
                            <button key={group.id} type="button" onClick={() => activeGroupIdSet(group.id)}
                                className={`px-3.5 py-2 text-sm font-semibold ${activeGroupId === group.id ? "border-b-2 border-cobalt text-ink" : "text-mist hover:text-ink"}`}>
                                {group.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* body */}
                <div className="grid content-start gap-6 overflow-y-auto p-5">
                    {activeGroupId === "recent" ? (
                        <div className="grid gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">Recently used designs</p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {recentEntries.map(entry => (
                                    <DesignCard key={entry.variantId} entry={entry} meta={meta} config={config}
                                        current={mode.kind === "swap" && mode.currentVariantId === entry.variantId} onPick={pick} />
                                ))}
                            </div>
                        </div>
                    ) : activeGroup !== null && (
                        <>
                            <p className="-mb-3 text-xs text-mist">{activeGroup.blurb}</p>
                            {activeGroup.categories.map(category => {
                                const entries = variants.filter(entry => entry.category === category)
                                if (entries.length === 0) return null
                                return (
                                    <div key={category} className="grid gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-mist">{categoryLabels[category]}</p>
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {entries.map(entry => (
                                                <DesignCard key={entry.variantId} entry={entry} meta={meta} config={config}
                                                    current={mode.kind === "swap" && mode.currentVariantId === entry.variantId} onPick={pick} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
