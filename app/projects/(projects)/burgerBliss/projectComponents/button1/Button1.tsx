import Link from 'next/link'
import React, { HTMLAttributes } from 'react'
import styles from "./styles.module.css"

export default function Button1({ text, link, ...elProps }: { text: string, link: string } & HTMLAttributes<HTMLAnchorElement>) {
    return (
        <Link {...elProps} className={`${styles.button} ${elProps?.className}`} href={link} style={{ ...elProps?.style }}>
            <button>{text}</button>
        </Link>
    )
}
