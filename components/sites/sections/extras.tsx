import React from "react"
import { GalleryData, TestimonialsData, HoursData, AnnouncementData } from "@/lib/sites/content"
import { SectionProps, resolveHref } from "@/lib/sites/sectionProps"

function SectionHeading({ children, center }: { children: React.ReactNode; center?: boolean }) {
    return (
        <h2
            className={`text-[length:var(--t-text-xl)] text-[var(--t-text)] ${center === true ? "text-center" : ""}`}
            style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
        >
            {children}
        </h2>
    )
}

//variant: gallery.grid — responsive image grid
export function GalleryGrid({ data }: SectionProps<GalleryData>) {
    if (data.images.length === 0) return null

    return (
        <section id="gallery" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading>{data.heading}</SectionHeading>

                <ul className="grid grid-cols-2 gap-[calc(var(--t-space)*0.5)] sm:grid-cols-3">
                    {data.images.map((image, imageIndex) => (
                        <li key={`${image.src}-${imageIndex}`} className="overflow-hidden rounded-[var(--t-radius)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image.src} alt={image.alt} loading="lazy" className="aspect-square w-full object-cover" />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: gallery.strip — horizontal scroll with captions
export function GalleryStrip({ data }: SectionProps<GalleryData>) {
    if (data.images.length === 0) return null

    return (
        <section id="gallery" className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading>{data.heading}</SectionHeading>

                <ul className="flex snap-x gap-[calc(var(--t-space)*0.75)] overflow-x-auto pb-2">
                    {data.images.map((image, imageIndex) => (
                        <li key={`${image.src}-${imageIndex}`} className="w-64 shrink-0 snap-start">
                            <figure className="grid gap-1.5">
                                <div className="overflow-hidden rounded-[var(--t-radius)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={image.src} alt={image.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                </div>
                                {image.caption !== "" && (
                                    <figcaption className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{image.caption}</figcaption>
                                )}
                            </figure>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: testimonials.cards
export function TestimonialsCards({ data }: SectionProps<TestimonialsData>) {
    if (data.items.length === 0) return null

    return (
        <section className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading center>{data.heading}</SectionHeading>

                <ul className="grid gap-[var(--t-space)] md:grid-cols-2 lg:grid-cols-3">
                    {data.items.map((item, itemIndex) => (
                        <li
                            key={`${item.quote}-${itemIndex}`}
                            className="grid content-between gap-3 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]"
                            style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}
                        >
                            <p className="text-[length:var(--t-text-m)] leading-relaxed text-[var(--t-text)]">“{item.quote}”</p>
                            {(item.author !== "" || item.role !== "") && (
                                <p className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">
                                    — {item.author}{item.role !== "" ? `, ${item.role}` : ""}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: testimonials.spotlight — one large centered quote per row
export function TestimonialsSpotlight({ data }: SectionProps<TestimonialsData>) {
    if (data.items.length === 0) return null

    return (
        <section className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)] text-center">
                <SectionHeading center>{data.heading}</SectionHeading>

                {data.items.map((item, itemIndex) => (
                    <blockquote key={`${item.quote}-${itemIndex}`} className="grid justify-items-center gap-3">
                        <p
                            className="text-[length:var(--t-text-l)] leading-relaxed text-[var(--t-text)]"
                            style={{ fontFamily: "var(--t-font-heading)" }}
                        >
                            “{item.quote}”
                        </p>
                        {(item.author !== "" || item.role !== "") && (
                            <footer className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-widest text-[var(--t-primary)]">
                                {item.author}{item.role !== "" ? ` · ${item.role}` : ""}
                            </footer>
                        )}
                    </blockquote>
                ))}
            </div>
        </section>
    )
}

//variant: hours.table
export function HoursTable({ data }: SectionProps<HoursData>) {
    if (data.entries.length === 0) return null

    return (
        <section id="hours" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading center>{data.heading}</SectionHeading>

                <dl className="mx-auto grid w-full max-w-md gap-1.5">
                    {data.entries.map((entry, entryIndex) => (
                        <div
                            key={`${entry.label}-${entryIndex}`}
                            className="flex items-baseline justify-between gap-4 rounded-[var(--t-radius)] px-4 py-2.5"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            <dt className="font-semibold text-[var(--t-text)]">{entry.label}</dt>
                            <dd className="text-[var(--t-text-muted)]">{entry.hours}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    )
}

//variant: announcement.bar — slim promo strip
export function AnnouncementBar({ data, ctx }: SectionProps<AnnouncementData>) {
    if (data.text === "") return null

    return (
        <aside
            className="!p-0 text-center text-[length:var(--t-text-s)] font-semibold"
            style={{ backgroundColor: "var(--t-accent)", color: "var(--t-primary-contrast)" }}
        >
            <p className="mx-auto max-w-5xl px-4 py-2.5">
                {data.text}
                {data.href !== "" && (
                    <>
                        {" "}
                        <a className="underline underline-offset-2" href={resolveHref(ctx, data.href)}>
                            {data.linkLabel !== "" ? data.linkLabel : "Learn more"}
                        </a>
                    </>
                )}
            </p>
        </aside>
    )
}
