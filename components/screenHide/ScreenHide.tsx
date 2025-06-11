import React from 'react'
import styles from "./style.module.css"

export default function ScreenHide({ hidden, ...elProps }: { hidden: boolean } & React.HTMLAttributes<HTMLDivElement>) {

    return (
        <div {...elProps} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "var(--bg2)", zIndex: 99999, ...elProps.style }} className={`${hidden ? styles.fadeOut : ""} ${elProps.className ?? ""}`}></div>
    )
}
