import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {
    const currentService = servicesData.find(eachService => eachService.name === "Custom Software Development")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p>Our Custom Software Development service empowers businesses by providing tailored solutions to automate processes, boost efficiency, and overcome specific challenges. From CRM systems to inventory management tools, we develop software that aligns perfectly with your unique requirements and business objectives.</p>

                        <p>Our expertise lies in understanding your needs and translating them into intuitive and scalable software solutions that drive growth and success.</p>
                    </>
                } />

            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}



