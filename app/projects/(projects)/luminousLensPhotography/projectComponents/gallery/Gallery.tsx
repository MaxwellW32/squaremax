"use client"
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import styles from "./gallery.module.css"
import AnimateElements from '../animateElements/AnimateElements'

export default function Gallery({ galleryItems }: { galleryItems: { name: string; image: string; }[] }) {
    const [activeImageIndex, activeImageIndexSet] = useState(0)
    const [viewingFullScreen, viewingFullScreenSet] = useState(false)
    const [showingSettings, showingSettingsSet] = useState(false)
    const debounce = useRef<NodeJS.Timeout>()

    //stop scrolling on select
    useEffect(() => {
        if (viewingFullScreen) {
            const body = document.querySelector("body") as HTMLBodyElement
            body.style.overflow = "hidden"
        } else {
            const body = document.querySelector("body") as HTMLBodyElement
            body.style.overflow = "auto"
        }
    }, [viewingFullScreen])

    function handleSeek(option: "next" | "prev") {
        if (option === "next") {
            activeImageIndexSet(prevIndex => {
                if (prevIndex === undefined) return prevIndex

                let newIndex = prevIndex + 1

                if (newIndex > galleryItems.length - 1) {
                    newIndex = 0
                }

                return newIndex
            })
        } else {
            activeImageIndexSet(prevIndex => {
                if (prevIndex === undefined) return prevIndex

                let newIndex = prevIndex - 1

                if (newIndex < 0) {
                    newIndex = galleryItems.length - 1
                }

                return newIndex
            })
        }
    }

    return (
        <div>
            <div style={{ display: viewingFullScreen ? "grid" : "none", position: "fixed", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 100, gridTemplateRows: "auto 1fr auto" }}
                onClick={() => { viewingFullScreenSet(false) }}
                onMouseMove={() => {
                    showingSettingsSet(true)

                    if (debounce.current) clearTimeout(debounce.current)

                    debounce.current = setTimeout(() => {
                        showingSettingsSet(false)
                    }, 1000);
                }}
            >
                <div style={{ opacity: showingSettings ? 1 : 0, display: "flex", alignItems: "center", padding: "1rem" }}>
                    <p style={{ fontWeight: "bold" }}>{activeImageIndex + 1} / {galleryItems.length}</p>

                    <span className='material-symbols-outlined' style={{ marginLeft: "auto" }} onClick={() => { viewingFullScreenSet(false) }}>
                        close
                    </span>
                </div>

                <div style={{ position: "relative", overflow: "hidden", width: "min(800px, 100%)", justifySelf: "center" }} onClick={(e) => { e.stopPropagation() }}>
                    {galleryItems.map((eachItem, eachItemIndex) => {
                        return (
                            <Image key={eachItemIndex} alt={`${eachItem.name}'s image`} src={eachItem.image} width={1000} height={1000} style={{ objectFit: "contain", height: "100%", width: "100%", display: activeImageIndex !== eachItemIndex ? "none" : "" }} />
                        )
                    })}

                    <span style={{ opacity: showingSettings ? 1 : 0 }} className={`material-symbols-outlined ${styles.seekButton} ${styles.prevButton}`} onClick={(e) => { e.stopPropagation(); handleSeek("prev"); if (debounce.current) clearTimeout(debounce.current) }}>
                        arrow_back
                    </span>

                    <span style={{ opacity: showingSettings ? 1 : 0 }} className={`material-symbols-outlined ${styles.seekButton} ${styles.nextButton}`} onClick={(e) => { e.stopPropagation(); handleSeek("next"); if (debounce.current) clearTimeout(debounce.current) }}>
                        arrow_forward
                    </span>
                </div>

                <p style={{ justifySelf: "center", textTransform: "capitalize", padding: "1rem" }}>{galleryItems[activeImageIndex].name}</p>
            </div>

            <AnimateElements animationOption={"slideUp"} style={{ display: "grid", alignContent: "flex-start", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gridAutoRows: "250px", gap: "1rem" }}>
                {galleryItems.map((eachItem, eachItemIndex) => {
                    return (
                        <div className={styles.itemCont} key={eachItemIndex} onClick={() => { activeImageIndexSet(eachItemIndex); viewingFullScreenSet(true) }}>
                            <Image alt={`${eachItem.name}'s image`} src={eachItem.image} width={400} height={400} style={{ objectFit: "cover", width: "100%", height: "100%" }} />

                            <div className={styles.backdrop} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "#000" }}></div>

                            <span style={{ position: "absolute", top: "50%", left: "50%", translate: "-50% -50%", cursor: "pointer" }} className={`material-symbols-outlined ${styles.fullscreenButton}`}>
                                fullscreen
                            </span>
                        </div>
                    )
                })}
            </AnimateElements>
        </div>
    )
}
