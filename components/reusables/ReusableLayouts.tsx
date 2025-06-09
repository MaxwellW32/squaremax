import Image from 'next/image'
import React from 'react'

export default function ReusableLayouts() {
    return (
        <>
            <h1>Image Starter</h1>
            <Image alt={`${1}'s image`} src={""} height={400} width={400} style={{ objectFit: "cover" }} />




            <h1>2 Column Layout</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ flex: "1 1 400px" }}>
                </div>

                <div style={{ flex: "1 1 400px", display: "grid", alignContent: "flex-start", gap: "1rem" }}>
                </div>
            </div>



            <h1>3 part Image layout</h1>
            <div style={{ display: "flex", gap: "1rem" }}>
                <div className='resizeSvg' style={{ width: "4rem", fill: "var(--color1)" }}>
                    {/* svg */}
                </div>

                <div style={{ flex: "1 1 300px", display: "grid", gap: "1rem" }}>
                    <h3></h3>

                    <p></p>
                </div>
            </div>




            <h1>Grid Column Scroll</h1>
            <div className='snap' style={{ overflowX: "auto", display: "grid", gap: "1rem", gridAutoFlow: "column", gridAutoColumns: "min(400px, 100%)" }}>
                {[
                    {
                        image: "",
                    },
                ].map((each, eachIndex) => {
                    return (
                        <div key={eachIndex} style={{ display: "grid", gap: "1rem", alignContent: "flex-start" }}>
                        </div>
                    )
                })}
            </div>



            <h1>Grid minmax resize</h1>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
                {[
                    {
                        image: "",
                    },
                ].map((each, eachIndex) => {
                    return (
                        <div key={eachIndex} style={{ display: "grid", gap: "1rem", alignContent: "flex-start" }}>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
