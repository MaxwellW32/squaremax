"use client"
import { scaleToFit } from '@/utility/utility'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { pageType, sizeOptionsArr, sizeOptionType, websiteType } from '@/types';
import { getSpecificWebsite } from '@/serverFunctions/handleWebsites';
import toast from 'react-hot-toast';
import Draggable from 'react-draggable';

export default async function Page({ params }: { params: Promise<{ websiteId: string }> }) {
    const { websiteId } = await params

    const searchParams = useSearchParams();
    const [refresher, refresherSet] = useState(true)
    const draggableRef = useRef<HTMLDivElement | null>(null)

    const [websiteObj, websiteObjSet] = useState<websiteType | undefined>()
    const [screenDimensions, screenDimensionsSet] = useState<{ width: number, height: number } | null>(null)

    const [activePageId, activePageIdSet] = useState<pageType["id"] | undefined>(undefined)
    const activePage = useMemo<pageType | undefined>(() => {
        if (websiteObj === undefined || websiteObj.pages === undefined || activePageId === undefined) return undefined

        const foundPage = websiteObj.pages.find(eachPageFind => eachPageFind.id === activePageId)
        if (foundPage === undefined) return undefined

        return foundPage
    }, [websiteObj?.pages, activePageId])

    const [sizeOptions, sizeOptionsSet] = useState<sizeOptionType[]>(sizeOptionsArr)
    const activeSizeOption = useMemo(() => {
        return sizeOptions.find(eachSizeOption => eachSizeOption.active)
    }, [sizeOptions])

    //get website
    useEffect(() => {
        const search = async () => {
            const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } })
            if (seenWebsite === undefined) {
                toast.error("not seeing website")
                return
            }

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

    //start off size options
    useEffect(() => {
        //get from url
        const seenSizeInUrl = searchParams.get("size")

        sizeOptionsSet(prevSizeOptions => {
            const newSizeOptions = prevSizeOptions.map(eachSizeOption => {
                eachSizeOption.active = false

                if (eachSizeOption.name === seenSizeInUrl) {
                    eachSizeOption.active = true
                }

                return eachSizeOption
            })

            const foundOneActive = newSizeOptions.find(eachSizeOptionFind => eachSizeOptionFind.active) !== undefined
            if (!foundOneActive) {
                newSizeOptions[0].active = true
            }

            return newSizeOptions
        })
    }, [])

    function refreshThings() {
        refresherSet(false)

        setTimeout(() => {
            refresherSet(true)
        }, 300);
    }

    const scale = screenDimensions !== null && activeSizeOption !== undefined ? scaleToFit(screenDimensions.width, screenDimensions.height, activeSizeOption.width, activeSizeOption.height) : null

    if (screenDimensions === null || scale === null || websiteObj === undefined || activePage === undefined || activeSizeOption === undefined) return null

    return (
        <>
            {refresher && (
                <iframe src={`/websites/iframeView/${websiteObj.id}?page=${activePage.link}`} width={activeSizeOption.width} height={activeSizeOption.height} style={{ scale: scale, transformOrigin: "center", position: "absolute", top: "50%", left: "50%", translate: "-50% -50%" }} />
            )}

            <Draggable
                nodeRef={draggableRef}
            >
                <div ref={draggableRef} style={{ display: "grid", alignContent: "flex-start", width: "min(200px, 60vw)" }}>
                    <div className='toolTip' style={{ backgroundColor: "var(--bg1)", cursor: "pointer", padding: "var(--spacingS)", display: "grid", alignItems: "center", justifyItems: "center" }} data-tooltip={"drag"}>
                        <svg style={{ fill: "var(--bg2" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" /></svg>
                    </div>

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

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {sizeOptions.map(eachSizeOption => {
                            return (
                                <button key={eachSizeOption.name} className='button4 svgChildFill' style={{ padding: "var(--spacingS)", backgroundColor: eachSizeOption.active ? "var(--color1)" : "" }}
                                    onClick={() => {
                                        sizeOptionsSet(prevSizeOptions => {
                                            const newSizeOptions = prevSizeOptions.map(eachSizeOptionMap => {
                                                eachSizeOptionMap.active = false

                                                if (eachSizeOptionMap.name === eachSizeOption.name) {
                                                    eachSizeOptionMap.active = true
                                                }

                                                return eachSizeOptionMap
                                            })

                                            return newSizeOptions
                                        })
                                    }}
                                >
                                    <span className="material-symbols-outlined">
                                        {eachSizeOption.iconName}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </Draggable>
        </>
    )
}


