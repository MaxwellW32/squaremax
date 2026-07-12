import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
            style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
        >
            {children}
        </h2>
    )
}

//variant: about.image-text — classic 2-column image + prose
export function AboutImageText({ content }: SectionProps) {
    const about = content.about
    if (about.body === "") return null

    return (
        <section id="about" className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl items-center gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3.5)] md:grid-cols-[2fr_3fr]">
                {about.imageUrl !== "" ? (
                    <div className="overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={about.imageUrl} alt={about.heading} className="aspect-square w-full object-cover" />
                    </div>
                ) : (
                    <div
                        aria-hidden
                        className="aspect-square w-full rounded-[var(--t-radius)]"
                        style={{ background: "linear-gradient(135deg, var(--t-primary), var(--t-accent))", opacity: 0.85 }}
                    />
                )}

                <div className="grid content-start gap-[var(--t-space)]">
                    <SectionHeading>{about.heading}</SectionHeading>
                    <p className="whitespace-pre-line text-[length:var(--t-text-m)] leading-relaxed text-[var(--t-text-muted)]">{about.body}</p>
                </div>
            </div>
        </section>
    )
}

//variant: about.simple — centered prose, no image
export function AboutSimple({ content }: SectionProps) {
    const about = content.about
    if (about.body === "") return null

    return (
        <section id="about" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-3xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*3.5)] text-center">
                <SectionHeading>{about.heading}</SectionHeading>
                <p className="whitespace-pre-line text-[length:var(--t-text-m)] leading-relaxed text-[var(--t-text-muted)]">{about.body}</p>
            </div>
        </section>
    )
}
