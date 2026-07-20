import { ComponentType } from "react"
import { ComponentCategory } from "./content"
import { SectionProps } from "./sectionProps"
import { NavbarClassic, NavbarCentered } from "@/components/sites/sections/navbars"
import { HeroSplit, HeroCentered, HeroBanner } from "@/components/sites/sections/heros"
import { TextSimple, TextImage } from "@/components/sites/sections/texts"
import { ServicesGrid, ServicesList } from "@/components/sites/sections/services"
import { GalleryGrid, GalleryStrip, TestimonialsCards, TestimonialsSpotlight, HoursTable, AnnouncementBar } from "@/components/sites/sections/extras"
import { ContactSplit } from "@/components/sites/sections/contacts"
import { ProductsGrid } from "@/components/sites/sections/products"
import { FooterSimple, FooterColumns } from "@/components/sites/sections/footers"
import { BookingPanel } from "@/components/sites/sections/booking"
import { FeatureGridCards, FeatureGridChecklist, StatsStrip, CtaBand, CtaSplit, FaqAccordion, PricingCards, StepsNumbered, StepsTimeline } from "@/components/sites/sections/selling"
import { TeamCards, LogoStripRow, BeforeAfterPairs, VideoEmbed } from "@/components/sites/sections/trust"
import { PriceListClassic, PriceListColumns, LocationMapSplit, EventsList } from "@/components/sites/sections/practical"
import { NewsletterStrip, DividerSimple, EmbedFrame } from "@/components/sites/sections/utility"

//============================================================
// The design reservoir. Every CATEGORY has one data shape
// (lib/sites/content.ts) and any number of visual variants, all
// styled exclusively with --t-* tokens. A placed component keeps
// its own data and hot-swaps between variants of its category —
// adding a design = one component + one entry here.
//============================================================

export type VariantEntry = {
    variantId: string //"hero.split"
    category: ComponentCategory
    label: string //shown in the picker
    //typed against the category's data shape at the definition site; erased
    //here (never = accepts nothing wider) and re-widened at the one render site
    component: ComponentType<SectionProps<never>>
}

export const variants: VariantEntry[] = [
    { variantId: "navbar.classic", category: "navbar", label: "Classic — brand left, links right", component: NavbarClassic },
    { variantId: "navbar.centered", category: "navbar", label: "Centered — stacked & elegant", component: NavbarCentered },

    { variantId: "hero.split", category: "hero", label: "Split — text beside image", component: HeroSplit },
    { variantId: "hero.centered", category: "hero", label: "Centered — minimal statement", component: HeroCentered },
    { variantId: "hero.banner", category: "hero", label: "Banner — full-width photo", component: HeroBanner },

    { variantId: "text.simple", category: "text", label: "Simple centered text", component: TextSimple },
    { variantId: "text.image", category: "text", label: "Text beside image", component: TextImage },

    { variantId: "services.grid", category: "services", label: "Card grid", component: ServicesGrid },
    { variantId: "services.list", category: "services", label: "Menu-style list", component: ServicesList },

    { variantId: "gallery.grid", category: "gallery", label: "Photo grid", component: GalleryGrid },
    { variantId: "gallery.strip", category: "gallery", label: "Scrolling strip with captions", component: GalleryStrip },

    { variantId: "testimonials.cards", category: "testimonials", label: "Quote cards", component: TestimonialsCards },
    { variantId: "testimonials.spotlight", category: "testimonials", label: "Large spotlight quotes", component: TestimonialsSpotlight },

    { variantId: "hours.table", category: "hours", label: "Hours table", component: HoursTable },

    { variantId: "announcement.bar", category: "announcement", label: "Slim promo strip", component: AnnouncementBar },

    { variantId: "contact.split", category: "contact", label: "Details + message form", component: ContactSplit },

    { variantId: "booking.panel", category: "booking", label: "Booking panel", component: BookingPanel },

    { variantId: "products.grid", category: "products", label: "Product grid", component: ProductsGrid },

    { variantId: "footer.simple", category: "footer", label: "One line", component: FooterSimple },
    { variantId: "footer.columns", category: "footer", label: "Columns with links + contact", component: FooterColumns },

    { variantId: "featureGrid.cards", category: "featureGrid", label: "Icon cards", component: FeatureGridCards },
    { variantId: "featureGrid.checklist", category: "featureGrid", label: "Checklist — compact ✓ rows", component: FeatureGridChecklist },

    { variantId: "stats.strip", category: "stats", label: "Big numbers band", component: StatsStrip },

    { variantId: "ctaBanner.band", category: "ctaBanner", label: "Bold color band", component: CtaBand },
    { variantId: "ctaBanner.split", category: "ctaBanner", label: "Text beside image", component: CtaSplit },

    { variantId: "faq.accordion", category: "faq", label: "Accordion — tap to open", component: FaqAccordion },

    { variantId: "pricingPlans.cards", category: "pricingPlans", label: "Plan cards", component: PricingCards },

    { variantId: "steps.numbered", category: "steps", label: "Numbered cards", component: StepsNumbered },
    { variantId: "steps.timeline", category: "steps", label: "Vertical timeline", component: StepsTimeline },

    { variantId: "team.cards", category: "team", label: "Photo cards", component: TeamCards },

    { variantId: "logoStrip.row", category: "logoStrip", label: "Quiet brand row", component: LogoStripRow },

    { variantId: "beforeAfter.pairs", category: "beforeAfter", label: "Side-by-side pairs", component: BeforeAfterPairs },

    { variantId: "video.embed", category: "video", label: "YouTube / Vimeo player", component: VideoEmbed },

    { variantId: "priceList.classic", category: "priceList", label: "Classic menu — dotted leaders", component: PriceListClassic },
    { variantId: "priceList.columns", category: "priceList", label: "Section columns", component: PriceListColumns },

    { variantId: "locationMap.split", category: "locationMap", label: "Details beside map", component: LocationMapSplit },

    { variantId: "events.list", category: "events", label: "Event rows", component: EventsList },

    { variantId: "newsletter.strip", category: "newsletter", label: "Email capture band", component: NewsletterStrip },

    { variantId: "divider.simple", category: "divider", label: "Line or spacing break", component: DividerSimple },

    { variantId: "embed.frame", category: "embed", label: "Sandboxed embed", component: EmbedFrame },
]

export const variantsById: Record<string, VariantEntry> = Object.fromEntries(
    variants.map(variant => [variant.variantId, variant])
)

export function variantsForCategory(category: ComponentCategory): VariantEntry[] {
    return variants.filter(variant => variant.category === category)
}

export function defaultVariantFor(category: ComponentCategory): VariantEntry {
    return variantsForCategory(category)[0]
}
