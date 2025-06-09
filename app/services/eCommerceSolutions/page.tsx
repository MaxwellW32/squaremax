import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {
    const currentService = servicesData.find(eachService => eachService.name === "E-commerce Solutions")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p>Our E-commerce Solutions service is designed to help businesses establish and grow their online presence. We specialize in building robust e-commerce platforms that enable businesses to sell products or services online with ease.</p>

                        <p>We focus on integrating secure payment gateways, efficient order management systems, and personalized shopping experiences to ensure a seamless and secure online shopping environment for your customers.</p>
                    </>
                } />

            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}


