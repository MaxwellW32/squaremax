import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {
    const currentService = servicesData.find(eachService => eachService.name === "Managed Hosting")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p> Our Managed Hosting service provides a hassle-free solution for your hosting needs. We handle everything from domain management and business email setup to secure hosting environments and reliable contact form integrations.</p>

                        <p>With 24/7 monitoring and support, we ensure your website is always up and running smoothly, giving you peace of mind and allowing you to focus on your business.</p>
                    </>
                } />

            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}
