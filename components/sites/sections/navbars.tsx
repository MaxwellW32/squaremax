import React from "react"
import { NavbarData } from "@/lib/sites/content"
import { SectionProps, resolveHref, defaultCtaHref } from "@/lib/sites/sectionProps"

//navbar variants render THIS instance's menu (with one dropdown level).
//An empty menu falls back to links for the site's pages.

function menuFromPages(props: SectionProps<NavbarData>): NavbarData["menu"] {
    if (props.data.menu.length > 0) return props.data.menu
    return props.ctx.pages.map(page => ({
        label: page.slug === "" ? "Home" : page.title,
        href: page.slug === "" ? "/" : `/${page.slug}`,
        subMenu: [],
    }))
}

function BrandMark({ props }: { props: SectionProps<NavbarData> }) {
    const { data, ctx } = props
    const name = data.logoText !== "" ? data.logoText : ctx.business.name
    const logoSrc = data.logoImageSrc !== "" ? data.logoImageSrc : ctx.business.logoUrl

    if (logoSrc !== "") {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={logoSrc} alt={`${name} logo`} className="h-9 w-auto" />
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

function MenuLinks({ props, linkClassName }: { props: SectionProps<NavbarData>; linkClassName: string }) {
    const { ctx } = props

    return (
        <>
            {menuFromPages(props).map((item, itemIndex) => (
                <div key={`${item.label}-${itemIndex}`} className="group relative">
                    <a href={resolveHref(ctx, item.href)} className={linkClassName}>
                        {item.label}{item.subMenu.length > 0 ? " ▾" : ""}
                    </a>

                    {item.subMenu.length > 0 && (
                        <div
                            className="invisible absolute left-0 top-full z-50 grid min-w-44 gap-0.5 rounded-[var(--t-radius)] p-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            {item.subMenu.map((sub, subIndex) => (
                                <a
                                    key={`${sub.label}-${subIndex}`}
                                    href={resolveHref(ctx, sub.href)}
                                    className="rounded-[var(--t-radius)] px-3 py-1.5 text-[length:var(--t-text-s)] hover:bg-[var(--t-bg)]"
                                >
                                    {sub.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    )
}

function CtaButton({ props }: { props: SectionProps<NavbarData> }) {
    const { data, ctx } = props
    if (!data.showCta) return null

    const label = data.cta !== undefined && data.cta.label !== "" ? data.cta.label
        : ctx.enabledAddons.includes("booking") ? "Book now" : "Get in touch"
    const href = data.cta !== undefined && data.cta.href !== "" ? data.cta.href : defaultCtaHref(ctx)

    return (
        <a
            href={resolveHref(ctx, href)}
            className="rounded-[var(--t-radius)] px-4 py-2 font-semibold"
            style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
        >
            {label}
        </a>
    )
}

//variant: navbar.classic — brand left, links right
export function NavbarClassic(props: SectionProps<NavbarData>) {
    const { ctx } = props

    return (
        <header className="sticky top-0 z-40 border-b bg-[var(--t-bg)]/95 backdrop-blur" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 text-[var(--t-text)]">
                <a href={resolveHref(ctx, "/")}><BrandMark props={props} /></a>

                <nav className="flex items-center gap-1 text-[length:var(--t-text-s)] sm:gap-2 sm:text-[length:var(--t-text-m)]">
                    <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                        <MenuLinks props={props} linkClassName="rounded-[var(--t-radius)] px-3 py-1.5 hover:bg-[var(--t-surface)] block" />
                    </div>
                    <CtaButton props={props} />
                </nav>
            </div>
        </header>
    )
}

//variant: navbar.centered — stacked brand over centered links
export function NavbarCentered(props: SectionProps<NavbarData>) {
    const { ctx } = props

    return (
        <header className="border-b bg-[var(--t-bg)]" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto grid max-w-5xl justify-items-center gap-2 px-4 py-5 text-[var(--t-text)]">
                <a href={resolveHref(ctx, "/")}><BrandMark props={props} /></a>

                {ctx.business.tagline !== "" && (
                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{ctx.business.tagline}</p>
                )}

                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[length:var(--t-text-s)]">
                    <MenuLinks props={props} linkClassName="uppercase tracking-widest hover:text-[var(--t-primary)]" />
                </nav>
            </div>
        </header>
    )
}
