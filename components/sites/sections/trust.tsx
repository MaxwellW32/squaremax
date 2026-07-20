import React from "react"
import { TeamData, LogoStripData, BeforeAfterData, VideoData } from "@/lib/sites/content"
import { SectionProps } from "@/lib/sites/sectionProps"
import { SectionHeading, ImgOrPlaceholder, MissingHint } from "./shared"

//============================================================
// trust & proof sections
//============================================================

//variant: team.cards — photo cards in a grid
export function TeamCards({ data, ctx }: SectionProps<TeamData>) {
    if (data.members.length === 0 && ctx.preview !== true) return null

    return (
        <section id="team" className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} blurb={data.blurb} />
                {data.members.length === 0 && <MissingHint preview={ctx.preview}>Add your team members</MissingHint>}

                <ul className="grid gap-[var(--t-space)] sm:grid-cols-2 lg:grid-cols-3">
                    {data.members.map((member, memberIndex) => (
                        <li
                            key={memberIndex}
                            className="grid content-start gap-3 overflow-hidden rounded-[var(--t-radius)] p-[calc(var(--t-space)*1.25)] text-center"
                            style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}
                        >
                            {member.photoSrc !== "" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={member.photoSrc} alt={member.name} loading="lazy" className="mx-auto size-24 rounded-full object-cover" />
                            ) : (
                                <span
                                    aria-hidden
                                    className="mx-auto grid size-24 place-items-center rounded-full text-[length:var(--t-text-xl)]"
                                    style={{ backgroundColor: "var(--t-bg)", border: "1px dashed var(--t-border)", color: "var(--t-primary)", fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                                >
                                    {member.name.slice(0, 1).toUpperCase() || "?"}
                                </span>
                            )}
                            <div className="grid gap-0.5">
                                <h3 className="font-semibold text-[var(--t-text)]">
                                    {member.href !== "" ? (
                                        <a href={member.href} target="_blank" rel="noreferrer" className="hover:text-[var(--t-primary)]">{member.name}</a>
                                    ) : member.name}
                                </h3>
                                {member.role !== "" && <p className="text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-primary)]">{member.role}</p>}
                                {member.bio !== "" && <p className="pt-1 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{member.bio}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//variant: logoStrip.row — muted brand names/logos in a quiet band
export function LogoStripRow({ data, ctx }: SectionProps<LogoStripData>) {
    if (data.logos.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-surface)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*2)]">
                {data.heading !== "" && (
                    <p className="text-center text-[length:var(--t-text-s)] font-semibold uppercase tracking-widest text-[var(--t-text-muted)]">{data.heading}</p>
                )}
                {data.logos.length === 0 && <MissingHint preview={ctx.preview}>Add brands/partners (name or logo image)</MissingHint>}

                <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                    {data.logos.map((logo, logoIndex) => {
                        const inner = logo.src !== "" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo.src} alt={logo.name} loading="lazy" className="h-8 w-auto object-contain opacity-70 transition hover:opacity-100" />
                        ) : (
                            <span className="text-[length:var(--t-text-m)] font-semibold text-[var(--t-text-muted)]" style={{ fontFamily: "var(--t-font-heading)" }}>{logo.name}</span>
                        )
                        return (
                            <li key={logoIndex}>
                                {logo.href !== "" ? <a href={logo.href} target="_blank" rel="noreferrer">{inner}</a> : inner}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}

//variant: beforeAfter.pairs — side-by-side labelled photos
export function BeforeAfterPairs({ data, ctx }: SectionProps<BeforeAfterData>) {
    if (data.pairs.length === 0 && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-5xl gap-[calc(var(--t-space)*1.5)] px-4 py-[calc(var(--t-space)*3.5)]">
                <SectionHeading heading={data.heading} />
                {data.pairs.length === 0 && <MissingHint preview={ctx.preview}>Add before & after photo pairs</MissingHint>}

                <ul className="grid gap-[var(--t-space)] md:grid-cols-2">
                    {data.pairs.map((pair, pairIndex) => (
                        <li key={pairIndex} className="grid gap-2 rounded-[var(--t-radius)] p-[calc(var(--t-space)*0.75)]" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)" }}>
                            <div className="grid grid-cols-2 gap-1.5">
                                <figure className="grid gap-1">
                                    <ImgOrPlaceholder src={pair.beforeSrc} alt="Before" aspectClassName="aspect-square" className="rounded-[var(--t-radius)]" label="before photo" preview={ctx.preview} />
                                    <figcaption className="text-center text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-text-muted)]">Before</figcaption>
                                </figure>
                                <figure className="grid gap-1">
                                    <ImgOrPlaceholder src={pair.afterSrc} alt="After" aspectClassName="aspect-square" className="rounded-[var(--t-radius)]" label="after photo" preview={ctx.preview} />
                                    <figcaption className="text-center text-[length:var(--t-text-s)] font-semibold uppercase tracking-wide text-[var(--t-primary)]">After</figcaption>
                                </figure>
                            </div>
                            {pair.caption !== "" && <p className="text-center text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{pair.caption}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

//accepts YouTube (watch/shorts/youtu.be) and Vimeo URLs
function toEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, "")
        if (host === "youtube.com" || host === "m.youtube.com") {
            const id = parsed.searchParams.get("v") ?? (parsed.pathname.startsWith("/shorts/") ? parsed.pathname.split("/")[2] : null)
            return id !== null && id !== undefined ? `https://www.youtube-nocookie.com/embed/${id}` : null
        }
        if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`
        if (host === "vimeo.com") return `https://player.vimeo.com/video/${parsed.pathname.slice(1)}`
        if (host === "youtube-nocookie.com" || host === "player.vimeo.com") return url
        return null
    } catch {
        return null
    }
}

//variant: video.embed — privacy-friendly YouTube/Vimeo player
export function VideoEmbed({ data, ctx }: SectionProps<VideoData>) {
    const embedUrl = toEmbedUrl(data.url)
    if (embedUrl === null && ctx.preview !== true) return null

    return (
        <section className="bg-[var(--t-bg)] !p-0">
            <div className="mx-auto grid max-w-4xl gap-[var(--t-space)] px-4 py-[calc(var(--t-space)*3)]">
                <SectionHeading heading={data.heading} center />

                {embedUrl !== null ? (
                    <div className="overflow-hidden rounded-[var(--t-radius)]" style={{ border: "1px solid var(--t-border)" }}>
                        {ctx.preview === true ? (
                            <div aria-hidden className="grid aspect-video w-full place-items-center" style={{ backgroundColor: "var(--t-surface)" }}>
                                <span className="grid size-16 place-items-center rounded-full text-2xl" style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}>▶</span>
                            </div>
                        ) : (
                            <iframe
                                src={embedUrl}
                                title={data.heading !== "" ? data.heading : "Video"}
                                className="aspect-video w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        )}
                    </div>
                ) : (
                    <MissingHint preview={ctx.preview}>Paste a YouTube or Vimeo link</MissingHint>
                )}

                {data.caption !== "" && <p className="text-center text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">{data.caption}</p>}
            </div>
        </section>
    )
}
