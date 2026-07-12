import { z } from "zod"

//============================================================
// Layer 1 — design tokens (a theme is pure data, no markup).
// At render time a theme becomes CSS custom properties (--t-*)
// on the TENANT PAGE ROOT (never :root) — so marketing chrome
// stays isolated and theme preview is an instant style swap.
// Section variants may ONLY reference these tokens.
//============================================================

//curated, self-hosted font set (loaded via next/font in the tenant route).
//themes reference keys, never raw font names.
export const fontKeySchema = z.enum(["grotesk", "geist", "playfair", "inter", "lora", "nunito"])
export type FontKey = z.infer<typeof fontKeySchema>

//font key -> the CSS variable next/font exposes
export const fontVarByKey: Record<FontKey, string> = {
    grotesk: "var(--font-space-grotesk)",
    geist: "var(--geist)",
    playfair: "var(--font-playfair)",
    inter: "var(--font-inter)",
    lora: "var(--font-lora)",
    nunito: "var(--font-nunito)",
}

export const themeColorsSchema = z.object({
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textMuted: z.string(),
    primary: z.string(),
    primaryContrast: z.string(),
    accent: z.string(),
    border: z.string(),
})
export type ThemeColors = z.infer<typeof themeColorsSchema>

export const themeSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    colors: themeColorsSchema,
    fonts: z.object({
        heading: fontKeySchema,
        body: fontKeySchema,
        headingWeight: z.number(),
        scale: z.number(), //modular type scale ratio
    }),
    shape: z.object({
        radius: z.string(), //e.g. "0.5rem"
        spacing: z.number(), //base unit multiplier
    }),
})
export type Theme = z.infer<typeof themeSchema>

export const themes: Theme[] = themeSchema.array().parse([
    {
        id: "linen",
        name: "Linen",
        colors: { background: "#faf7f2", surface: "#ffffff", text: "#2b2723", textMuted: "#7a7268", primary: "#8a5a2b", primaryContrast: "#ffffff", accent: "#3f6f5f", border: "#e7e0d5" },
        fonts: { heading: "lora", body: "inter", headingWeight: 600, scale: 1.25 },
        shape: { radius: "0.375rem", spacing: 1 },
    },
    {
        id: "midnight",
        name: "Midnight",
        colors: { background: "#101322", surface: "#1a1f33", text: "#eef0f6", textMuted: "#9aa1b5", primary: "#5b7cfa", primaryContrast: "#ffffff", accent: "#f4b860", border: "#2a3050" },
        fonts: { heading: "grotesk", body: "geist", headingWeight: 700, scale: 1.3 },
        shape: { radius: "0.75rem", spacing: 1 },
    },
    {
        id: "barber",
        name: "Barber",
        colors: { background: "#14110f", surface: "#1e1a17", text: "#f3ede4", textMuted: "#a99e90", primary: "#c9a227", primaryContrast: "#14110f", accent: "#8c2f2f", border: "#33291f" },
        fonts: { heading: "playfair", body: "inter", headingWeight: 700, scale: 1.3 },
        shape: { radius: "0.25rem", spacing: 1.1 },
    },
    {
        id: "fresh",
        name: "Fresh",
        colors: { background: "#ffffff", surface: "#f4faf6", text: "#17281d", textMuted: "#5f7568", primary: "#1e9e5a", primaryContrast: "#ffffff", accent: "#12608a", border: "#dcebe1" },
        fonts: { heading: "inter", body: "inter", headingWeight: 700, scale: 1.2 },
        shape: { radius: "0.75rem", spacing: 1 },
    },
    {
        id: "coral",
        name: "Coral",
        colors: { background: "#fff8f6", surface: "#ffffff", text: "#33231f", textMuted: "#8a7570", primary: "#e8604c", primaryContrast: "#ffffff", accent: "#2f6d80", border: "#f3ded8" },
        fonts: { heading: "nunito", body: "nunito", headingWeight: 800, scale: 1.25 },
        shape: { radius: "1rem", spacing: 1 },
    },
    {
        id: "slate",
        name: "Slate",
        colors: { background: "#f2f4f7", surface: "#ffffff", text: "#1c2230", textMuted: "#616a7d", primary: "#2b50e8", primaryContrast: "#ffffff", accent: "#0e9488", border: "#dde1e9" },
        fonts: { heading: "geist", body: "geist", headingWeight: 700, scale: 1.25 },
        shape: { radius: "0.5rem", spacing: 1 },
    },
    {
        id: "espresso",
        name: "Espresso",
        colors: { background: "#241c17", surface: "#2f251e", text: "#f2e8dd", textMuted: "#b3a290", primary: "#d9944a", primaryContrast: "#241c17", accent: "#7fa06b", border: "#3d3128" },
        fonts: { heading: "lora", body: "lora", headingWeight: 600, scale: 1.25 },
        shape: { radius: "0.375rem", spacing: 1.1 },
    },
    {
        id: "studio",
        name: "Studio",
        colors: { background: "#ffffff", surface: "#f6f6f6", text: "#111111", textMuted: "#666666", primary: "#111111", primaryContrast: "#ffffff", accent: "#e52b50", border: "#e5e5e5" },
        fonts: { heading: "grotesk", body: "inter", headingWeight: 700, scale: 1.35 },
        shape: { radius: "0rem", spacing: 1 },
    },
])

export const themesById: Record<string, Theme> = Object.fromEntries(themes.map(theme => [theme.id, theme]))

export const themeOverridesSchema = themeColorsSchema.partial()
export type ThemeOverrides = z.infer<typeof themeOverridesSchema>

//theme (+ per-tenant overrides) -> inline CSS custom properties for the
//tenant page root element. Swapping theme = swapping this style object.
export function themeToStyle(theme: Theme, overrides?: ThemeOverrides): Record<string, string> {
    const colors = { ...theme.colors, ...overrides }
    const scale = theme.fonts.scale
    const space = theme.shape.spacing

    return {
        "--t-bg": colors.background,
        "--t-surface": colors.surface,
        "--t-text": colors.text,
        "--t-text-muted": colors.textMuted,
        "--t-primary": colors.primary,
        "--t-primary-contrast": colors.primaryContrast,
        "--t-accent": colors.accent,
        "--t-border": colors.border,
        "--t-font-heading": fontVarByKey[theme.fonts.heading],
        "--t-font-body": fontVarByKey[theme.fonts.body],
        "--t-heading-weight": String(theme.fonts.headingWeight),
        "--t-radius": theme.shape.radius,
        "--t-text-s": `${(1 / scale).toFixed(3)}rem`,
        "--t-text-m": "1rem",
        "--t-text-l": `${scale.toFixed(3)}rem`,
        "--t-text-xl": `${(scale * scale).toFixed(3)}rem`,
        "--t-text-2xl": `${(scale * scale * scale).toFixed(3)}rem`,
        "--t-text-3xl": `${(scale * scale * scale * scale).toFixed(3)}rem`,
        "--t-space": `${space}rem`,
    }
}
