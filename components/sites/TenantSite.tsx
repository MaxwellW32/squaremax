import React from "react"
import { SiteMeta, ComponentData } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { themesById, themeToStyle, themes } from "@/lib/sites/themes"
import { variantsById } from "@/lib/sites/registry"
import { SectionProps, SiteCtx, ProductLite, SitePageLink } from "@/lib/sites/sectionProps"
import { ComponentStyles, scopeCss, stylesToVars } from "@/lib/sites/styles"
import { componentsForPage, ComponentRegion } from "@/lib/sites/site"
import { tenantFontsClassName } from "@/lib/sites/fonts"
import { ComponentCategory } from "@/lib/sites/content"

//============================================================
// The tenant renderer (instance model): theme tokens go on THIS
// root element (never :root); components render top-down —
// header region, the current page's components, footer region.
// Each instance is wrapped in a display:contents div carrying
// its unique id: token overrides cascade from it, and custom CSS
// is scoped to it. Server-renderable end to end; interactive
// bits are client islands.
//============================================================

export type RenderableComponent = {
    id: string
    region: ComponentRegion
    pageId: string | null
    order: number
    category: ComponentCategory
    variantId: string
    data: ComponentData
    styles: ComponentStyles | null
}

export type RenderablePage = { id: string; slug: string; title: string; order: number }

//a slot between (or around) rendered components — the canvas editor turns
//these into "+ add here" strips. after/before are the adjacent instances.
export type EditorGap = { after: RenderableComponent | null; before: RenderableComponent | null }

export default function TenantSite({
    meta,
    config,
    slug,
    basePath,
    tenantId,
    pages,
    components,
    currentPageId,
    products,
    preview,
    renderEditorGap,
}: {
    meta: SiteMeta
    config: SiteConfig
    slug: string
    basePath: string
    tenantId: string
    pages: RenderablePage[]
    components: RenderableComponent[]
    currentPageId: string
    products?: ProductLite[]
    preview?: boolean
    //editor-only: rendered between/around components (client callers only)
    renderEditorGap?: (gap: EditorGap) => React.ReactNode
}) {
    const theme = themesById[config.themeId] ?? themes[0]

    const pageLinks: SitePageLink[] = [...pages]
        .sort((a, b) => a.order - b.order)
        .map(page => ({ slug: page.slug, title: page.title }))

    const ctx: SiteCtx = {
        tenantId,
        slug,
        basePath,
        business: meta.business,
        pages: pageLinks,
        enabledAddons: config.enabledAddons,
        products,
        preview,
    }

    const visible = componentsForPage(components, currentPageId)

    return (
        <div
            style={{
                ...themeToStyle(theme, config.themeOverrides),
                backgroundColor: "var(--t-bg)",
                fontFamily: "var(--t-font-body)",
                color: "var(--t-text)",
            }}
            className={`${tenantFontsClassName} min-h-screen`}
        >
            {visible.map((component, index) => {
                const entry = variantsById[component.variantId]
                if (entry === undefined || entry.category !== component.category) return null

                //the registry stores type-erased components; the category check
                //above guarantees data matches what the variant expects
                const Component = entry.component as React.ComponentType<SectionProps>
                const styleVars = stylesToVars(component.styles)
                const customCss = component.styles?.css ?? ""

                return (
                    <React.Fragment key={component.id}>
                        {renderEditorGap !== undefined && renderEditorGap({ after: visible[index - 1] ?? null, before: component })}
                        <div data-c={component.id} style={{ display: "contents", ...styleVars }}>
                            {customCss !== "" && <style>{scopeCss(customCss, component.id)}</style>}
                            <Component data={component.data} id={component.id} ctx={ctx} />
                        </div>
                    </React.Fragment>
                )
            })}
            {renderEditorGap !== undefined && renderEditorGap({ after: visible[visible.length - 1] ?? null, before: null })}
        </div>
    )
}
