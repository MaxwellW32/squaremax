"use client"
import { service } from '@/lib/servicesData'
import React from 'react'
import styles from "./showServiceProcess.module.css"
import { useInView } from "react-intersection-observer"

export default function ShowServiceProcess({ service }: { service: service }) {
    const { ref, inView } = useInView()

    return (
        <div style={{ display: "grid", alignContent: "flex-start", overflow: "clip", justifyItems: "center" }}>
            <ul ref={ref} style={{ display: "grid", alignContent: "flex-start", width: "min(60ch, 80%)", margin: "var(--spacingR) auto" }}>
                {service.process.map((eachStep, eachStepIndex) => {
                    return (
                        <li key={eachStepIndex} className={`${styles.process} ${eachStepIndex % 2 ? "slideFromRight" : "slideFromLeft"}`} style={{ filter: `hue-rotate(${eachStepIndex * 10}deg)`, animationDelay: `${eachStepIndex * 100}ms`, animationPlayState: inView ? "running" : "paused" }}>
                            {eachStep.icon}

                            <div style={{ flex: "1 1 30ch" }}>
                                <h3>{eachStep.stepName}</h3>

                                <p>{eachStep.step}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
