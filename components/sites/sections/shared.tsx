import React from "react"

//shared bits for section variants — tokens only, no hex, no font-family
//literals beyond the --t-* vars.

export function SectionHeading({ heading, blurb, center }: { heading: string; blurb?: string; center?: boolean }) {
    if (heading === "" && (blurb === undefined || blurb === "")) return null
    return (
        <div className={`grid gap-2 ${center === true ? "justify-items-center text-center" : ""}`}>
            {heading !== "" && (
                <h2
                    className="text-[length:var(--t-text-xl)] text-[var(--t-text)]"
                    style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                >
                    {heading}
                </h2>
            )}
            {blurb !== undefined && blurb !== "" && <p className="max-w-xl text-[var(--t-text-muted)]">{blurb}</p>}
        </div>
    )
}

//image with a graceful themed fallback: public visitors see a quiet
//placeholder block; in the editor/onboarding preview it also says what to add
export function ImgOrPlaceholder({ src, alt, className, aspectClassName, label, preview }: {
    src: string
    alt: string
    className?: string
    aspectClassName?: string //e.g. "aspect-[4/3]"
    label: string //"photo", "logo", "before photo"…
    preview?: boolean
}) {
    if (src !== "") {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} loading="lazy" className={`${aspectClassName ?? ""} w-full object-cover ${className ?? ""}`} />
    }
    return (
        <div
            aria-hidden
            className={`grid ${aspectClassName ?? "aspect-[4/3]"} w-full place-items-center rounded-[var(--t-radius)] ${className ?? ""}`}
            style={{
                backgroundColor: "var(--t-surface)",
                border: "1px dashed var(--t-border)",
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, var(--t-border) 10px, var(--t-border) 11px)",
            }}
        >
            <span
                className="rounded-[var(--t-radius)] px-2.5 py-1 text-[length:var(--t-text-s)] font-semibold"
                style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text-muted)" }}
            >
                {preview === true ? `Add a ${label} in the editor` : alt !== "" ? alt : " "}
            </span>
        </div>
    )
}

//preview-only nudge for missing text/settings — invisible to real visitors
export function MissingHint({ preview, children }: { preview?: boolean; children: React.ReactNode }) {
    if (preview !== true) return null
    return (
        <p
            className="w-fit rounded-[var(--t-radius)] px-3 py-1.5 text-[length:var(--t-text-s)] font-semibold"
            style={{ backgroundColor: "var(--t-surface)", border: "1px dashed var(--t-border)", color: "var(--t-text-muted)" }}
        >
            ✏️ {children}
        </p>
    )
}
