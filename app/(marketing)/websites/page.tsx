"use client"
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { website } from '@/types'
import { getWebsitesFromUser } from '@/serverFunctions/handleWebsites'

const PAGE_SIZE = 24

export default function Page() {
    const [query, querySet] = useState("")
    const [page, pageSet] = useState(0)
    const [results, resultsSet] = useState<website[]>([])
    const [loading, loadingSet] = useState(true)
    const [searched, searchedSet] = useState(false)

    const requestId = useRef(0)
    const debounce = useRef<NodeJS.Timeout | undefined>(undefined)

    //debounced, sequenced search — stale responses never overwrite fresh ones
    useEffect(() => {
        clearTimeout(debounce.current)
        debounce.current = setTimeout(async () => {
            const thisRequest = ++requestId.current
            loadingSet(true)
            try {
                const found = await getWebsitesFromUser(
                    query.trim() === "" ? {} : { name: query.trim() },
                    PAGE_SIZE,
                    page * PAGE_SIZE,
                )
                if (thisRequest === requestId.current) {
                    resultsSet(found)
                    searchedSet(true)
                }
            } catch (error) {
                if (thisRequest === requestId.current) {
                    toast.error(error instanceof Error ? error.message : "search failed")
                    resultsSet([])
                }
            } finally {
                if (thisRequest === requestId.current) loadingSet(false)
            }
        }, query.trim() === "" ? 0 : 350)

        return () => clearTimeout(debounce.current)
    }, [query, page])

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="grid gap-1">
                        <h1 className="font-display text-3xl font-bold normal-case">My websites</h1>
                        <p className="text-sm text-mist">Builder projects — custom builds live here.</p>
                    </div>

                    <Link
                        href="/websites/new"
                        className="rounded-lg bg-brand px-5 py-2.5 font-display font-bold text-white transition-colors hover:bg-brand-deep"
                    >
                        + New website
                    </Link>
                </div>

                {/* search bar */}
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-1.5 focus-within:border-cobalt">
                    <svg aria-hidden className="size-4 shrink-0 fill-mist" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
                    <input
                        value={query}
                        onChange={e => { querySet(e.target.value); pageSet(0) }}
                        placeholder="Search by name…"
                        aria-label="Search websites by name"
                        className="w-full !border-0 !bg-transparent !p-2.5 text-ink outline-none placeholder:text-mist"
                    />
                    {query !== "" && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => { querySet(""); pageSet(0) }}
                            className="rounded-md px-2 py-1 text-sm font-semibold text-mist hover:text-brand"
                        >
                            clear
                        </button>
                    )}
                </div>

                {/* results */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-surface" />
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
                        <p className="font-display text-xl font-bold normal-case">
                            {searched && query.trim() !== "" ? `Nothing matching “${query.trim()}”` : "No websites yet"}
                        </p>
                        <p className="max-w-sm text-sm text-mist">
                            {searched && query.trim() !== ""
                                ? "Try a shorter name, or clear the search."
                                : "Create your first builder project and it will show up here."}
                        </p>
                        {query.trim() === "" && (
                            <Link href="/websites/new" className="rounded-lg border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white">
                                Create one
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map(eachWebsite => (
                            <div key={eachWebsite.id} className="cornerTicks group grid content-between gap-4 rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md">
                                <div className="grid gap-1">
                                    <h2 className="font-display text-lg font-bold normal-case leading-snug">{eachWebsite.name}</h2>
                                    {eachWebsite.title !== "" && (
                                        <p className="line-clamp-2 text-sm text-mist">{eachWebsite.title}</p>
                                    )}
                                    <p className="font-mono text-xs text-mist/70">
                                        added {new Date(eachWebsite.dateAdded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/websites/edit/${eachWebsite.id}`}
                                        className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cobalt"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={`/websites/view/${eachWebsite.id}`}
                                        className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                                    >
                                        Preview
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* pagination — only when it can matter */}
                {(page > 0 || results.length === PAGE_SIZE) && (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            disabled={page === 0 || loading}
                            onClick={() => pageSet(prev => Math.max(0, prev - 1))}
                            className="rounded-md border border-line px-4 py-2 text-sm font-semibold disabled:opacity-40"
                        >
                            ← Prev
                        </button>
                        <span className="text-sm text-mist">page {page + 1}</span>
                        <button
                            type="button"
                            disabled={results.length < PAGE_SIZE || loading}
                            onClick={() => pageSet(prev => prev + 1)}
                            className="rounded-md border border-line px-4 py-2 text-sm font-semibold disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
