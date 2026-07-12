import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

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

//variant: gallery.grid — responsive image grid (gallery add-on)
export function GalleryGrid({ content, config }: SectionProps) {
    if (!config.enabledAddons.includes("gallery")) return null
    const gallery = content.gallery
    if (gallery.images.length === 0) return null

    return (
        <section id="gallery" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading>{gallery.heading}</SectionHeading>

                <ul className="grid grid-cols-2 gap-[calc(var(--t-space)*0.5)] sm:grid-cols-3">
                    {gallery.images.map(image => (
                        <li key={image.src} className="overflow-hidden rounded-[var(--t-radius)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image.src} alt={image.alt} loading="lazy" className="aspect-square w-full object-cover" />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: testimonials.cards
export function TestimonialsCards({ content }: SectionProps) {
    const testimonials = content.testimonials
    if (testimonials.items.length === 0) return null

    return (
        <section className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading center>{testimonials.heading}</SectionHeading>

                <ul className="grid gap-[var(--t-space)] md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.items.map(item => (
                        <li
                            key={item.quote}
                            className="grid content-between gap-3 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]"
                            style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}
                        >
                            <p className="text-[length:var(--t-text-m)] leading-relaxed text-[var(--t-text)]">“{item.quote}”</p>
                            {item.author !== "" && (
                                <p className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">— {item.author}</p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: hours.table
export function HoursTable({ content }: SectionProps) {
    const hours = content.hours
    if (hours.entries.length === 0) return null

    return (
        <section id="hours" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading center>{hours.heading}</SectionHeading>

                <dl className="mx-auto grid w-full max-w-md gap-1.5">
                    {hours.entries.map(entry => (
                        <div
                            key={entry.label}
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
