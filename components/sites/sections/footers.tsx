import React from "react"
import { FooterData } from "@/lib/sites/content"
import { SectionProps, resolveHref } from "@/lib/sites/sectionProps"

function FooterText({ data, ctx }: SectionProps<FooterData>) {
    if (data.text !== "") return <p>{data.text}</p>
    return <p>© {new Date().getFullYear()} {ctx.business.name}</p>
}

//variant: footer.simple — single line
export function FooterSimple(props: SectionProps<FooterData>) {
    const { data, ctx } = props

    return (
        <footer className="border-t bg-[var(--t-bg)] !p-0" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                <FooterText {...props} />
                {data.links.length > 0 && (
                    <nav className="flex flex-wrap gap-3">
                        {data.links.map((link, linkIndex) => (
                            <a key={`${link.label}-${linkIndex}`} className="hover:text-[var(--t-primary)]" href={resolveHref(ctx, link.href)}>{link.label}</a>
                        ))}
                    </nav>
                )}
                <p>
                    Powered by <a className="font-semibold hover:text-[var(--t-primary)]" href="https://squaremaxtech.com" target="_blank" rel="noreferrer">Squaremax</a>
                </p>
            </div>
        </footer>
    )
}

//variant: footer.columns — brand + links + contact
export function FooterColumns(props: SectionProps<FooterData>) {
    const { data, ctx } = props
    const business = ctx.business

    return (
        <footer className="border-t bg-[var(--t-surface)] !p-0" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-[length:var(--t-text-s)] md:grid-cols-3">
                <div className="grid content-start gap-2">
                    <p
                        className="text-[length:var(--t-text-m)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {business.name}
                    </p>
                    {business.tagline !== "" && <p className="text-[var(--t-text-muted)]">{business.tagline}</p>}
                </div>

                <div className="grid content-start gap-1.5 text-[var(--t-text-muted)]">
                    {data.links.map((link, linkIndex) => (
                        <a key={`${link.label}-${linkIndex}`} className="w-fit hover:text-[var(--t-primary)]" href={resolveHref(ctx, link.href)}>{link.label}</a>
                    ))}
                    {data.links.length === 0 && ctx.pages.map(page => (
                        <a key={page.slug} className="w-fit hover:text-[var(--t-primary)]" href={resolveHref(ctx, page.slug === "" ? "/" : `/${page.slug}`)}>
                            {page.slug === "" ? "Home" : page.title}
                        </a>
                    ))}
                </div>

                <div className="grid content-start gap-1.5 text-[var(--t-text-muted)]">
                    {data.showContact && (
                        <>
                            {business.phone !== "" && <p>{business.phone}</p>}
                            {business.email !== "" && <p>{business.email}</p>}
                            {business.address !== "" && <p>{business.address}</p>}
                        </>
                    )}
                    {data.showSocials && business.socials.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {business.socials.map(social => (
                                <a
                                    key={social.url}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="capitalize hover:text-[var(--t-primary)]"
                                >
                                    {social.platform}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t" style={{ borderColor: "var(--t-border)" }}>
                <div className="mx-auto max-w-5xl px-4 py-4 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                    <FooterText {...props} /> <span>Powered by{" "}
                        <a className="font-semibold hover:text-[var(--t-primary)]" href="https://squaremaxtech.com" target="_blank" rel="noreferrer">Squaremax</a></span>
                </div>
            </div>
        </footer>
    )
}
