import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

//nav links derive from which sections have content — no config needed
function navLinks({ content, config }: SectionProps): { href: string; label: string }[] {
    const links: { href: string; label: string }[] = []
    if (content.services.items.length > 0) links.push({ href: "#services", label: content.services.heading })
    if (content.about.body !== "") links.push({ href: "#about", label: content.about.heading })
    if (config.enabledAddons.includes("gallery") && content.gallery.images.length > 0) links.push({ href: "#gallery", label: content.gallery.heading })
    links.push({ href: "#contact", label: content.contact.heading })
    return links
}

function BrandMark({ name, logoUrl }: { name: string; logoUrl: string }) {
    if (logoUrl !== "") {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={logoUrl} alt={`${name} logo`} className="h-9 w-auto" />
    }
    return (
        <span
            className="text-[length:var(--t-text-l)] tracking-tight"
            style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
        >
            {name}
        </span>
    )
}

//variant: navbar.classic — brand left, links right
export function NavbarClassic(props: SectionProps) {
    const { content, config } = props
    const bookingOn = config.enabledAddons.includes("booking")

    return (
        <header className="sticky top-0 z-40 border-b bg-[var(--t-bg)]/95 backdrop-blur" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 text-[var(--t-text)]">
                <a href="#top"><BrandMark name={content.business.name} logoUrl={content.business.logoUrl} /></a>

                <nav className="flex items-center gap-1 text-[length:var(--t-text-s)] sm:gap-2 sm:text-[length:var(--t-text-m)]">
                    {navLinks(props).map(link => (
                        <a key={link.href} href={link.href} className="hidden rounded-[var(--t-radius)] px-3 py-1.5 hover:bg-[var(--t-surface)] sm:block">
                            {link.label}
                        </a>
                    ))}
                    <a
                        href={bookingOn ? "#booking" : "#contact"}
                        className="rounded-[var(--t-radius)] px-4 py-2 font-semibold"
                        style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                    >
                        {bookingOn ? "Book now" : (content.hero.ctaLabel || "Get in touch")}
                    </a>
                </nav>
            </div>
        </header>
    )
}

//variant: navbar.centered — stacked brand over centered links
export function NavbarCentered(props: SectionProps) {
    const { content } = props

    return (
        <header className="border-b bg-[var(--t-bg)]" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto grid max-w-5xl justify-items-center gap-2 px-4 py-5 text-[var(--t-text)]">
                <a href="#top"><BrandMark name={content.business.name} logoUrl={content.business.logoUrl} /></a>

                {content.business.tagline !== "" && (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{content.business.tagline}</p>
                )}

                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[length:var(--t-text-s)]">
                    {navLinks(props).map(link => (
                        <a key={link.href} href={link.href} className="uppercase tracking-widest hover:text-[var(--t-primary)]">
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    )
}
