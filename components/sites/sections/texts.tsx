import React from "react"
import { TextData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"

//blank line = paragraph break
function Paragraphs({ body }: { body: string }) {
    return (
        <>
            {body.split(/\n\s*\n/).map((paragraph, paragraphIndex) => (
                paragraph.trim() !== "" && (
                    <p key={paragraphIndex} className="text-[length:var(--t-text-m)] leading-relaxed text-[var(--t-text-muted)]">
                        {paragraph.trim()}
                    </p>
                )
            ))}
        </>
    )
}

//variant: text.simple — centered heading + prose
export function TextSimple({ data, id }: SectionProps<TextData>) {
    return (
        <section id={`s-${id.slice(0, 8)}`} className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*3.5)]">
                {data.heading !== "" && (
                    <h2
                        className="text-center text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {data.heading}
                    </h2>
                )}
                <Paragraphs body={data.body} />
            </div>
        </section>
    )
}

//variant: text.image — prose beside an image (side configurable)
export function TextImage({ data, id, ctx }: SectionProps<TextData>) {
    const image = data.imageSrc !== "" ? (
        <div className="overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.imageSrc} alt={data.heading !== "" ? data.heading : ctx.business.name} className="aspect-[4/3] w-full object-cover" />
        </div>
    ) : null

    return (
        <section id={`s-${id.slice(0, 8)}`} className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl items-center gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)] md:grid-cols-2">
                {data.imageSide === "left" && image}
                <div className="grid content-start gap-[var(--t-space)]">
                    {data.heading !== "" && (
                        <h2
                            className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                            style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                        >
                            {data.heading}
                        </h2>
                    )}
                    <Paragraphs body={data.body} />
                </div>
                {data.imageSide === "right" && image}
            </div>
        </section>
    )
}
