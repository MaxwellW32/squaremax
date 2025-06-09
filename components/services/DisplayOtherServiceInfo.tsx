import { projectsData } from '@/lib/projectsData'
import { service, servicesData } from '@/lib/servicesData'
import { tesimonials } from '@/lib/testimonials'
import Link from 'next/link'
import React from 'react'
import ShowService from './ShowService'
import DisplayProjects from '../projects/DisplayProjects'
import ShowServiceProcess from './ShowServiceProcess'

export default function DisplayOtherServiceInfo({ service }: { service: service }) {
    return (
        <>
            <h2>Key Features</h2>

            <ul style={{ padding: '1rem', display: "grid", gap: ".5rem" }}>
                {service.keyFeatures.map((eachFeature, eachFeatureIndex) => {
                    return (
                        <li key={eachFeatureIndex} style={{ display: "flex", gap: ".5rem" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 122.88 109.76">
                                <path d="m0 52.88 22.68-.3c8.76 5.05 16.6 11.59 23.35 19.86C63.49 43.49 83.55 19.77 105.6 0h17.28C92.05 34.25 66.89 70.92 46.77 109.76 36.01 86.69 20.96 67.27 0 52.88z" style={{ fillRule: "evenodd", clipRule: "evenodd", fill: "var(--color1)", }} />
                            </svg>

                            {eachFeature}
                        </li>
                    )
                })}
            </ul>

            <h2>Technlogy used</h2>

            <ul style={{ display: "flex", gap: "var(--spacingR)", overflowX: "auto", padding: "1rem" }}>
                {service.technologyUsed.map((eachItem, eachItemIndex) => {
                    return (
                        <li key={eachItemIndex} style={{ padding: '.5rem 1rem', borderRadius: "2rem", backgroundColor: "var(--color1)", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap" }}>{eachItem}</li>
                    )
                })}
            </ul>

            <h2 style={{ textAlign: "center", background: "linear-gradient(to left, var(--color1), var(--color3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 'var(--fontSizeEL)' }}>Our Process</h2>

            <ShowServiceProcess service={service} />

            {tesimonials.filter(eachTestimonial => eachTestimonial.forService.includes(service.name)).length > 0 && (
                <>
                    <h2>Testimonials</h2>
                    {tesimonials.filter(eachTestimonial => eachTestimonial.forService.includes(service.name)).map((eachTestimonial, eachTestimonialIndex) => {
                        return (
                            <div key={eachTestimonialIndex}>{eachTestimonial.name}</div>
                        )
                    })}
                </>
            )}

            <Link href={"/contact"} style={{ justifySelf: "center", marginTop: "1rem" }}>
                <button className='button1'>Get Started</button>
            </Link>

            {projectsData.filter(eachProject => eachProject.representingService.includes(service.name)).length > 0 && (
                <>
                    <h2 style={{ marginBottom: ".5rem" }}>{service.name} projects</h2>

                    <DisplayProjects seenProjectData={projectsData.filter(eachProject => eachProject.representingService.includes(service.name))} />
                </>
            )}

            <h2>Related services</h2>

            <div className='snap' style={{ marginTop: "1rem", display: "grid", gridAutoFlow: "column", gridAutoColumns: "min(300px, 100%)", overflowX: "auto" }}>
                {servicesData.filter(eachService => eachService.name !== service.name).map((eachService, eachServiceIndex) => {
                    return (
                        <ShowService key={eachServiceIndex} service={eachService} />
                    )
                })}
            </div>
        </>
    )
}
