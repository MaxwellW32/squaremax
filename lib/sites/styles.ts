import { z } from "zod"
import { themeColorsSchema } from "./themes"

//============================================================
// Per-instance style overrides. The site theme sets --t-* tokens
// on the tenant root; a placed component may override any color
// token for ITS subtree (the wrapper re-declares the vars) and
// may carry custom CSS, scoped to the instance by prefixing every
// selector with [data-c="<id>"]. Broad theme first, instance wins.
//============================================================

export const componentStylesSchema = z.object({
    tokens: themeColorsSchema.partial().default({}),
    css: z.string().max(8000).default(""),
})
export type ComponentStyles = z.infer<typeof componentStylesSchema>

export const emptyStyles: ComponentStyles = { tokens: {}, css: "" }

const tokenVarByColorKey: Record<keyof z.infer<typeof themeColorsSchema>, string> = {
    background: "--t-bg",
    surface: "--t-surface",
    text: "--t-text",
    textMuted: "--t-text-muted",
    primary: "--t-primary",
    primaryContrast: "--t-primary-contrast",
    accent: "--t-accent",
    border: "--t-border",
}

//token overrides -> inline vars for the instance wrapper (display:contents,
//so the wrapper never affects layout but its vars cascade to the subtree)
export function stylesToVars(styles: ComponentStyles | null | undefined): Record<string, string> {
    const vars: Record<string, string> = {}
    if (styles == null) return vars
    for (const [key, value] of Object.entries(styles.tokens)) {
        if (typeof value === "string" && value !== "") {
            vars[tokenVarByColorKey[key as keyof typeof tokenVarByColorKey]] = value
        }
    }
    return vars
}

//prefix each selector in a flat rule list with the instance attribute
function scopeFlatRules(css: string, prefix: string): string {
    return css.replace(/([^{}]+)\{/g, (match, selectors: string) => {
        //leave at-rule preludes alone (@keyframes frames, placeholders, …)
        if (selectors.trimStart().startsWith("@")) return match
        const scoped = selectors
            .split(",")
            .map(selector => selector.trim())
            .filter(selector => selector !== "")
            .map(selector => `${prefix} ${selector}`)
            .join(", ")
        return `${scoped} {`
    })
}

//scope custom CSS so it can never leak past its component. Handles selector
//lists ("a, b") and rules nested one level inside @media/@supports; @keyframes
//and other at-rules pass through untouched.
export function scopeCss(css: string, instanceId: string): string {
    const prefix = `[data-c="${instanceId}"]`

    //pull block at-rules out first so their inner rules are scoped exactly
    //once; the placeholder is itself an (at-rule) block so the flat pass both
    //skips it and still sees rules that follow it
    const atBlocks: string[] = []
    const withPlaceholders = css.replace(
        /@(media|supports)([^{]*)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g,
        (_match, atRule: string, condition: string, inner: string) => {
            atBlocks.push(`@${atRule}${condition}{${scopeFlatRules(inner, prefix)}}`)
            return `@SQ_AT_BLOCK_${atBlocks.length - 1}{}`
        },
    )

    return scopeFlatRules(withPlaceholders, prefix)
        .replace(/@SQ_AT_BLOCK_(\d+)\{\}/g, (_match, index: string) => atBlocks[Number(index)])
}
