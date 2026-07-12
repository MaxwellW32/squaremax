import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"
import BookingWidget from "@/components/sites/islands/BookingWidget"

//variant: booking.panel — renders only when the booking add-on is enabled
//and at least one service exists (the widget itself is a client island)
export function BookingPanel({ content, config, slug, preview }: SectionProps) {
    if (!config.enabledAddons.includes("booking")) return null
    if (content.services.items.length === 0) return null

    return (
        <section id="booking" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <h2
                    className="text-center text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    Book an appointment
                </h2>

                <BookingWidget
                    slug={slug}
                    preview={preview === true}
                    services={content.services.items.map(item => ({
                        name: item.name,
                        price: item.price,
                        durationMinutes: item.durationMinutes ?? 30,
                    }))}
                />
            </div>
        </section>
    )
}
