import { describe, expect, it } from "vitest"
import { normalizeSlug, validateSlug } from "@/lib/sites/slug"

describe("slug normalization", () => {
    it("lowercases and hyphenates", () => {
        expect(normalizeSlug("Joe's Barbershop")).toBe("joes-barbershop")
    })

    it("strips accents and symbols", () => {
        expect(normalizeSlug("Café «Déjà Vu»!")).toBe("cafe-deja-vu")
    })

    it("collapses runs of separators and trims edge hyphens", () => {
        expect(normalizeSlug("  --  Pepper   &  Thyme -- ")).toBe("pepper-thyme")
    })

    it("caps length at 63", () => {
        expect(normalizeSlug("a".repeat(100)).length).toBeLessThanOrEqual(63)
    })
})

describe("slug validation", () => {
    it("accepts a normal business slug", () => {
        expect(validateSlug("fade-district")).toEqual({ ok: true, slug: "fade-district" })
    })

    it("rejects reserved words that would shadow routes", () => {
        for (const reserved of ["admin", "api", "sites", "custom-builds", "dashboard", "pricing", "portfolio", "domains"]) {
            expect(validateSlug(reserved).ok).toBe(false)
        }
    })

    it("rejects slugs that are too short, uppercase, or malformed", () => {
        expect(validateSlug("a").ok).toBe(false)
        expect(validateSlug("Joes").ok).toBe(false)
        expect(validateSlug("-joes").ok).toBe(false)
        expect(validateSlug("joes-").ok).toBe(false)
        expect(validateSlug("jo es").ok).toBe(false)
    })
})
