import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

function HeroCta({ props }: { props: SectionProps }) {
    const { content, config } = props
    const bookingOn = config.enabledAddons.includes("booking")
    const label = content.hero.ctaLabel !== "" ? content.hero.ctaLabel : bookingOn ? "Book now" : "Get in touch"

    return (
        <a
            href={bookingOn ? "#booking" : "#contact"}
            className="w-fit rounded-[var(--t-radius)] px-6 py-3 text-[length:var(--t-text-m)] font-semibold"
            style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
        >
            {label}
        </a>
    )
}

//variant: hero.split — text left, image right (2-column)
export function HeroSplit(props: SectionProps) {
    const { content } = props
    const hero = content.hero

    return (
        <section id="top" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl items-center gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*4)] md:grid-cols-2">
                <div className="grid gap-[var(--t-space)]">
                    <h1
                        className="text-[length:var(--t-text-2xl)] leading-tight text-[var(--t-text)] md:text-[length:var(--t-text-3xl)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {hero.heading}
                    </h1>
                    {hero.subheading !== "" && (
                        <p className="max-w-md text-[length:var(--t-text-m)] text-[var(--t-text-muted)]">{hero.subheading}</p>
                    )}
                    <HeroCta props={props} />
                </div>

                {hero.imageUrl !== "" ? (
                    <div className="overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hero.imageUrl} alt={content.business.name} className="aspect-[4/3] w-full object-cover" />
                    </div>
                ) : (
                    <div
                        aria-hidden
                        className="grid aspect-[4/3] w-full place-items-center rounded-[var(--t-radius)] text-[length:var(--t-text-3xl)]"
                        style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)", color: "var(--t-primary)", fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {content.business.name.slice(0, 1).toUpperCase()}
                    </div>
                )}
            </div>
        </section>
    )
}

//variant: hero.centered — minimal, centered statement
export function HeroCentered(props: SectionProps) {
    const { content } = props
    const hero = content.hero

    return (
        <section id="top" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl justify-items-center gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*5)] text-center">
                {content.business.tagline !== "" && (
                    <p className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-[0.2em] text-[var(--t-primary)]">
                        {content.business.tagline}
                    </p>
                )}
                <h1
                    className="text-[length:var(--t-text-2xl)] leading-tight text-[var(--t-text)] md:text-[length:var(--t-text-3xl)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {hero.heading}
                </h1>
                {hero.subheading !== "" && (
                    <p className="max-w-xl text-[length:var(--t-text-m)] text-[var(--t-text-muted)]">{hero.subheading}</p>
                )}
                <HeroCta props={props} />
            </div>
        </section>
    )
}

//variant: hero.banner — full-bleed image with overlaid text
export function HeroBanner(props: SectionProps) {
    const { content } = props
    const hero = content.hero

    return (
        <section id="top" className="relative isolate !p-0">
            {hero.imageUrl !== "" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.imageUrl} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover" />
            ) : (
                <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundColor: "var(--t-primary)" }} />
            )}
            <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />

            <div className="mx-auto grid max-w-5xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*6)] text-white">
                <h1
                    className="max-w-2xl text-[length:var(--t-text-2xl)] leading-tight md:text-[length:var(--t-text-3xl)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {hero.heading}
                </h1>
                {hero.subheading !== "" && <p className="max-w-xl text-[length:var(--t-text-m)] text-white/85">{hero.subheading}</p>}
                <HeroCta props={props} />
            </div>
        </section>
    )
}
