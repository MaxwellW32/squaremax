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
            <button className='mainButton'
                onClick={() => { showingSet(prev => !prev) }}
            >{showing ? "hide" : "projects"}</button>

            <div style={{ display: showing ? "grid" : "none", position: "absolute", right: 0, maxHeight: "60vh", overflowY: "auto", top: "100%", backgroundColor: "rgb(var(--shade2))", padding: "1rem", border: "1px solid rgb(var(--shade1))" }}
                onClick={() => {
                    showingSet(false)
                }}
            >
                <Link href={`/projects/new`} style={{ justifySelf: "center" }}>
                    <button className='mainButton'>Add Project</button>
                </Link>

                {seenUserProjects.map(eachProject => {
                    const foundInUrl = pathname.includes(eachProject.id)

                    return (
                        <Link key={eachProject.id} href={`/projects/${eachProject.id}`} style={{ border: "1px solid rgb(var(--shade1))", padding: "1rem", color: foundInUrl ? "rgb(var(--color1))" : "" }}>
                            <h3>{eachProject.name}</h3>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
