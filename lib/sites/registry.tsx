import { ComponentType } from "react"
import { SectionType } from "./content"
import { SectionProps } from "./sectionProps"
import { NavbarClassic, NavbarCentered } from "@/components/sites/sections/navbars"
import { HeroSplit, HeroCentered, HeroBanner } from "@/components/sites/sections/heros"
import { AboutImageText, AboutSimple } from "@/components/sites/sections/abouts"
import { ServicesGrid, ServicesList } from "@/components/sites/sections/services"
import { GalleryGrid, TestimonialsCards, HoursTable } from "@/components/sites/sections/extras"
import { ContactSplit } from "@/components/sites/sections/contacts"
import { FooterSimple, FooterColumns } from "@/components/sites/sections/footers"
import { BookingPanel } from "@/components/sites/sections/booking"

//============================================================
// Layer 2 — the component reservoir. Every section type has
// one content schema (lib/sites/content.ts) and any number of
// visual variants, all styled exclusively with --t-* tokens.
// Adding a variant = one component + one entry here. Clients
// swap variants WITHIN a section type ("other navbar designs").
//============================================================

export type VariantEntry = {
    variantId: string //"hero.split"
    sectionType: SectionType
    label: string //shown in the picker
    component: ComponentType<SectionProps>
}

export const variants: VariantEntry[] = [
    { variantId: "navbar.classic", sectionType: "navbar", label: "Classic — brand left, links right", component: NavbarClassic },
    { variantId: "navbar.centered", sectionType: "navbar", label: "Centered — stacked & elegant", component: NavbarCentered },

    { variantId: "hero.split", sectionType: "hero", label: "Split — text beside image", component: HeroSplit },
    { variantId: "hero.centered", sectionType: "hero", label: "Centered — minimal statement", component: HeroCentered },
    { variantId: "hero.banner", sectionType: "hero", label: "Banner — full-width photo", component: HeroBanner },

    { variantId: "about.image-text", sectionType: "about", label: "Image + text, two columns", component: AboutImageText },
    { variantId: "about.simple", sectionType: "about", label: "Simple centered text", component: AboutSimple },

    { variantId: "services.grid", sectionType: "services", label: "Card grid", component: ServicesGrid },
    { variantId: "services.list", sectionType: "services", label: "Menu-style list", component: ServicesList },

    { variantId: "gallery.grid", sectionType: "gallery", label: "Photo grid", component: GalleryGrid },

    { variantId: "testimonials.cards", sectionType: "testimonials", label: "Quote cards", component: TestimonialsCards },

    { variantId: "hours.table", sectionType: "hours", label: "Hours table", component: HoursTable },

    { variantId: "contact.split", sectionType: "contact", label: "Details + message form", component: ContactSplit },

    { variantId: "booking.panel", sectionType: "booking", label: "Booking panel", component: BookingPanel },

    { variantId: "footer.simple", sectionType: "footer", label: "One line", component: FooterSimple },
    { variantId: "footer.columns", sectionType: "footer", label: "Columns with contact + hours", component: FooterColumns },
]

export const variantsById: Record<string, VariantEntry> = Object.fromEntries(
    variants.map(variant => [variant.variantId, variant])
)

export function variantsForSection(sectionType: SectionType): VariantEntry[] {
    return variants.filter(variant => variant.sectionType === sectionType)
}
