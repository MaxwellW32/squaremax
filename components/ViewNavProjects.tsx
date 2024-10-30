"use client"
import { project } from '@/types'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function ViewNavProjects({ seenUserProjects }: { seenUserProjects: project[] }) {
    const pathname = usePathname()
    const [showing, showingSet] = useState(false)

    return (
        <div style={{ position: "relative", display: "grid" }}>
            <button
                onClick={() => { showingSet(prev => !prev) }}
            >{showing ? "hide" : "show"}</button>

            <div style={{ display: showing ? "grid" : "none", position: "absolute", right: 0, maxHeight: "60vh", overflowY: "auto", top: "100%", backgroundColor: "#fff", paddingBlock: "1rem", }}
                onClick={() => {
                    showingSet(false)
                }}
            >
                <Link href={`/projects/new`} style={{ justifySelf: "center" }}>
                    <button>Add Project</button>
                </Link>

                {seenUserProjects.map(eachProject => {
                    const foundInUrl = pathname.includes(eachProject.id)

                    return (
                        <Link key={eachProject.id} href={`/projects/${eachProject.id}`} style={{ border: foundInUrl ? "1px solid #000" : "", padding: "1rem" }}>{eachProject.name}</Link>
                    )
                })}
            </div>
        </div>
    )
}
