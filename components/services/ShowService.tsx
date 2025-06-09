"use client"
import { service } from '@/lib/servicesData'
import React, { useState } from 'react'
import styles from "./showService.module.css"
import Image from 'next/image'
import ThirdButton from '../thirdButton/ThirdButton'

export default function ShowService({ service, startHovering }: { service: service, startHovering?: boolean }) {
    const [hovering, hoveringSet] = useState(startHovering ?? false)

    return (
        <div className={`${styles.service} ${hovering && styles.hovering}`} onMouseEnter={() => { hoveringSet(true) }} onMouseLeave={() => { hoveringSet(false) }}>
            <div className={styles.backdropCont}>
                <Image className={styles.backdropImage} alt={`${service.name}'s image`} src={service.image} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "cover", width: "100%", height: "100%", }} />

                <div className={styles.backdrop} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.8)", }}></div>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
                {service.icon}

                <h3>{service.name}</h3>

                <p style={{ flex: 1 }}>{service.shortSummary}</p>

                <ThirdButton link={service.link} text='See More' isHovering={hovering} />
            </div>
        </div>
    )
}
