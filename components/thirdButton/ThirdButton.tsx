import Link from 'next/link'
import React from 'react'

export default function ThirdButton({ link, text, isHovering }: { link: string, text: string, isHovering?: boolean }) {
    return (
        <Link href={link} style={{ display: "grid" }}>
            <button className={`thirdButton ${isHovering && "thirdButtonHovering"}`}>
                <p>{text}</p>

                <div style={{ height: '100%', display: "grid", alignItems: "center", justifyItems: "center", padding: "1rem 3rem 1rem 3rem", transform: "skew(-29deg)", translate: "1rem" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M334.5 414c8.8 3.8 19 2 26-4.6l144-136c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22l0 72L32 192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l288 0 0 72c0 9.6 5.7 18.2 14.5 22z" /></svg>
                </div>
            </button>
        </Link>)
}
