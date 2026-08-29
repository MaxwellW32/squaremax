import React from "react"
import { BookingData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"
import BookingWidget from "@/components/sites/islands/BookingWidget"

//variant: booking.panel — renders only when the booking add-on is enabled
//and this instance lists at least one bookable service (client island inside)
export function BookingPanel({ data, ctx }: SectionProps<BookingData>) {
    if (!ctx.enabledAddons.includes("booking")) return null
    if (data.services.length === 0) return null

    return (
        <section id="booking" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <h2
                    className="text-center text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {data.heading}
                </h2>

                {data.blurb !== "" && (
                    <p className="text-center text-[length:var(--t-text-m)] text-[var(--t-text-muted)]">{data.blurb}</p>
                )}

                <BookingWidget
                    slug={ctx.slug}
                    preview={ctx.preview === true}
                    services={data.services.map(service => ({
                        name: service.name,
                        price: service.price,
                        durationMinutes: service.durationMinutes,
                    }))}
                />
            </div>
        </section>
    )
}
