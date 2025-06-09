import Image from 'next/image'
import React from 'react'

export default function AboutUs() {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ flex: "1 1 400px", aspectRatio: "16/9", position: "relative" }} >
                <Image alt={`aboutus image`} src={"https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} fill={true} style={{ objectFit: "cover", }} sizes="100vw" />
            </div>

            <div style={{ flex: "1 1 400px", display: "grid", alignContent: "flex-start", gap: "1rem" }}>
                <p className='supportingTitle2'>About Us</p>

                <h1>Elevate your operations with our premium solutions</h1>

                <p>We are dedicated to providing exceptional user experiences, be it from e-commerce stores, mobile or web applications. Our team of experts is committed to delivering innovative solutions that drive your business forward.</p>

                <p>From concept to deployment, our team ensures a seamless process, emphasizing quality and security.</p>

                <p>Whether you require scalable applications, intuitive user interfaces, or robust backend systems, We provide end-to-end software solutions tailored to meet your unique needs. </p>

                <div className='snap' style={{ overflowX: "auto", display: "grid", gap: "1rem", gridAutoFlow: "column", gridTemplateRows: "1fr 1fr", gridAutoColumns: "min(50ch, 100%)", paddingBlock: "1rem" }}>
                    {[
                        {
                            title: "Professional IT Services",
                            summary: 'With a team of seasoned professionals, SquareMax is dedicated to delivering professional IT services that exceed expectations.',
                            icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">memory</span>
                        },
                        {
                            title: "Elevating User Experience",
                            summary: 'User experience is paramount to us. Our experts are committed to crafting immersive and intuitive digital experiences that captivate audiences and drive engagement.',
                            icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">settings_accessibility</span>
                        },
                        {
                            title: "Unrivaled Support",
                            summary: 'Customer satisfaction is our top priority.We offer swift and responsive support whenever and wherever you need it.',
                            icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">headset_mic</span>
                        },
                        {
                            title: "Innovation at the Forefront",
                            summary: "We constantly push the boundaries of technology and creativity to deliver cutting-edge solutions that are future-proof. We're committed to driving innovation in everything we do.",
                            icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">emoji_objects</span>
                        },
                        {
                            title: "Partnering for Success",
                            summary: "At SquareMax, we believe in the power of partnerships. We view our clients as collaborators, working hand in hand to achieve trust, and collaboration",
                            icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">cheer</span>
                        },
                    ].map((eachItem, eachItemIndex) => {
                        return (
                            <div key={eachItemIndex} style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ color: "var(--color1)" }}>
                                    {eachItem.icon}
                                </div>

                                <div style={{ flex: "1 1 300px", display: "grid", gap: ".5rem", alignContent: "flex-start" }}>
                                    <h3>{eachItem.title}</h3>

                                    <p>{eachItem.summary}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
