import { projectData } from '@/lib/projectsData'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function DisplayProjects({ seenProjectData }: { seenProjectData: projectData[] }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%),1fr))", gap: "1rem" }}>
            {seenProjectData.map(eachProject => {
                return (
                    <Link key={eachProject.slug} href={`/projects/${eachProject.slug}`} style={{ backgroundColor: "var(--bg1)", display: "grid", gridTemplateRows: "1fr auto", aspectRatio: "1/2" }}>
                        <div style={{ overflow: "hidden" }}>
                            <Image alt={`${eachProject.name}'s image`} src={eachProject.image} width={500} height={500} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                        </div>

                        <div style={{ padding: "1rem", color: "#fff", display: "grid", gap: ".5rem", whiteSpace: "nowrap" }}>
                            <h3>{eachProject.name}</h3>

                            <div className='noScrollBar' style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
                                {eachProject.categoryStyles.map((eachCategoryStyle, eachCategoryStyleIndex) => {
                                    return (
                                        <div key={eachCategoryStyleIndex} style={{ borderRadius: "2rem", textTransform: "capitalize", fontSize: "var(--fontSizeS)", padding: ".5rem 1rem", backgroundColor: "var(--color3)" }}>
                                            {eachCategoryStyle}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className='noScrollBar' style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
                                {eachProject.representingService.map((eachService, eachServiceIndex) => {
                                    return (
                                        <div key={eachServiceIndex} style={{ borderRadius: "2rem", textTransform: "capitalize", fontSize: "var(--fontSizeS)", padding: ".5rem 1rem", backgroundColor: "var(--color1)" }}>
                                            {eachService}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
