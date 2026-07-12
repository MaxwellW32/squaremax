import React from "react"
import { SectionProps } from "@/lib/sites/sectionProps"

//variant: footer.simple — single line
export function FooterSimple({ content }: SectionProps) {
    return (
        <footer className="border-t bg-[var(--t-bg)] !p-0" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                <p>© {new Date().getFullYear()} {content.business.name}</p>
                <p>
                    Powered by <a className="font-semibold hover:text-[var(--t-primary)]" href="https://squaremaxtech.com" target="_blank" rel="noreferrer">Squaremax</a>
                </p>
            </div>
        </footer>
    )
}

//variant: footer.columns — brand + contact + hours summary
export function FooterColumns({ content }: SectionProps) {
    const business = content.business

    return (
        <footer className="border-t bg-[var(--t-surface)] !p-0" style={{ borderColor: "var(--t-border)" }}>
            <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-[length:var(--t-text-s)] md:grid-cols-3">
                <div className="grid content-start gap-2">
                    <p
                        className="text-[length:var(--t-text-m)] text-[var(--t-text)]"
                        style={{ fontFamily: "var(--t-font-heading)", fontWeight: "var(--t-heading-weight)" as never }}
                    >
                        {business.name}
                    </p>
                    {business.tagline !== "" && <p className="text-[var(--t-text-muted)]">{business.tagline}</p>}
                </div>

                <div className="grid content-start gap-1.5 text-[var(--t-text-muted)]">
                    {business.phone !== "" && <p>{business.phone}</p>}
                    {business.email !== "" && <p>{business.email}</p>}
                    {business.address !== "" && <p>{business.address}</p>}
                </div>

                <div className="grid content-start gap-1.5 text-[var(--t-text-muted)]">
                    {content.hours.entries.slice(0, 4).map(entry => (
                        <p key={entry.label}>{entry.label}: {entry.hours}</p>
                    ))}
                </div>
            </div>

            <div className="border-t" style={{ borderColor: "var(--t-border)" }}>
                <p className="mx-auto max-w-5xl px-4 py-4 text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                    © {new Date().getFullYear()} {business.name} · Powered by{" "}
                    <a className="font-semibold hover:text-[var(--t-primary)]" href="https://squaremaxtech.com" target="_blank" rel="noreferrer">Squaremax</a>
                </p>
            </div>
        </footer>
    )
}
