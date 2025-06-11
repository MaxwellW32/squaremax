"use client"
import { useState } from "react"
import styles from "./styles.module.css"

export default function ShowMore({ label, content, svgColor, startShowing, labelJSX }: { label: string, content: JSX.Element, svgColor?: string, startShowing?: boolean, labelJSX?: JSX.Element }) {
    const [showing, showingSet] = useState(startShowing ?? false)

    return (
        <div style={{ display: "grid", alignContent: "flex-start" }} className={styles.mainDiv}>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer", padding: "1rem" }} onClick={() => showingSet(prev => !prev)}>
                <div style={{ display: "flex", gap: "var(--spacingS)" }}>
                    {label !== "" && (
                        <p>{label}</p>
                    )}

                    {labelJSX}
                </div>

                <span className="material-symbols-outlined" style={{ rotate: showing ? "" : "-90deg", transition: "rotate 400ms", color: svgColor ?? "" }}>
                    arrow_drop_down
                </span>
            </div>

            <div style={{ padding: '1rem', display: !showing ? "none" : "grid", alignContent: "flex-start", overflow: "clip" }}>
                <div className={`${showing ? styles.animateIn : ""}`} style={{ display: "grid", alignContent: "flex-start" }}>
                    {content}
                </div>
            </div>
        </div>
    )
}
