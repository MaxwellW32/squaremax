"use client"
import Image from 'next/image'
import React, { useState, useRef, useEffect } from 'react'
import styles from "./style.module.css"

type history = {
    img: string,
    intro: string,
    heading: string,
    text: string
}

const historyArr: history[] = [
    {
        img: "/projects/folliblancMusic/history1.jpg",
        intro: "2019",
        heading: "In It - Windterworld",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    {
        img: "/projects/folliblancMusic/history2.jpg",
        intro: "2020",
        heading: "Wishes",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    {
        img: "/projects/folliblancMusic/history3.jpg",
        intro: "2021",
        heading: "STAR LIFTING Lyric Video (Feat SPACEBAR) [AMV]",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    {
        img: "/projects/folliblancMusic/history4.jpg",
        intro: "2022",
        heading: "No Worries",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    {
        img: "/projects/folliblancMusic/history5.jpg",
        intro: "2023",
        heading: "Zoolander 23",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    {
        img: "/projects/folliblancMusic/history6.jpg",
        intro: "2023",
        heading: "New Heights",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    },
    // {
    //     img: defaultImageSrc,
    //     intro: "2018",
    //     heading: "Song cover for the beatles",
    //     text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    // },
    // {
    //     img: defaultImageSrc2,
    //     intro: "2019",
    //     heading: "Song cover for the beatles",
    //     text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ad nam, quo quod repudiandae distinctio maxime dolorem tempora incidunt magnam. Iste praesentium assumenda voluptatum veritatis doloribus consequatur, maxime asperiores vitae."
    // }
]

export default function History() {
    const [currentIndex, currentIndexSet] = useState(0)
    const historyContRef = useRef<HTMLDivElement | null>(null)
    const historyChildrenRefs = useRef<(HTMLDivElement | null)[]>([])

    function addToHistoryChildren(e: HTMLDivElement | null) {
        if (e === null) return

        if (!historyChildrenRefs.current.includes(e)) {
            historyChildrenRefs.current.push(e)
        }
    }

    function getNextInBounds(currentIndex: number) {
        const newIndex = (currentIndex + 1) % historyArr.length

        return newIndex
    }

    function getPrevInBounds(currentIndex: number) {
        const newIndex = (currentIndex - 1 + historyArr.length) % historyArr.length

        return newIndex
    }

    //ensure parent holds absolute elements
    useEffect(() => {
        window.addEventListener("resize", fitHeight)

        setTimeout(() => {
            fitHeight()
        }, 100);

        return () => {
            window.removeEventListener("resize", fitHeight)
        }
    }, [])


    function fitHeight() {
        if (historyContRef.current === null) return

        let biggestHeight = 0

        historyChildrenRefs.current.forEach(eachChild => {
            if (eachChild === null) return

            if (eachChild.offsetHeight > biggestHeight) {
                biggestHeight = eachChild.offsetHeight

            }
        })


        historyContRef.current.style.height = `${biggestHeight}px`
    }

    return (
        <div ref={historyContRef} style={{ position: 'relative', overflowX: "clip", display: "grid", zIndex: 0 }}>
            {historyArr.map((eachHistory, eachHistoryIndex) => {
                const seekNumber = 2
                let currentOffset = -1

                for (let index = 0; index < seekNumber; index++) {
                    if (eachHistoryIndex === getNextInBounds(currentIndex + index)) {
                        currentOffset = 110 * (index + 1)
                    }

                    if (eachHistoryIndex === getPrevInBounds(currentIndex - index)) {
                        currentOffset = -110 * (index + 1)
                    }
                }

                if (eachHistoryIndex === currentIndex) {
                    currentOffset = 0
                }

                return (
                    <div key={eachHistoryIndex} ref={addToHistoryChildren} style={{ position: "absolute", top: 0, left: "50%", transform: `translate(${currentOffset - 50}%, 0)`, width: "min(700px, 90vw)", display: currentOffset === -1 ? "none" : "grid", gap: "1rem", zIndex: currentOffset === -1 ? -1 : "", opacity: currentOffset === 0 ? "" : .3, transition: "transform 1s, opacity 1s", animation: `translate both linear`, animationTimeline: `view()`, "--translateFrom": "20% 0", "--translateTo": "-20% 0", fontSize: "var(--fontSizeS)" } as React.CSSProperties}>
                        <div style={{ position: "relative", width: "100%", height: "300px" }}>
                            <Image alt='historyImg' src={eachHistory.img} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                        </div>

                        <h3 style={{ color: eachHistoryIndex === currentIndex ? "var(--color1)" : "", transition: "color 1s" }}>{eachHistory.intro}</h3>

                        <h2>{eachHistory.heading}</h2>

                        {/* <p>{eachHistory.text}</p> */}
                    </div>
                )
            })}

            <div className={styles.buttonCont} style={{ position: "absolute", top: 0, left: 0, width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", fontFamily: "var(--fakeReceipt)", fontSize: "vaR(--fontSizeL)" }}>
                <button style={{ cursor: "pointer" }} onClick={() => {
                    currentIndexSet(prev => {
                        return getPrevInBounds(prev)
                    })
                }}>{"<"}</button>

                <button style={{ cursor: "pointer" }} onClick={() => {
                    currentIndexSet(prev => {
                        return getNextInBounds(prev)
                    })
                }}>{">"}</button>
            </div>
        </div>
    )
}
