import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {
    const currentService = servicesData.find(eachService => eachService.name === "Mobile App Development")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p>Our Mobile App Development service with React Native offers cutting-edge solutions for businesses seeking to establish a strong presence on iOS and Android platforms. Leveraging the versatility of React Native, we craft seamless and intuitive mobile apps that provide exceptional user experiences across devices.</p>

                        <p>From concept to deployment, we tailor each app to meet your unique requirements, ensuring that every feature aligns with your business goals. Whether you need a native app or cross-platform solution, we deliver high-quality mobile experiences that captivate your audience and drive success.</p>
                    </>
                } />

            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}

