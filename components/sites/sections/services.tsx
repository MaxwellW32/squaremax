import React from "react"
import { ServicesData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"

function ServicesHeading({ data }: { data: ServicesData }) {
    return (
        <div className="grid gap-2">
            <h2
                className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
            >
                {data.heading}
            </h2>
            {data.blurb !== "" && <p className="max-w-xl text-[var(--t-text-muted)]">{data.blurb}</p>}
        </div>
    )
}

//variant: services.grid — card grid
export function ServicesGrid({ data }: SectionProps<ServicesData>) {
    if (data.items.length === 0) return null

    return (
        <section id="services" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <ServicesHeading data={data} />

                <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {data.items.map((item, itemIndex) => (
                        <li
                            key={`${item.name}-${itemIndex}`}
                            className="grid content-start gap-2 overflow-hidden rounded-[var(--t-radius)]"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            {item.imageSrc !== "" && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.imageSrc} alt={item.name} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                            )}
                            <div className="grid gap-2 p-[calc(var(--t-space)*1.25)]">
                                <div className="flex items-baseline justify-between gap-3">
                                    <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{item.name}</h3>
                                    {item.price !== "" && <p className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{item.price}</p>}
                                </div>
                                {item.description !== "" && (
                                    <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{item.description}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: services.list — menu-style rows with dotted leaders
export function ServicesList({ data }: SectionProps<ServicesData>) {
    if (data.items.length === 0) return null

    return (
        <section id="services" className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <ServicesHeading data={data} />

                <ul className="grid gap-3">
                    {data.items.map((item, itemIndex) => (
                        <li key={`${item.name}-${itemIndex}`} className="grid gap-1">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{item.name}</h3>
                                <span aria-hidden className="grow border-b border-dotted" style={{ borderColor: "var(--t-border)" }} />
                                {item.price !== "" && <p className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{item.price}</p>}
                            </div>
                            {item.description !== "" && (
                                <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{item.description}</p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
