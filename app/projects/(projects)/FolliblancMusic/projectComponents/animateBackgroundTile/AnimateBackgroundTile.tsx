import React from 'react'
import styles from "./styles.module.css"

export default function AnimateBackgroundTile({ numOfTiles = 5, initialColor, endColor, eachDelay = 100, initialDelay = 0, transitionTime = 1000 }: { numOfTiles?: number, initialColor: string, endColor: string, eachDelay?: number, initialDelay?: number, transitionTime?: number }) {
    return (
        <div className={styles.background} style={{ "--numOfTiles": numOfTiles, "--initialColor": initialColor, "--endColor": endColor, "--changeBGDelay": `${initialDelay + transitionTime + (eachDelay * numOfTiles)}ms` } as React.CSSProperties}>
            {new Array(numOfTiles).fill("").map((each, eachIndex) => {
                return (
                    <div key={eachIndex} className={styles.transitionTile} style={{ animation: `scale ${transitionTime}ms ${(eachDelay * eachIndex) + initialDelay}ms both` }}></div>
                )
            })}
        </div>
    )
}
