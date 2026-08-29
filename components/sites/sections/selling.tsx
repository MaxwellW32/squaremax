import React from "react"
import { FeatureGridData, StatsData, CtaBannerData, FaqData, PricingPlansData, StepsData } from "@/lib/sites/content"
import { SectionProps, resolveHref, defaultCtaHref } from "@/lib/sites/sectionProps"
import { SectionHeading, ImgOrPlaceholder, MissingHint } from "./shared"

//============================================================
// selling & converting sections
//============================================================

//variant: featureGrid.cards — icon cards in a grid
export function FeatureGridCards({ data, ctx }: SectionProps<FeatureGridData>) {
    if (data.items.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.items.length === 0 && <MissingHint preview={ctx.preview}>Add your highlights (icon, title, text)</MissingHint>}

                <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {data.items.map((item, itemIndex) => (
                        <li
                            key={itemIndex}
                            className="grid content-start gap-2 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            {item.icon !== "" && (
                                item.icon.startsWith("http") || item.icon.startsWith("/")
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={item.icon} alt="" className="size-9 object-contain" />
                                    : <span aria-hidden className="text-2xl">{item.icon}</span>
                            )}
                            <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{item.title}</h3>
                            {item.body !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{item.body}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: featureGrid.checklist — compact ✓ rows, two columns
export function FeatureGridChecklist({ data, ctx }: SectionProps<FeatureGridData>) {
    if (data.items.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-4xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} center />
                {data.items.length === 0 && <MissingHint preview={ctx.preview}>Add your highlights</MissingHint>}

                <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {data.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-baseline gap-2.5">
                            <span aria-hidden className="font-bold" style={{ color: "var(--t-primary)" }}>✓</span>
                            <span className="text-[length:var(--t-text-m)] text-[var(--t-text)]">
                                <strong>{item.title}</strong>{item.body !== "" ? <span className="text-[var(--t-text-muted)]"> — {item.body}</span> : null}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: stats.strip — big numbers in a band
export function StatsStrip({ data, ctx }: SectionProps<StatsData>) {
    if (data.items.length === 0 && ctx.preview !== true) return null

    return (
        <section style={{ backgroundColor: "var(--t-primary)" }}>
            <div className="mx-auto grid max-w-5xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*2.5)]">
                {data.heading !== "" && (
                    <p className="text-center text-[length:var(--t-text-s)] font-semibold uppercase tracking-widest" style={{ color: "var(--t-primary-contrast)", opacity: 0.8 }}>
                        {data.heading}
                    </p>
                )}
                {data.items.length === 0 && <MissingHint preview={ctx.preview}>Add your numbers (“10+ years”, “500 customers”)</MissingHint>}

                <dl className="flex flex-wrap items-start justify-center gap-x-12 gap-y-4 text-center">
                    {data.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="grid gap-0.5">
                            <dd
                                className="text-[length:var(--t-text-2xl)]"
                                style={{ color: "var(--t-primary-contrast)", fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                            >
                                {item.value}
                            </dd>
                            <dt className="text-[length:var(--t-text-s)]" style={{ color: "var(--t-primary-contrast)", opacity: 0.8 }}>{item.label}</dt>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    )
}

function CtaButton({ data, ctx, inverted }: { data: CtaBannerData; ctx: SectionProps["ctx"]; inverted?: boolean }) {
    const label = data.ctaLabel !== "" ? data.ctaLabel : ctx.enabledAddons.includes("booking") ? "Book now" : "Get in touch"
    const href = data.ctaHref !== "" ? data.ctaHref : defaultCtaHref(ctx)
    return (
        <a
            href={resolveHref(ctx, href)}
            className="w-fit rounded-[var(--t-radius)] px-6 py-3 text-[length:var(--t-text-m)] font-semibold"
            style={inverted === true
                ? { backgroundColor: "var(--t-primary-contrast)", color: "var(--t-primary)" }
                : { backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
        >
            {label}
        </a>
    )
}

//variant: ctaBanner.band — bold full-width call to action
export function CtaBand({ data, ctx }: SectionProps<CtaBannerData>) {
    return (
        <section style={{ backgroundColor: "var(--t-primary)" }}>
            <div className="mx-auto grid max-w-4xl justify-items-center gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*3)] text-center">
                <h2
                    className="text-[length:var(--t-text-xl)]"
                    style={{ color: "var(--t-primary-contrast)", fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {data.heading !== "" ? data.heading : `Ready? ${ctx.business.name} is too.`}
                </h2>
                {data.blurb !== "" && <p style={{ color: "var(--t-primary-contrast)", opacity: 0.85 }}>{data.blurb}</p>}
                <CtaButton data={data} ctx={ctx} inverted />
            </div>
        </section>
    )
}

//variant: ctaBanner.split — text beside an image
export function CtaSplit({ data, ctx }: SectionProps<CtaBannerData>) {
    return (
        <section className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-5xl items-center gap-[calc(var(--t-space)*2)] px-4 py-[calc(var(--t-space)*3)] md:grid-cols-[3fr_2fr]">
                <div className="grid gap-[var(--t-space)]">
                    <h2
                        className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {data.heading !== "" ? data.heading : `Ready? ${ctx.business.name} is too.`}
                    </h2>
                    {data.blurb !== "" && <p className="text-[var(--t-text-muted)]">{data.blurb}</p>}
                    <CtaButton data={data} ctx={ctx} />
                </div>
                <ImgOrPlaceholder src={data.imageSrc} alt={ctx.business.name} aspectClassName="aspect-[4/3]" className="rounded-[var(--t-radius)]" label="photo" preview={ctx.preview} />
            </div>
        </section>
    )
}

//variant: faq.accordion — pure CSS details/summary, no JS needed
export function FaqAccordion({ data, ctx }: SectionProps<FaqData>) {
    if (data.items.length === 0 && ctx.preview !== true) return null

    return (
        <section id="faq" className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.items.length === 0 && <MissingHint preview={ctx.preview}>Add questions & answers</MissingHint>}

                <div className="grid gap-2">
                    {data.items.map((item, itemIndex) => (
                        <details
                            key={itemIndex}
                            className="group rounded-[var(--t-radius)] px-4 py-3"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 font-semibold text-[var(--t-text)]">
                                {item.question}
                                <span aria-hidden className="transition-transform group-open:rotate-45" style={{ color: "var(--t-primary)" }}>+</span>
                            </summary>
                            <p className="pt-2 text-[length:var(--t-text-s)] leading-relaxed text-[var(--t-text-muted)]">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

//variant: pricingPlans.cards — plan cards, one highlightable
export function PricingCards({ data, ctx }: SectionProps<PricingPlansData>) {
    if (data.plans.length === 0 && ctx.preview !== true) return null

    return (
        <section id="plans" className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} center />
                {data.plans.length === 0 && <MissingHint preview={ctx.preview}>Add your plans</MissingHint>}

                <ul className="mx-auto grid w-full max-w-4xl gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {data.plans.map((plan, planIndex) => (
                        <li
                            key={planIndex}
                            className="grid content-start gap-3 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.5)]"
                            style={plan.highlighted
                                ? { backgroundColor: "var(--t-bg)", border: "2px solid var(--t-primary)" }
                                : { backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}
                        >
                            <div className="grid gap-1">
                                <h3 className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text)]">{plan.name}</h3>
                                <p className="text-[length:var(--t-text-xl)] text-[var(--t-primary)]" style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}>
                                    {plan.price}<span className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{plan.period}</span>
                                </p>
                            </div>
                            {plan.features.some(feature => feature.trim() !== "") && (
                                <ul className="grid gap-1.5 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                                    {plan.features.filter(feature => feature.trim() !== "").map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-baseline gap-2">
                                            <span aria-hidden style={{ color: "var(--t-primary)" }}>✓</span>{feature}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {(plan.ctaLabel !== "" || plan.highlighted) && (
                                <a
                                    href={resolveHref(ctx, plan.ctaHref !== "" ? plan.ctaHref : defaultCtaHref(ctx))}
                                    className="mt-1 w-fit rounded-[var(--t-radius)] px-4 py-2 text-[length:var(--t-text-s)] font-semibold"
                                    style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                                >
                                    {plan.ctaLabel !== "" ? plan.ctaLabel : "Choose plan"}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: steps.numbered — horizontal numbered cards
export function StepsNumbered({ data, ctx }: SectionProps<StepsData>) {
    if (data.steps.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-bg)]">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.steps.length === 0 && <MissingHint preview={ctx.preview}>Add your steps</MissingHint>}

                <ol className="grid gap-[var(--t-space)] md:grid-cols-3">
                    {data.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="grid content-start gap-2 rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)]" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                            <span
                                className="grid size-9 place-items-center rounded-full text-[length:var(--t-text-m)] font-bold"
                                style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                            >
                                {stepIndex + 1}
                            </span>
                            <h3 className="font-semibold text-[var(--t-text)]">{step.title}</h3>
                            {step.body !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{step.body}</p>}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

//variant: steps.timeline — vertical line with dots
export function StepsTimeline({ data, ctx }: SectionProps<StepsData>) {
    if (data.steps.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-surface)]">
            <div className="mx-auto grid max-w-3xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.steps.length === 0 && <MissingHint preview={ctx.preview}>Add your steps</MissingHint>}

                <ol className="grid gap-0">
                    {data.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="relative grid grid-cols-[auto_1fr] gap-x-4 pb-[calc(var(--t-space)*1.5)] last:pb-0">
                            <div className="grid justify-items-center">
                                <span className="z-10 grid size-8 place-items-center rounded-full text-[length:var(--t-text-s)] font-bold" style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}>
                                    {stepIndex + 1}
                                </span>
                                {stepIndex < data.steps.length - 1 && <span aria-hidden className="w-px grow" style={{ backgroundColor: "var(--t-border)" }} />}
                            </div>
                            <div className="grid content-start gap-1 pb-1">
                                <h3 className="font-semibold text-[var(--t-text)]">{step.title}</h3>
                                {step.body !== "" && <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{step.body}</p>}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
