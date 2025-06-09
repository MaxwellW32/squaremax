import { servicesData } from '@/lib/servicesData'
import React from 'react'
import serviceStyles from "../servicesStyles.module.css"
import ShowServiceIntro from '@/components/services/ShowServiceIntro'
import DisplayOtherServiceInfo from '@/components/services/DisplayOtherServiceInfo'

export default function Page() {
    const currentService = servicesData.find(eachService => eachService.name === "SEO and Marketing")
    if (currentService === undefined) return (<p>Service Not Found</p>)

    return (
        <main className={serviceStyles.mainDiv} style={{ display: "grid", padding: "1rem" }}>
            <ShowServiceIntro
                service={currentService}
                text={
                    <>
                        <p>Our SEO and Marketing services boost your business&apos;s online visibility and drive targeted traffic. Our specialists use comprehensive strategies to optimize your site, ensuring it ranks higher on search engines. We handle everything from keyword research and content optimization to link building and performance tracking, helping your business grow organically.</p>

                        <p>We create compelling Ad campaigns tailored to your business needs, ensuring your ads capture attention and perform well on platforms like Google Ads and Facebook Ads.</p>

                        <p>Our expertise attracts more visitors and converts them into loyal customers. We provide detailed analytics and insights, tracking your website&apos;s performance and progress. Our data-driven strategies and expert guidance lead to measurable improvements, helping you achieve your marketing goals with confidence.</p>

                        <p>Let us bridge the gap between your business and your audience with innovative ad campaigns and meticulous performance tracking. Partner with us to see your business thrive in the digital landscape.</p>
                    </>
                } />


            <DisplayOtherServiceInfo service={currentService} />
        </main>
    )
}
