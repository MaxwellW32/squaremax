import React from 'react'
import { projectsData } from '@/lib/projectsData'
import DisplayProjects from '@/components/projects/DisplayProjects'

export default function Page() {
    return (
        <main>
            <section style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
                <p className='supportingTitle2'>Projects</p>
                <h1>Our Projects</h1>
            </section>

            <section>
                <DisplayProjects seenProjectData={projectsData} />
            </section>
        </main>
    )
}
