import { testimonialData } from '@/lib/testimonialData'
import Image from 'next/image'
import React from 'react'
import DisplayStars from '../displayStars/DisplayStars'

export default function DisplayTestimonials() {
    return (
        <div className='snap' style={{ overflowX: "auto", display: "grid", gap: "1rem", gridAutoFlow: "column", gridAutoColumns: "min(330px, 100%)", textAlign: "center" }}>
            {testimonialData.map((eachTestimonial, eachTestimonialIndex) => {
                return (
                    <div key={eachTestimonialIndex} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", alignItems: "center" }}>
                        <Image alt={`${eachTestimonial.name}'s image`} src={eachTestimonial.image} height={100} width={100} style={{ objectFit: "cover", borderRadius: "50%", }} />

                        <p style={{ flex: 1 }}>{eachTestimonial.testimonial}</p>

                        <DisplayStars starRating={eachTestimonial.rating} />

                        <h2>{eachTestimonial.name}</h2>

                        <p>{eachTestimonial.title}</p>
                    </div>
                )
            })}
        </div>)
}
