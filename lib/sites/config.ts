import { z } from "zod"
import { themeOverridesSchema } from "./themes"
import { addonIdSchema } from "./addons"

//============================================================
// Per-tenant presentation config v2. The site's STRUCTURE lives
// in tenantPages + tenantComponents rows (instance model); this
// blob holds only the site-wide look and the purchased add-ons:
//  - themeId + themeOverrides: colors/fonts applied to the whole
//    site via --t-* tokens (components can override per instance)
//  - enabledAddons: feature flags billing picks up automatically
//============================================================

export const siteConfigSchema = z.object({
    schemaVersion: z.literal(2),
    themeId: z.string().min(1),
    themeOverrides: themeOverridesSchema.default({}),
    enabledAddons: addonIdSchema.array().default([]),
})
export type SiteConfig = z.infer<typeof siteConfigSchema>

export function defaultSiteConfig(themeId: string): SiteConfig {
    return siteConfigSchema.parse({
        schemaVersion: 2,
        themeId,
        themeOverrides: {},
        enabledAddons: [],
    })
}
