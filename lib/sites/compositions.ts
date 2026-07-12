import { z } from "zod"

//============================================================
// Layer 3 — layout compositions ("website designs"): an
// ordered list of variant ids + a default theme. Because the
// layers are independent, any theme applies to any composition
// and any variant can be swapped for a sibling of its section.
//============================================================

export const compositionSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    sections: z.string().array().min(1), //ordered variant ids
    defaultThemeId: z.string().min(1),
})
export type Composition = z.infer<typeof compositionSchema>

export const compositions: Composition[] = compositionSchema.array().parse([
    {
        id: "storefront-classic",
        name: "Storefront Classic",
        description: "The full-service business page: services up front, story, reviews, hours and contact.",
        sections: ["navbar.classic", "hero.split", "services.grid", "about.image-text", "gallery.grid", "testimonials.cards", "hours.table", "booking.panel", "contact.split", "footer.columns"],
        defaultThemeId: "linen",
    },
    {
        id: "bold-banner",
        name: "Bold Banner",
        description: "A big photo-first opener with a menu-style service list. Great for restaurants and salons.",
        sections: ["navbar.centered", "hero.banner", "services.list", "gallery.grid", "about.simple", "testimonials.cards", "booking.panel", "contact.split", "footer.simple"],
        defaultThemeId: "midnight",
    },
    {
        id: "minimal-card",
        name: "Minimal Card",
        description: "Quiet and typographic — your name, what you do, how to reach you. Nothing extra.",
        sections: ["navbar.classic", "hero.centered", "about.simple", "services.list", "hours.table", "booking.panel", "contact.split", "footer.simple"],
        defaultThemeId: "studio",
    },
])

export const compositionsById: Record<string, Composition> = Object.fromEntries(
    compositions.map(composition => [composition.id, composition])
)
