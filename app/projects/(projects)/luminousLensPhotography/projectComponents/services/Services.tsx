import React from 'react'
import styles from "./services.module.css"
import Image from 'next/image'
import AnimateElements from '../animateElements/AnimateElements';

export default function Services({ services }: { services: { name: string; image: string; }[] }) {
    return (
        <AnimateElements animationOption="slideLeft" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%), 1fr))", columnGap: "4rem", rowGap: "4rem", maxWidth: "1000px", margin: "3rem auto 0rem auto", paddingInline: "2rem" }}>
            {services.map((eachService, eachserviceIndex) => {
                return (
                    <div key={eachserviceIndex} className={styles.serviceCont} style={{ position: "relative", cursor: "pointer" }}>
                        <p style={{ position: "absolute", top: 0, left: "100%", rotate: "90deg", whiteSpace: "nowrap", transformOrigin: "top left", translate: "20%" }}>{eachService.name}</p>

                        <Image alt={`${eachService.name}'s image`} src={eachService.image} width={600} height={600} style={{ objectFit: "cover", width: "100%", height: "400px", overflow: "hidden" }} />
                    </div>
                )
            })}
        </AnimateElements>
    )
}
