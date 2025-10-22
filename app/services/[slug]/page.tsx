import React from 'react'
import { servicesData } from '@/lib/servicesData'
import styles from "../page.module.css"
import Image from 'next/image'
import ShowServiceProcess from '@/components/services/ShowServiceProcess'
import { tesimonials } from '@/lib/testimonials'
import Link from 'next/link'
import { projectsData } from '@/lib/projectsData'
import DisplayProjects from '@/components/projects/DisplayProjects'
import ShowService from '@/components/services/ShowService'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const seenService = servicesData.find(eachService => eachService.slug === slug)
    if (seenService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={`${styles.main} ${styles.serviceCont}`}>
            <div style={{ display: "grid", alignContent: "flex-start" }}>
                <section style={{ backgroundColor: "var(--bg1)", color: "#fff" }}>
                    <h2 style={{ textAlign: "center", }}>{seenService.name}</h2>
                </section>

                <div style={{ display: 'flex', flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 350px", aspectRatio: "16/9", position: "relative" }} >
                        <Image alt={`${seenService.name} alt`} src={seenService.image} fill={true} style={{ objectFit: "cover", }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>

                    <div style={{ flex: "2 1 350px", padding: "var(--spacingR)", display: "grid", gap: "var(--spacingR)", alignContent: "flex-start" }}>
                        {seenService.additionalText}
                    </div>
                </div>
            </div>

            <h2>Key Features</h2>

            <ul style={{ padding: 'var(--spacingR)', display: "grid", gap: "var(--spacingS)" }}>
                {seenService.keyFeatures.map((eachFeature, eachFeatureIndex) => {
                    return (
                        <li key={eachFeatureIndex} style={{ display: "flex", gap: "var(--spacingS)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 122.88 109.76">
                                <path d="m0 52.88 22.68-.3c8.76 5.05 16.6 11.59 23.35 19.86C63.49 43.49 83.55 19.77 105.6 0h17.28C92.05 34.25 66.89 70.92 46.77 109.76 36.01 86.69 20.96 67.27 0 52.88z" style={{ fillRule: "evenodd", clipRule: "evenodd", fill: "var(--color1)", }} />
                            </svg>

                            {eachFeature}
                        </li>
                    )
                })}
            </ul>

            <h2>Technlogy used</h2>

            <ul style={{ display: "flex", gap: "var(--spacingR)", overflowX: "auto", padding: "var(--spacingR)" }}>
                {seenService.technologyUsed.map((eachItem, eachItemIndex) => {
                    return (
                        <li key={eachItemIndex} style={{ padding: 'var(--spacingS) var(--spacingR)', borderRadius: "2rem", backgroundColor: "var(--color1)", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap" }}>{eachItem}</li>
                    )
                })}
            </ul>

            <h2 style={{ textAlign: "center", background: "linear-gradient(to left, var(--color1), var(--color3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 'var(--fontSizeEL)' }}>Our Process</h2>

            <ShowServiceProcess service={seenService} />

            {tesimonials.filter(eachTestimonial => eachTestimonial.forService.includes(seenService.name)).length > 0 && (
                <>
                    <h2>Testimonials</h2>
                    {tesimonials.filter(eachTestimonial => eachTestimonial.forService.includes(seenService.name)).map((eachTestimonial, eachTestimonialIndex) => {
                        return (
                            <div key={eachTestimonialIndex}>{eachTestimonial.name}</div>
                        )
                    })}
                </>
            )}

            <Link href={"/contact"} style={{ justifySelf: "center", marginTop: "var(--spacingR)" }}>
                <button className='button1'>Get Started</button>
            </Link>

            {projectsData.filter(eachProject => eachProject.representingService.includes(seenService.name)).length > 0 && (
                <>
                    <h2 style={{ marginBottom: "var(--spacingS)" }}>{seenService.name} projects</h2>

                    <DisplayProjects seenProjectData={projectsData.filter(eachProject => eachProject.representingService.includes(seenService.name))} />
                </>
            )}

            <h2>Related services</h2>

            <div className='snap' style={{ marginTop: "var(--spacingR)", display: "grid", gridAutoFlow: "column", gridAutoColumns: "min(300px, 100%)", overflowX: "auto" }}>
                {servicesData.filter(eachService => eachService.name !== seenService.name).map((eachService, eachServiceIndex) => {
                    return (
                        <ShowService key={eachServiceIndex} service={eachService} />
                    )
                })}
            </div>
        </main>
    )
}