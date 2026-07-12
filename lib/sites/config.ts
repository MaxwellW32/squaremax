import { z } from "zod"
import { sectionTypeSchema } from "./content"
import { themeOverridesSchema } from "./themes"
import { addonIdSchema } from "./addons"

//============================================================
// Per-tenant presentation config. Content never lives here —
// this is WHICH design renders it:
//  - compositionId: the chosen layout (ordered section list)
//  - variantOverrides: per-section swaps within the same class
//    (e.g. navbar.classic -> navbar.centered), the core of the
//    "switch this component for another design" experience
//  - themeId + themeOverrides: any theme on any layout
//============================================================

export const siteConfigSchema = z.object({
    schemaVersion: z.literal(1),
    compositionId: z.string().min(1),
    variantOverrides: z.partialRecord(sectionTypeSchema, z.string()).default({}),
    themeId: z.string().min(1),
    themeOverrides: themeOverridesSchema.default({}),
    enabledAddons: addonIdSchema.array().default([]),
})
export type SiteConfig = z.infer<typeof siteConfigSchema>

export function defaultSiteConfig(compositionId: string, themeId: string): SiteConfig {
    return siteConfigSchema.parse({
        schemaVersion: 1,
        compositionId,
        variantOverrides: {},
        themeId,
        themeOverrides: {},
        enabledAddons: [],
    })
}
