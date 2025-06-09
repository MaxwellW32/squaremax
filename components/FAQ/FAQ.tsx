"use client"
import React, { useState } from 'react'
import styles from "./styles.module.css"


export default function Faq({ question, answer }: { question: string, answer: string }) {
    const [showing, showingSet] = useState(false)

    return (
        <div style={{ color: "#000" }}>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer", padding: "1rem", borderBottom: '1px solid var(--lightFadedColor)' }} onClick={() => showingSet(prev => !prev)}>
                <div style={{ rotate: showing ? "90deg" : "", transition: "rotate 400ms" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                </div>

                <p>{question}</p>

                {/* <div style={{ position: "absolute", bottom: 0, left: "50%", translate: "-50%", width: "90%", borderBottom: '1px solid var(--lightFadedColor)', }}></div> */}
            </div>

            <div style={{ padding: '1rem', display: !showing ? "none" : "", overflow: "hidden" }}>
                <p className={`${showing ? styles.animateIn : ""}`}>{answer}</p>
            </div>
        </div>
    )
}
