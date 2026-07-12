import React from "react"
import { SiteContent, SectionType } from "@/lib/sites/content"
import { SiteConfig } from "@/lib/sites/config"
import { themesById, themeToStyle, themes } from "@/lib/sites/themes"
import { compositionsById, compositions } from "@/lib/sites/compositions"
import { variantsById } from "@/lib/sites/registry"
import { tenantFontsClassName } from "@/lib/sites/fonts"

//============================================================
// The tenant renderer: theme tokens go on THIS root element
// (never :root), the composition decides section order, and
// per-section overrides swap variants within a section type.
// Server-renderable end to end; interactive bits are islands.
//============================================================

export default function TenantSite({
    content,
    config,
    slug,
    preview,
}: {
    content: SiteContent
    config: SiteConfig
    slug: string
    preview?: boolean
}) {
    const theme = themesById[config.themeId] ?? themes[0]
    const composition = compositionsById[config.compositionId] ?? compositions[0]

    //resolve final variant per section: composition default, then override
    const resolvedVariantIds = composition.sections.map(variantId => {
        const entry = variantsById[variantId]
        if (entry === undefined) return null
        const override = config.variantOverrides[entry.sectionType as SectionType]
        if (override !== undefined && variantsById[override]?.sectionType === entry.sectionType) {
            return override
        }
        return variantId
    }).filter((id): id is string => id !== null)

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
            {resolvedVariantIds.map(variantId => {
                const entry = variantsById[variantId]
                const Component = entry.component
                return <Component key={variantId} content={content} config={config} slug={slug} preview={preview} />
            })}
        </div>
    )
}
