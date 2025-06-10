"use client"
import React, { useRef, useEffect, useState, HTMLAttributes } from 'react'

export default function ImageCarousel({ childEls, restTimer = 30000, loopTimer = 5000, ...elProps }: { childEls: JSX.Element[], restTimer?: number, loopTimer?: number } & HTMLAttributes<HTMLDivElement>) {
    const [currentIndex, currentIndexSet] = useState(0)
    const [userHandling, userHandlingSet] = useState(false)

    const loopTimerRef = useRef<NodeJS.Timeout>()

    const childElRefs = useRef<HTMLDivElement[]>([])
    const [maxHeight, maxHeightSet] = useState<number | undefined>(undefined)

    //handle auto next
    useEffect(() => {
        if (userHandling) {
            if (loopTimerRef.current) clearInterval(loopTimerRef.current)
            return
        }

        loopTimerRef.current = setInterval(() => {
            next()
        }, loopTimer)

        return () => {
            if (loopTimerRef.current) {
                clearInterval(loopTimerRef.current)
            }
        }
    }, [userHandling])

    //search for max height
    useEffect(() => {
        let seenMaxHeight = 0

        childElRefs.current.forEach(eachElement => {
            if (eachElement.offsetHeight > seenMaxHeight) {
                seenMaxHeight = eachElement.offsetHeight + 10
            }
        })

        maxHeightSet(seenMaxHeight)
    }, [])

    const next = () => {
        currentIndexSet(prev => {
            let newIndex = prev + 1
            if (newIndex > childEls.length - 1) {
                newIndex = 0
            }

            return newIndex
        })
    }

    const prev = () => {
        currentIndexSet(prev => {

            let newIndex = prev - 1
            if (newIndex < 0) {
                newIndex = childEls.length - 1
            }

            return newIndex
        })
    }

    const restartTimerRef = useRef<NodeJS.Timeout>()

    const handleClick = () => {
        userHandlingSet(true)

        if (restartTimerRef.current) clearTimeout(restartTimerRef.current)

        restartTimerRef.current = setTimeout(() => {
            userHandlingSet(false)
        }, restTimer);
    }

    function addToChildElRefs(e: HTMLDivElement | null) {
        if (e === null) return

        if (!childElRefs.current.includes(e)) {
            childElRefs.current.push(e)
        }
    }

    return (
        <div {...elProps} style={{ opacity: maxHeight === undefined ? 0 : 1, minHeight: `${maxHeight}px`, display: "grid", alignContent: "stretch", position: "relative", ...elProps?.style }}>
            {childEls.map((eachItem, eachItemIndex) => {
                return (
                    <div key={eachItemIndex} ref={addToChildElRefs} className={`${maxHeight !== undefined && eachItemIndex !== currentIndex ? "noDisplay" : ""}`} style={{ display: "grid", alignContent: "stretch", height: "100%" }}>
                        {eachItem}
                    </div>
                )
            })}

            <div style={{ position: "absolute", right: 0, bottom: "-1rem", padding: "1rem", display: "flex", gap: "var(--spacingR)" }}>
                <button className="button2" style={{ aspectRatio: "1/1" }} onClick={() => { prev(); handleClick() }}>
                    <svg style={{ width: "clamp(.5rem, 3vw, 1rem)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" /></svg>
                </button>

                <button className="button2" style={{ aspectRatio: "1/1" }} onClick={() => { next(); handleClick() }}>
                    <svg style={{ width: "clamp(.5rem, 3vw, 1rem)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                </button>
            </div>
        </div>
    )
}
