import React from "react"
import { NewsletterData, DividerData, EmbedData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"
import { MissingHint } from "./shared"
import NewsletterForm from "@/components/sites/islands/NewsletterForm"

//============================================================
// utilities & capture
//============================================================

//variant: newsletter.strip — email capture band (feeds the customer list;
//pairs with the notifications add-on's announcement blasts)
export function NewsletterStrip({ data, ctx }: SectionProps<NewsletterData>) {
    return (
        <section id="updates" className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-3xl justify-items-center gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*2.5)] text-center">
                <h2
                    className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {data.heading}
                </h2>
                {data.blurb !== "" && <p className="max-w-md text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{data.blurb}</p>}
                <NewsletterForm slug={ctx.slug} buttonLabel={data.buttonLabel} preview={ctx.preview === true} />
            </div>
        </section>
    )
}

//variant: divider.simple — a quiet break between sections
export function DividerSimple({ data }: SectionProps<DividerData>) {
    const padding = data.size === "s" ? "var(--t-space)" : data.size === "l" ? "calc(var(--t-space)*3)" : "calc(var(--t-space)*2)"

    return (
        <div aria-hidden className="bg-[var(--t-bg)]" style={{ paddingTop: padding, paddingBottom: padding }}>
            {data.style === "line" && (
                <hr className="mx-auto max-w-5xl border-0" style={{ borderTop: "1px solid var(--t-border)" }} />
            )}
        </div>
    )
}

//variant: embed.frame — SANDBOXED iframe only (never raw HTML: that would be
//an XSS hole on the platform domain). Covers forms, feeds, widgets.
export function EmbedFrame({ data, ctx }: SectionProps<EmbedData>) {
    const url = data.embedUrl.startsWith("https://") ? data.embedUrl : ""
    if (url === "" && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-4xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*2.5)]">
                {data.heading !== "" && (
                    <h2
                        className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {data.heading}
                    </h2>
                )}

                {url === "" ? (
                    <MissingHint preview={ctx.preview}>Paste an https:// link to embed (forms, feeds, widgets)</MissingHint>
                ) : ctx.preview === true ? (
                    <div aria-hidden className="grid w-full place-items-center rounded-[var(--t-radius)]" style={{ height: Math.min(data.height, 300), backgroundColor: "var(--t-surface)", border: "1px dashed var(--t-border)" }}>
                        <span className="text-[length:var(--t-text-s)] font-semibold text-[var(--t-text-muted)]">Embedded content: {url.slice(0, 60)}…</span>
                    </div>
                ) : (
                    <iframe
                        src={url}
                        title={data.heading !== "" ? data.heading : "Embedded content"}
                        style={{ height: data.height, border: "1px solid var(--t-border)" }}
                        className="w-full rounded-[var(--t-radius)]"
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        referrerPolicy="no-referrer"
                    />
                )}
            </div>
        </section>
    )
}
