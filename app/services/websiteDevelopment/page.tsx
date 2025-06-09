import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {

    const currentService = servicesData.find(eachService => eachService.name === "Website Development")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p>Our Next.js web development service combines cutting-edge technology with strategic design to create web applications that exceed client expectations. We leverage the power of Next.js, to build robust, scalable, and SEO-friendly web apps that perform exceptionally well across devices.</p>

                        <p>From custom features to complex functionalities, we ensure every aspect of your web app aligns with your business objectives.</p>
                    </>
                } />

            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}
