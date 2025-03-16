"use client"
import { scaleToFit } from '@/utility/utility'
import React, { useEffect, useState } from 'react'

export default function Page({ params }: { params: { websiteId: string } }) {
    const option: string = "mobile"
    const [screenDimensions, screenDimensionsSet] = useState<{ width: number, height: number } | null>(null)

    const chosenSize = option === "desktop" ? {
        width: 1920,
        height: 1080,
    } : option === "tablet" ? {
        width: 768,
        height: 1024,
    } : {
        width: 375,
        height: 667,
    }

    //get screen dimension
    useEffect(() => {
        screenDimensionsSet({ width: window.innerWidth, height: window.innerHeight })
    }, [])

    const scale = screenDimensions !== null ? scaleToFit(screenDimensions.width, screenDimensions.height, chosenSize.width, chosenSize.height) : null

    if (screenDimensions === null || scale === null) return null

    return (
        <div style={{ display: "grid", alignContent: "flex-start", justifyItems: "center", }}>
            <iframe src={`/websites/iframeView/${params.websiteId}`} width={chosenSize.width} height={chosenSize.height} style={{ scale: scale, transformOrigin: "top" }} />
        </div>
    )
}


