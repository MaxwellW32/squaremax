import React from "react"
import Link from "next/link"

export default function SiteFooter() {
    return (
        <footer id="footerNav" className="border-t border-line bg-ink text-white">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr]">
                <div className="grid content-start gap-3">
                    <p className="font-display text-xl font-bold">squaremax</p>
                    <p className="max-w-sm text-sm text-white/70">
                        Custom websites at flat prices. Hosted business pages from $10/month.
                        Built in Jamaica, shipped worldwide.
                    </p>
                </div>

                <nav aria-label="Products" className="grid content-start gap-2 text-sm">
                    <p className="font-semibold uppercase tracking-wide text-white/50">Products</p>
                    <Link className="text-white/80 hover:text-white" href="/custom-builds">Custom Builds</Link>
                    <Link className="text-white/80 hover:text-white" href="/sites">Squaremax Sites</Link>
                    <Link className="text-white/80 hover:text-white" href="/projects">Work</Link>
                </nav>

                <nav aria-label="Company" className="grid content-start gap-2 text-sm">
                    <p className="font-semibold uppercase tracking-wide text-white/50">Company</p>
                    <Link className="text-white/80 hover:text-white" href="/contact">Contact</Link>
                    <Link className="text-white/80 hover:text-white" href="/privacyPolicy">Privacy</Link>
                    <a className="text-white/80 hover:text-white" href="mailto:info@squaremaxtech.com">info@squaremaxtech.com</a>
                </nav>
            </div>

            <div className="border-t border-white/10">
                <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/50">
                    © {new Date().getFullYear()} Squaremax. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
