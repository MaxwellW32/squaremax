import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

//variant: services.grid — card grid
export function ServicesGrid({ content }: SectionProps) {
    const services = content.services
    if (services.items.length === 0) return null

    return (
        <section id="services" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <h2
                    className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {services.heading}
                </h2>

                <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {services.items.map(item => (
                        <li
                            key={item.name}
                            className="grid content-start gap-1.5 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <h3 className="font-semibold text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>{item.name}</h3>
                                {item.price !== "" && <span className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{item.price}</span>}
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

//variant: services.list — menu-style rows with dotted price leaders
export function ServicesList({ content }: SectionProps) {
    const services = content.services
    if (services.items.length === 0) return null

    return (
        <section id="services" className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <h2
                    className="text-center text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {services.heading}
                </h2>

                <ul className="grid gap-[var(--t-space)]">
                    {services.items.map(item => (
                        <li key={item.name} className="grid gap-0.5">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>{item.name}</span>
                                <span aria-hidden className="grow border-b border-dotted" style={{ borderColor: "var(--t-border)" }} />
                                {item.price !== "" && <span className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{item.price}</span>}
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
