import React from 'react'
// import styles from "./page.module.css"
import DisplayTestimonials from '@/components/displayTestimonials/DisplayTestimonials'

export default function Page() {
    return (
        <main>
            <section>
                <div style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
                    <p className='supportingTitle2'>Our Testimonials</p>
                    <h1>We Deliver Solutions, built on trust</h1>
                </div>

                <DisplayTestimonials />
            </section>
        </main>
    )
}
