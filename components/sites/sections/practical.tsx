import React from "react"
import { PriceListData, LocationMapData, EventsData } from "@/lib/sites/content"
import { SectionProps, resolveHref } from "@/lib/sites/sectionProps"
import { SectionHeading, MissingHint } from "./shared"

//============================================================
// practical info sections
//============================================================

//variant: priceList.classic — grouped menu with dotted leaders
export function PriceListClassic({ data, ctx }: SectionProps<PriceListData>) {
    if (data.sections.length === 0 && ctx.preview !== true) return null

    return (
        <section id="menu" className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} center />
                {data.sections.length === 0 && <MissingHint preview={ctx.preview}>Add menu sections (Starters, Mains…)</MissingHint>}

                {data.sections.map((menuSection, sectionIndex) => (
                    <div key={sectionIndex} className="grid gap-3">
                        {menuSection.title !== "" && (
                            <h3
                                className="text-center text-[length:var(--t-text-l)] uppercase tracking-widest text-[var(--t-primary)]"
                                style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                            >
                                {menuSection.title}
                            </h3>
                        )}
                        <ul className="grid gap-2.5">
                            {menuSection.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="grid gap-0.5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-[var(--t-text)]">{item.name}</span>
                                        <span aria-hidden className="grow border-b border-dotted" style={{ borderColor: "var(--t-border)" }} />
                                        {item.price !== "" && <span className="whitespace-nowrap font-semibold text-[var(--t-primary)]">{item.price}</span>}
                                    </div>
                                    {item.description !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{item.description}</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}

//variant: priceList.columns — sections side by side
export function PriceListColumns({ data, ctx }: SectionProps<PriceListData>) {
    if (data.sections.length === 0 && ctx.preview !== true) return null

    return (
        <section id="menu" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.sections.length === 0 && <MissingHint preview={ctx.preview}>Add menu sections</MissingHint>}

                <div className="grid gap-[var(--t-space)] md:grid-cols-2">
                    {data.sections.map((menuSection, sectionIndex) => (
                        <div key={sectionIndex} className="grid content-start gap-3 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                            {menuSection.title !== "" && (
                                <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-primary)]">{menuSection.title}</h3>
                            )}
                            <ul className="grid gap-2">
                                {menuSection.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="grid gap-0.5">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <span className="font-semibold text-[var(--t-text)]">{item.name}</span>
                                            {item.price !== "" && <span className="whitespace-nowrap text-[length:var(--t-text-s)] font-semibold text-[var(--t-primary)]">{item.price}</span>}
                                        </div>
                                        {item.description !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{item.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

//variant: locationMap.split — details beside the map
export function LocationMapSplit({ data, ctx }: SectionProps<LocationMapData>) {
    const address = data.address !== "" ? data.address : ctx.business.address
    const mapsSearchUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`

    return (
        <section id="location" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl items-start gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)] md:grid-cols-[2fr_3fr]">
                <div className="grid content-start gap-[var(--t-space)]">
                    <SectionHeading heading={data.heading} blurb={data.blurb} />
                    {address !== "" ? (
                        <p className="text-[length:var(--t-text-m)] text-[var(--t-text)]">📍 {address}</p>
                    ) : (
                        <MissingHint preview={ctx.preview}>Add your address (here or in Business info)</MissingHint>
                    )}
                    {ctx.business.phone !== "" && (
                        <p className="text-[length:var(--t-text-m)] text-[var(--t-text)]"><a className="hover:text-[var(--t-primary)]" href={`tel:${ctx.business.phone}`}>📞 {ctx.business.phone}</a></p>
                    )}
                    {data.showDirectionsButton && address !== "" && (
                        <a
                            href={mapsSearchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-fit rounded-[var(--t-radius)] px-5 py-2.5 font-semibold"
                            style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                        >
                            Get directions
                        </a>
                    )}
                </div>

                {data.mapEmbedUrl !== "" && !ctx.preview ? (
                    <div className="overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-border)" }}>
                        <iframe
                            src={data.mapEmbedUrl}
                            title="Map"
                            className="aspect-[4/3] w-full md:aspect-auto md:h-80"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                    </div>
                ) : (
                    <a
                        href={address !== "" ? mapsSearchUrl : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="grid aspect-[4/3] place-items-center rounded-[var(--t-radius)] md:h-80"
                        style={{ backgroundColor: "var(--t-surface)", border: "1px dashed var(--t-border)" }}
                    >
                        <span className="grid justify-items-center gap-1 text-center">
                            <span aria-hidden className="text-3xl">🗺️</span>
                            <span className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-text-muted)]">
                                {ctx.preview === true && data.mapEmbedUrl === "" ? "Paste a Google Maps embed link for a live map" : address !== "" ? "Open in Google Maps" : ""}
                            </span>
                        </span>
                    </a>
                )}
            </div>
        </section>
    )
}

//variant: events.list — upcoming events as rows
export function EventsList({ data, ctx }: SectionProps<EventsData>) {
    if (data.events.length === 0 && ctx.preview !== true) return null

    return (
        <section id="events" className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} />
                {data.events.length === 0 && <MissingHint preview={ctx.preview}>Add upcoming events</MissingHint>}

                <ul className="grid gap-2.5">
                    {data.events.map((event, eventIndex) => (
                        <li
                            key={eventIndex}
                            className="grid gap-1 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)] sm:grid-cols-[auto_1fr] sm:gap-x-5"
                            style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}
                        >
                            <p className="whitespace-nowrap text-[length:var(--t-text-s)] font-bold uppercase tracking-wide text-[var(--t-primary)]">{event.dateText}</p>
                            <div className="grid gap-0.5">
                                <h3 className="font-semibold text-[var(--t-text)]">
                                    {event.href !== "" ? (
                                        <a href={resolveHref(ctx, event.href)} className="hover:text-[var(--t-primary)]">{event.title}</a>
                                    ) : event.title}
                                </h3>
                                {event.location !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">📍 {event.location}</p>}
                                {event.description !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{event.description}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
