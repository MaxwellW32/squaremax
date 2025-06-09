import Link from 'next/link'
import React from 'react'
import styles from "./styles.module.css"

export default function MainButton({ link, text }: { link: string, text: string }) {
    return (
        <Link href={link} style={{ marginTop: ".5rem" }}>
            <button className={styles.button} >
                <div className={styles.transitionSlide2}></div>

                <div className={styles.transitionSlide}></div>
                <p>{text}</p>
            </button>
        </Link>
    )
}
