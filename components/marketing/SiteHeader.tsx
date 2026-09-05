"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Session } from "next-auth"

const navItems = [
    { title: "How it works", link: "/sites" },
    { title: "Pricing", link: "/pricing" },
    { title: "Custom Builds", link: "/custom-builds" },
    { title: "Contact", link: "/contact" },
]

export default function SiteHeader({ session }: { session: Session | null }) {
    const pathname = usePathname()
    const [open, openSet] = useState(false)

    return (
        <nav id="mainNav" className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink" onClick={() => openSet(false)}>
                    <span aria-hidden className="grid size-7 place-items-center rounded-sm bg-ink text-sm font-bold text-white">S</span>
                    squaremax
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map(eachItem => (
                        <Link
                            key={eachItem.link}
                            href={eachItem.link}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith(eachItem.link) ? "bg-ink text-white" : "text-ink hover:bg-line/60"
                                }`}
                        >
                            {eachItem.title}
                        </Link>
                    ))}

                    <Link
                        href={session !== null ? "/dashboard" : "/signin"}
                        className="ml-2 rounded-md border border-ink px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
                    >
                        {session !== null ? "Dashboard" : "Sign in"}
                    </Link>
                </div>

                <button
                    type="button"
                    aria-expanded={open}
                    aria-label="Toggle menu"
                    onClick={() => openSet(prev => !prev)}
                    className="grid size-10 place-items-center rounded-md border border-line md:hidden"
                >
                    <span aria-hidden className="grid gap-1">
                        <span className="h-0.5 w-5 bg-ink" />
                        <span className="h-0.5 w-5 bg-ink" />
                        <span className="h-0.5 w-5 bg-ink" />
                    </span>
                </button>
            </div>

            {open && (
                <div className="grid gap-1 border-t border-line px-4 py-3 md:hidden">
                    {navItems.map(eachItem => (
                        <Link
                            key={eachItem.link}
                            href={eachItem.link}
                            onClick={() => openSet(false)}
                            className="rounded-md px-3 py-2.5 font-medium text-ink hover:bg-line/60"
                        >
                            {eachItem.title}
                        </Link>
                    ))}
                    <Link
                        href={session !== null ? "/dashboard" : "/signin"}
                        onClick={() => openSet(false)}
                        className="rounded-md px-3 py-2.5 font-semibold text-ink hover:bg-line/60"
                    >
                        {session !== null ? "Dashboard" : "Sign in"}
                    </Link>
                </div>
            )}
        </nav>
    )
}
