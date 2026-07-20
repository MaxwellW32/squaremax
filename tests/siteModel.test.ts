import { describe, expect, it } from "vitest"
import { componentCategorySchema, dataSchemaByCategory, defaultComponentData, defaultSiteMeta } from "@/lib/sites/content"
import { scopeCss, stylesToVars } from "@/lib/sites/styles"
import { variants, variantsById, variantsForCategory } from "@/lib/sites/registry"
import { siteTemplates, instantiateTemplate } from "@/lib/sites/siteTemplates"
import { componentsForPage, siblingComponents, sortByOrder } from "@/lib/sites/site"
import { hashPassword, verifyPassword } from "@/lib/sites/passwords"
import { monthlyTotal, BASE_MONTHLY_PRICE, AddonId } from "@/lib/sites/addons"

const business = defaultSiteMeta("Testco").business

//============================================================
// per-category data model
//============================================================

describe("component data model", () => {
    it("every category has a default that passes its own schema", () => {
        for (const category of componentCategorySchema.options) {
            const data = defaultComponentData(category, business)
            expect(data.category).toBe(category)
            expect(() => dataSchemaByCategory[category].parse(data)).not.toThrow()
        }
    })

    it("data from one category fails another category's schema (swap safety)", () => {
        const navbar = defaultComponentData("navbar", business)
        expect(dataSchemaByCategory.hero.safeParse(navbar).success).toBe(false)
    })
})

//============================================================
// registry
//============================================================

describe("variant registry", () => {
    it("has at least one variant for every category and unique ids", () => {
        for (const category of componentCategorySchema.options) {
            expect(variantsForCategory(category).length).toBeGreaterThan(0)
        }
        expect(new Set(variants.map(variant => variant.variantId)).size).toBe(variants.length)
    })

    it("variant ids are namespaced by their category", () => {
        for (const variant of variants) {
            expect(variant.variantId.startsWith(`${variant.category}.`)).toBe(true)
        }
    })
})

//============================================================
// templates -> instances (the copy-per-component flow)
//============================================================

describe("site templates", () => {
    it("includes a blank canvas", () => {
        expect(siteTemplates.some(template => template.id === "blank")).toBe(true)
    })

    it("instantiates every template into valid, uniquely-identified rows", () => {
        for (const template of siteTemplates) {
            const { pages, components } = instantiateTemplate(template, business)

            //a home page always exists
            expect(pages.some(page => page.slug === "")).toBe(true)

            //ids unique across pages + components
            const ids = [...pages.map(page => page.id), ...components.map(component => component.id)]
            expect(new Set(ids).size).toBe(ids.length)

            const pageIds = new Set(pages.map(page => page.id))
            for (const component of components) {
                //data validates against the component's own category
                expect(() => dataSchemaByCategory[component.category].parse(component.data)).not.toThrow()
                //the variant exists and belongs to the category
                expect(variantsById[component.variantId]?.category).toBe(component.category)
                //main components point at a real page; header/footer never do
                if (component.region === "main") expect(pageIds.has(component.pageId ?? "")).toBe(true)
                else expect(component.pageId).toBeNull()
            }
        }
    })

    it("two instantiations of one template share no ids (fresh copies)", () => {
        const first = instantiateTemplate(siteTemplates[1], business)
        const second = instantiateTemplate(siteTemplates[1], business)
        const firstIds = new Set(first.components.map(component => component.id))
        expect(second.components.some(component => firstIds.has(component.id))).toBe(false)
    })
})

//============================================================
// page assembly + ordering
//============================================================

type Row = { id: string; region: "header" | "main" | "footer"; pageId: string | null; order: number }

const rows: Row[] = [
    { id: "nav", region: "header", pageId: null, order: 0 },
    { id: "foot", region: "footer", pageId: null, order: 0 },
    { id: "hero-b", region: "main", pageId: "p1", order: 1 },
    { id: "hero-a", region: "main", pageId: "p1", order: 0 },
    { id: "other", region: "main", pageId: "p2", order: 0 },
]

describe("page assembly", () => {
    it("renders header, then the page's components by order, then footer", () => {
        expect(componentsForPage(rows, "p1").map(row => row.id)).toEqual(["nav", "hero-a", "hero-b", "foot"])
    })

    it("keeps other pages' components out", () => {
        expect(componentsForPage(rows, "p2").map(row => row.id)).toEqual(["nav", "other", "foot"])
    })

    it("siblings share region and (for main) page", () => {
        expect(siblingComponents(rows, rows[2]).map(row => row.id)).toEqual(["hero-a", "hero-b"])
        expect(siblingComponents(rows, rows[0]).map(row => row.id)).toEqual(["nav"])
    })

    it("sortByOrder does not mutate", () => {
        const input = [{ order: 2 }, { order: 1 }]
        sortByOrder(input)
        expect(input[0].order).toBe(2)
    })
})

//============================================================
// per-instance style overrides
//============================================================

describe("scopeCss", () => {
    it("prefixes plain selectors and selector lists", () => {
        expect(scopeCss(".a { color: red }", "x1")).toBe('[data-c="x1"] .a { color: red }')
        expect(scopeCss("h2, .b { margin: 0 }", "x1")).toBe('[data-c="x1"] h2, [data-c="x1"] .b { margin: 0 }')
    })

    it("scopes rules inside @media exactly once", () => {
        const scoped = scopeCss("@media (min-width: 600px) { .a { color: red } .b { color: blue } }", "x1")
        expect(scoped).toContain('[data-c="x1"] .a')
        expect(scoped).toContain('[data-c="x1"] .b')
        expect(scoped).not.toContain('[data-c="x1"] [data-c="x1"]')
    })

    it("mixes top-level and @media rules without cross-contamination", () => {
        const scoped = scopeCss(".top { z-index: 1 } @media print { .inner { display: none } } .after { color: red }", "x1")
        expect(scoped).toContain('[data-c="x1"] .top')
        expect(scoped).toContain('[data-c="x1"] .inner')
        expect(scoped).toContain('[data-c="x1"] .after')
        expect(scoped).not.toContain('[data-c="x1"] @media')
    })

    it("maps token overrides to --t-* vars and skips empties", () => {
        const vars = stylesToVars({ tokens: { primary: "#ff0000", background: "" }, css: "" })
        expect(vars["--t-primary"]).toBe("#ff0000")
        expect(vars["--t-bg"]).toBeUndefined()
    })
})

//============================================================
// customer passwords
//============================================================

describe("passwords", () => {
    it("verifies the right password and rejects the wrong one", () => {
        const stored = hashPassword("correct horse battery staple")
        expect(verifyPassword("correct horse battery staple", stored)).toBe(true)
        expect(verifyPassword("wrong password", stored)).toBe(false)
    })

    it("produces unique salts", () => {
        expect(hashPassword("same")).not.toBe(hashPassword("same"))
    })

    it("rejects malformed stored hashes without throwing", () => {
        expect(verifyPassword("anything", "not-a-hash")).toBe(false)
        expect(verifyPassword("anything", "scrypt$bad$zz$zz")).toBe(false)
    })
})

//============================================================
// pricing
//============================================================

describe("add-on pricing", () => {
    it("base is $5 and each add-on adds its price", () => {
        expect(BASE_MONTHLY_PRICE).toBe(5)
        expect(monthlyTotal([])).toBe(5)
        expect(monthlyTotal(["booking", "inventory"])).toBe(15)
    })

    it("tolerates retired add-on ids from old tenant rows", () => {
        expect(monthlyTotal(["booking", "email-notifications" as AddonId])).toBe(10)
    })
})
