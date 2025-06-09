import React from 'react'
import Logo from '../logo/Logo'
import Link from 'next/link'
import styles from "./footer.module.css"
import Image from 'next/image'

export default function Footer() {
    return (
        <footer style={{ backgroundColor: "#000", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(250px,100%), 1fr))", alignItems: "center", padding: "3rem 1rem", justifyItems: "center" }}>
            <div style={{ display: "flex", gap: ".2rem" }}>
                <Link className={styles.social} href={``}>
                    <Image alt='instgram' width={16} height={16} src={"/projects/luminousLens/instagram.svg"} style={{ objectFit: "contain", width: "1rem", aspectRatio: "1/1", fill: "#fff" }} />
                </Link>

                <Link className={styles.social} href={``}>
                    <Image alt='instgram' width={16} height={16} src={"/projects/luminousLens/facebook.svg"} style={{ objectFit: "contain", width: "1rem", aspectRatio: "1/1", fill: "#fff" }} />                </Link>

                <Link className={styles.social} href={``}>
                    <Image alt='instgram' width={16} height={16} src={"/projects/luminousLens/twitter.svg"} style={{ objectFit: "contain", width: "1rem", aspectRatio: "1/1", fill: "#fff" }} />                </Link>
            </div>

            <Logo />

            <p>@2024 Luminous Lens. All rights reserved</p>
        </footer>
    )
}
