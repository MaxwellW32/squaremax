import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import NavImage from "@/public/logo.svg"

export default function Logo() {
    return (
        <Link href={"/"} style={{ cursor: "pointer" }}>
            <Image alt='logo' src={NavImage} width={50} height={50} style={{ objectFit: "contain" }} />
        </Link>)
}
