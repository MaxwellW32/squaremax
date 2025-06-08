"use client"
import { website } from '@/types'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function ViewNavWebsites({ seenUserWebsites }: { seenUserWebsites: website[] }) {
    const pathname = usePathname()
    const [showing, showingSet] = useState(false)

    return (
        <div style={{ position: "relative", display: "grid" }}>
            <button className='mainButton'
                onClick={() => { showingSet(prev => !prev) }}
            >{showing ? "hide" : "websites"}</button>

            <div style={{ display: showing ? "grid" : "none", position: "absolute", right: 0, maxHeight: "60vh", overflowY: "auto", top: "100%", backgroundColor: "var(--shade2)", padding: "1rem", border: "1px solid var(--shade1)" }}
                onClick={() => {
                    showingSet(false)
                }}
            >
                <Link href={`/websites/new`} style={{ justifySelf: "center" }}>
                    <button className='mainButton'>Add Website</button>
                </Link>

                {seenUserWebsites.map(eachWebsite => {
                    const foundInUrl = pathname.includes(eachWebsite.id)

                    return (
                        <Link key={eachWebsite.id} href={`/websites/edit/${eachWebsite.id}`} style={{ border: "1px solid var(--shade1)", padding: "1rem", color: foundInUrl ? "var(--color1)" : "" }}>
                            <h3>{eachWebsite.name}</h3>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
