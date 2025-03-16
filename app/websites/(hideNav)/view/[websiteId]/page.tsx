"use client"
import { scaleToFit } from '@/utility/utility'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { page, website } from '@/types';
import { getSpecificWebsite } from '@/serverFunctions/handleWebsites';
import toast from 'react-hot-toast';

const sizeOptionsArr = ["desktop", "tablet", "mobile"] as const
type sizeOption = typeof sizeOptionsArr[number]

export default function Page({ params }: { params: { websiteId: string } }) {
    const searchParams = useSearchParams();
    const [refresher, refresherSet] = useState(true)

    const [websiteObj, websiteObjSet] = useState<website | undefined>()
    const [screenDimensions, screenDimensionsSet] = useState<{ width: number, height: number } | null>(null)

    const [activePageId, activePageIdSet] = useState<page["id"] | undefined>(undefined)
    const activePage = useMemo<page | undefined>(() => {
        if (websiteObj === undefined || websiteObj.pages === undefined || activePageId === undefined) return undefined

        const foundPage = websiteObj.pages.find(eachPageFind => eachPageFind.id === activePageId)
        if (foundPage === undefined) return undefined

        return foundPage
    }, [websiteObj?.pages, activePageId])

    const [seenSize, seenSizeSet] = useState<sizeOption | undefined>(undefined)

    const displaySize: { width: number, height: number } | null = seenSize === "desktop" ? {
        width: 1920,
        height: 1080,

    } : seenSize === "tablet" ? {
        width: 768,
        height: 1024,

    } : seenSize === "mobile" ? {
        width: 375,
        height: 667,

    } : null

    console.log(`$displaySize`, displaySize);

    //get website
    useEffect(() => {
        const search = async () => {
            const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: params.websiteId } })
            if (seenWebsite === undefined) {
                toast.error("not seeing website")
                return
            }
            console.log(`$seenWebsite`, seenWebsite);

            websiteObjSet(seenWebsite)
        }
        search()
    }, [])

    //get screen dimension
    useEffect(() => {
        screenDimensionsSet({ width: window.innerWidth, height: window.innerHeight })
    }, [])

    //start off activePage
    useEffect(() => {
        if (activePage !== undefined || websiteObj === undefined || websiteObj.pages === undefined) return

        //get from url
        const seenPage = searchParams.get("page")
        const foundPage = websiteObj.pages.find(eachPage => eachPage.link === seenPage)

        if (foundPage !== undefined) {
            activePageIdSet(foundPage.id)

        } else {
            //else default to first in array
            activePageIdSet(websiteObj.pages[0].id)
        }

    }, [websiteObj])

    //start off size
    useEffect(() => {
        //get from url
        let seenSizeInUrl = searchParams.get("size") as unknown as sizeOption

        if (sizeOptionsArr.includes(seenSizeInUrl)) {
            seenSizeSet(seenSizeInUrl)

        } else {
            seenSizeSet("mobile")
        }
    }, [])

    function refreshThings() {
        refresherSet(false)

        setTimeout(() => {
            refresherSet(true)
        }, 300);
    }

    const scale = screenDimensions !== null && displaySize !== null ? scaleToFit(screenDimensions.width, screenDimensions.height, displaySize.width, displaySize.height) : null

    if (screenDimensions === null || scale === null || websiteObj === undefined || activePage === undefined || displaySize === null) return null

    return (
        <>
            {refresher && (
                <iframe src={`/websites/iframeView/${websiteObj.id}?page=${activePage.link}`} width={displaySize.width} height={displaySize.height} style={{ scale: scale, transformOrigin: "center", position: "absolute", top: "50%", left: "50%", translate: "-50% -50%" }} />
            )}

            <div>
                <select value={activePageId}
                    onChange={async (event: React.ChangeEvent<HTMLSelectElement>) => {
                        if (websiteObj.usedComponents === undefined) return

                        const eachPageId = event.target.value

                        //whenever page id changes hold off on showing results
                        activePageIdSet(eachPageId)

                        refreshThings()
                    }}
                >
                    {websiteObj.pages !== undefined && websiteObj.pages.map(eachPage => {

                        return (
                            <option key={eachPage.id} value={eachPage.id}

                            >{eachPage.link === "/" ? "home" : eachPage.link}</option>
                        )
                    })}
                </select>

                <div>
                    {sizeOptionsArr.map(eachSize => {
                        return (
                            <div key={eachSize}
                                onClick={() => {
                                    seenSizeSet(eachSize)
                                }}
                            >{eachSize}</div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}


