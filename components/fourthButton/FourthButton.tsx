import Link from 'next/link'
import React from 'react'
import styles from "./fourthButton.module.css"

export default function FourthButton({ text, link, hovering }: { text: string, link: string, hovering?: boolean }) {
    return (
        <Link style={{ display: "grid", }} href={link}>
            <button className={`${styles.button} ${hovering && styles.buttonHovering}`} >
                {text}

                <span style={{ fontSize: "var(--iconSizeS)" }} className="material-symbols-outlined">
                    arrow_forward
                </span>
            </button>
        </Link>
    )
}
