"use client"
import Image from 'next/image'
import React from 'react'

export default function Test() {
    return (
        <div>
            <Image alt='d' src={"/api/userImages/view?imageName=1.jpg"} width={300} height={300} style={{ objectFit: "contain" }} />
        </div>
    )
}
