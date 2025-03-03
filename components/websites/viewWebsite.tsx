"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from "./style.module.css"
import { componentDataType, pageComponent, sizeOptionType, updateWebsiteSchema, viewerComponentType, website, } from '@/types'
import { addScopeToCSS, deepClone, sanitizePageComponentData } from '@/utility/utility'
import AddPage from '../pages/addPage'
import globalDynamicComponents from '@/utility/globalComponents'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { deleteWebsitePage, deleteWebsitePageComponent, refreshWebsitePath, updateTheWebsite, updateWebsitePageComponent } from '@/serverFunctions/handleWebsites'
import ComponentDataSwitch from '../components/componentData/ComponentDataSwitch'
import ComponentSelector from '../components/ComponentSelector'
import toast from 'react-hot-toast'
import { getSpecificComponent } from '@/serverFunctions/handleComponents'
import ConfirmationBox from '../confirmationBox/ConfirmationBox'
import ComponentOrderSelector from '../components/componentOrderSelector/ComponentOrderSelector'

//flesh out the data needed for all website categories
//think up all the possible website categories
//global page

export default function ViewWebsite({ websiteFromServer }: { websiteFromServer: website }) {
    const [showingSideBar, showingSideBarSet] = useState(false)
    const [dimSideBar, dimSideBarSet] = useState<boolean>(false)

    const [sizeOptions, sizeOptionsSet] = useState<sizeOptionType[]>([
        {
            name: "mobile",
            width: 375,
            height: 667,
            active: false,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M80 0C44.7 0 16 28.7 16 64l0 384c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L80 0zM192 400a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
        },
        {
            name: "tablet",
            width: 768,
            height: 1024,
            active: false,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM176 432l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" /></svg>
        },
        {
            name: "desktop",
            width: 1920,
            height: 1080,
            active: true,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l176 0-10.7 32L160 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-69.3 0L336 416l176 0c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0zM512 64l0 224L64 288 64 64l448 0z" /></svg>
        },
    ])
    const activeSizeOption = useMemo(() => {
        return sizeOptions.find(eachSizeOption => eachSizeOption.active)
    }, [sizeOptions])

    const [canvasScale, canvasScaleSet] = useState(1)
    const [fit, fitSet] = useState(true)

    const spacerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const canvasContRef = useRef<HTMLDivElement | null>(null)

    const [websiteObj, websiteObjSet] = useState<website>(websiteFromServer)

    const [activePageId, activePageIdSet] = useState<string>(() => {
        const pageEntries = Object.entries(websiteFromServer.pages)
        if (pageEntries.length > 0) {
            return pageEntries[0][0]
        } else {
            return ""
        }
    })

    const [addingPage, addingPageSet] = useState(false)
    const [editingGlobalStyle, editingGlobalStyleSet] = useState(false)
    const [componentsBuilt, componentBuiltSet] = useState(false)

    const tempActivePageComponentId = useRef<pageComponent["id"]>("")
    const [activePageComponentId, activePageComponentIdSet] = useState<pageComponent["id"]>("")

    const activePageComponent = useMemo<pageComponent | undefined>(() => {
        if (websiteObj.pages[activePageId] === undefined) return undefined

        function searchRecursively(seenPageComponents: pageComponent[]): pageComponent | undefined {
            //search through the array past
            //if element found return it
            //if children call the same function

            let foundPageComponent: pageComponent | undefined = undefined

            seenPageComponents.forEach(eachPageComponent => {
                if (eachPageComponent.id === activePageComponentId) {
                    foundPageComponent = eachPageComponent

                } else {
                    const foundPageComponentInChildren = searchRecursively(eachPageComponent.children)
                    if (foundPageComponentInChildren !== undefined) {
                        foundPageComponent = foundPageComponentInChildren
                    }
                }
            })

            return foundPageComponent
        }

        const foundPageComponent = searchRecursively(websiteObj.pages[activePageId].pageComponents)
        return foundPageComponent

    }, [websiteObj.pages[activePageId]?.pageComponents, activePageComponentId])

    const renderedComponentsObj = useRef<{
        [key: string]: React.ComponentType<{
            data: componentDataType;
        }>
    }>({})

    const updateWebsiteDebounce = useRef<NodeJS.Timeout>()
    // const updatePageDebounce = useRef<NodeJS.Timeout>()
    const updatePageComponentDebounce = useRef<NodeJS.Timeout>()

    const [saveState, saveStateSet] = useState<"saving" | "saved">("saved")
    const [viewerComponent, viewerComponentSet] = useState<viewerComponentType | null>(null)

    // respond to changes from server 
    useEffect(() => {
        const start = async () => {
            try {
                const newWebsite = { ...websiteFromServer }

                if (newWebsite.pages[activePageId] !== undefined) {
                    //add component from db onto object recursively
                    async function addTheComponentInfo(pageComponents: pageComponent[]) {
                        return Promise.all(
                            pageComponents.map(async eachPageComponent => {
                                const seenComponent = await getSpecificComponent({ id: eachPageComponent.componentId })
                                if (seenComponent === undefined) {
                                    console.log(`$not seeing component for `, eachPageComponent.componentId);
                                }

                                //add component onto object
                                eachPageComponent.component = seenComponent

                                //handle child components
                                eachPageComponent.children = await addTheComponentInfo(eachPageComponent.children)

                                return eachPageComponent
                            })
                        )
                    }

                    //page components now have component info added
                    newWebsite.pages[activePageId].pageComponents = await addTheComponentInfo(newWebsite.pages[activePageId].pageComponents)

                    //build components recursively
                    const builtPageComponents: pageComponent[] = await buildPageComponents(newWebsite.pages[activePageId].pageComponents)
                    newWebsite.pages[activePageId].pageComponents = builtPageComponents
                }

                //update obj locally with changes
                websiteObjSet(newWebsite)

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        start()
    }, [websiteFromServer, activePageId])

    //calculate fit on device size change
    useEffect(() => {
        if (canvasContRef.current === null || activeSizeOption === undefined) return

        const widthDiff = canvasContRef.current.clientWidth / activeSizeOption.width
        const heightDiff = canvasContRef.current.clientHeight / activeSizeOption.height

        const newScale = widthDiff < heightDiff ? widthDiff : heightDiff

        canvasScaleSet(newScale)

    }, [activeSizeOption, canvasContRef])

    //center canvasView
    useEffect(() => {
        centerCanvas()
    }, [activeSizeOption, fit])

    //add keydown listener for interaction clicks
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [tempActivePageComponentId])

    function centerCanvas() {
        if (canvasContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        canvasContRef.current.scrollLeft = (canvasContRef.current.scrollWidth / 2) - (canvasContRef.current.clientWidth / 2)
        canvasContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? canvasContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    async function buildPageComponents(sentPageComponents: pageComponent[], atTop = true): Promise<pageComponent[]> {
        if (atTop) componentBuiltSet(false)

        //build all components
        const builtPageComponents = await Promise.all(
            sentPageComponents.map(async eachPageComponent => {
                if (eachPageComponent.component === undefined || eachPageComponent.component.category === undefined) throw new Error("need component and category")

                //get started props if none there
                if (eachPageComponent.data === null) {
                    eachPageComponent.data = eachPageComponent.component.defaultData
                }

                //get started props if none there
                if (eachPageComponent.css === "") {
                    eachPageComponent.css = eachPageComponent.component.defaultCss
                }

                //if doesnt exist in renderObj then render it
                if (renderedComponentsObj.current[eachPageComponent.component.id] === undefined) {
                    const seenResponse = await globalDynamicComponents(eachPageComponent.component.id)

                    //assign builds to renderObj
                    if (seenResponse !== undefined) {
                        renderedComponentsObj.current[eachPageComponent.component.id] = seenResponse()

                    } else {
                        //log component id not found
                        console.log(`$element component id not found`, eachPageComponent.component.id);
                    }
                }

                //handle children
                eachPageComponent.children = await buildPageComponents(eachPageComponent.children, false)

                return eachPageComponent
            }))

        if (atTop) componentBuiltSet(true)

        return deepClone(builtPageComponents)
    }

    async function handleWebsiteUpdate(newWebsite: website) {
        try {
            //when something updates website handle it on user interaction
            //update locally
            websiteObjSet(newWebsite)

            //update on server after delay
            if (updateWebsiteDebounce.current) clearTimeout(updateWebsiteDebounce.current)

            //make new website schema
            updateWebsiteDebounce.current = setTimeout(async () => {
                //ensure only certain fields can be updated
                const validatedNewWebsite = updateWebsiteSchema.parse(newWebsite)

                saveStateSet("saving")
                await updateTheWebsite(newWebsite.id, validatedNewWebsite)

                console.log(`$saved website to db`);
                saveStateSet("saved")
            }, 3000);

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    // async function handlePageUpdate(newPage: page) {
    //     try {
    //         //update locally
    //         websiteObjSet(prevWebsite => {
    //             const newWebsite = { ...prevWebsite }

    //             newWebsite.pages[activePageId] = newPage

    //             return newWebsite
    //         })

    //         //update on server after delay
    //         if (updatePageDebounce.current) clearTimeout(updatePageDebounce.current)

    //         //make new website schema
    //         updatePageDebounce.current = setTimeout(async () => {
    //             //ensure only certail fields can be updated
    //             const validatedNewPage = updatePageSchema.parse(newPage)

    //             saveStateSet("saving")
    //             await updateWebsitePage(websiteObj.id, activePageId, validatedNewPage)

    //             console.log(`$saved page to db`);
    //             saveStateSet("saved")
    //         }, 3000);

    //     } catch (error) {
    //         consoleAndToastError(error)
    //     }
    // }

    async function handlePageComponentUpdate(newPageComponent: pageComponent) {
        //update locally
        websiteObjSet(prevWebsite => {
            const newWebsite = { ...prevWebsite }

            newWebsite.pages[activePageId].pageComponents = newWebsite.pages[activePageId].pageComponents.map(eachPageComponent => {
                if (eachPageComponent.id === newPageComponent.id) {
                    return newPageComponent
                }

                return eachPageComponent
            })

            return newWebsite
        })

        //send to server
        if (updatePageComponentDebounce.current) clearTimeout(updatePageComponentDebounce.current)

        updatePageComponentDebounce.current = setTimeout(async () => {
            saveStateSet("saving")

            //ensure fields are appropriate for server transfer
            const sanitizedPageComponent = sanitizePageComponentData(newPageComponent)

            await updateWebsitePageComponent(websiteObj.id, activePageId, sanitizedPageComponent)

            console.log(`$saved page component to db`);
            saveStateSet("saved")
        }, 3000);
    }

    function handlePropsChange(newPropsObj: componentDataType, sentPageComponent: pageComponent) {
        //update the data
        sentPageComponent.data = newPropsObj

        handlePageComponentUpdate(sentPageComponent)
    }

    function handleKeyDown(e: KeyboardEvent) {
        const activationKeys = ["alt"]

        const seenKey = e.key.toLowerCase()

        if (activationKeys.includes(seenKey)) {
            activePageComponentIdSet(tempActivePageComponentId.current)
        }
    }

    function handleSelectPageComponent() {
        if (tempActivePageComponentId.current === "") return

        activePageComponentIdSet(tempActivePageComponentId.current)
    }

    return (
        <main className={styles.main}>
            <div className={styles.mainSettingsCont}>
                <div>
                    {saveState === "saving" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg>
                    )}

                </div>

                <div className={styles.mainSettingsContMiddle}>
                    {sizeOptions.map(eachSizeOption => {
                        return (
                            <button key={eachSizeOption.name}
                                onClick={() => {
                                    sizeOptionsSet(prevSizeOptions => {
                                        const newSizeOptions = prevSizeOptions.map(eachSmallSizeOption => {
                                            if (eachSmallSizeOption.name === eachSizeOption.name) {
                                                eachSmallSizeOption.active = true
                                            } else {
                                                eachSmallSizeOption.active = false
                                            }

                                            return eachSmallSizeOption
                                        })

                                        return newSizeOptions
                                    })

                                    fitSet(false)
                                }}
                            >
                                {eachSizeOption.icon}
                            </button>
                        )
                    })}

                    <button
                        onClick={() => {
                            fitSet(prev => !prev)
                        }}
                    >
                        {fit ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z" /></svg>
                        )}
                    </button>
                </div>

                <div></div>
            </div>

            <div className={styles.mainContent}>
                <div ref={canvasContRef} className={styles.canvasCont}>
                    {activeSizeOption !== undefined && (
                        <div ref={canvasRef} className={styles.canvas} style={{ width: fit ? canvasContRef.current?.clientWidth : activeSizeOption.width, height: fit ? canvasContRef.current?.clientHeight : activeSizeOption.height, scale: fit ? 1 : canvasScale }}
                            onClick={handleSelectPageComponent}
                        >
                            {websiteObj.pages[activePageId] !== undefined && componentsBuilt && (
                                <>
                                    <style>{addScopeToCSS(websiteObj.globalCss, styles.canvas)}</style>

                                    {websiteObj.pages[activePageId].pageComponents.map(eachPageToComponent => {
                                        return (
                                            <RenderComponentTree key={eachPageToComponent.id} seenPageComponent={eachPageToComponent} websiteObj={websiteObj} activePageId={activePageId} renderedComponentsObj={renderedComponentsObj} tempActivePageComponentId={tempActivePageComponentId} viewerComponent={viewerComponent} />
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    )}

                    <div ref={spacerRef} className={styles.spacer}></div>
                </div>

                <div className={styles.sideBar} style={{ display: showingSideBar ? "" : "none" }}                >
                    <div className={styles.sideBarSettings} style={{ backgroundColor: dimSideBar ? "" : "aliceblue" }}>
                        <button className='secondaryButton'
                            onClick={() => {
                                showingSideBarSet(false)
                            }}
                        >close</button>

                        <button className='secondaryButton' style={{ filter: dimSideBar ? "brightness(.4)" : "" }}
                            onClick={() => {
                                dimSideBarSet(prev => !prev)
                            }}
                        >dim</button>
                    </div>

                    <div className={styles.sideBarContent} style={{ display: showingSideBar ? "" : "none", opacity: dimSideBar ? 0 : "" }}>
                        <div style={{ display: "grid", alignContent: "flex-start", overflow: "auto" }}>
                            <ul style={{ display: "flex", flexWrap: "wrap", overflowX: "auto" }}>
                                {Object.entries(websiteObj.pages).map(eachPageEntry => {
                                    //show each page name
                                    const eachPageKey = eachPageEntry[0]
                                    const eachPageValue = eachPageEntry[1]

                                    return (
                                        <button key={eachPageKey} className='mainButton' style={{ backgroundColor: eachPageKey === activePageId ? "rgb(var(--color1))" : "rgb(var(--shade1))" }}
                                            onClick={() => {
                                                activePageIdSet(eachPageKey)
                                            }}
                                        >{eachPageValue.name}</button>
                                    )
                                })}

                                <button className='mainButton'
                                    onClick={() => {
                                        addingPageSet(prev => !prev)
                                    }}
                                >{addingPage ? "close" : "add page"}</button>

                                {activePageId !== "" && (
                                    <ConfirmationBox text='delete page' confirmationText='are you sure you want to delete' successMessage='page deleted!' float={true} runAction={async () => {
                                        await deleteWebsitePage(websiteObj.id, activePageId)

                                        await refreshWebsitePath({ id: websiteObj.id })
                                    }} />
                                )}
                            </ul>

                            <AddPage style={{ display: addingPage ? "" : "none" }} seenWebsite={websiteObj} />

                            {websiteObj.pages[activePageId] !== undefined && (
                                <ComponentSelector seenWebsite={websiteObj} activePageId={activePageId} currentIndex={websiteObj.pages[activePageId].pageComponents.length} />
                            )}
                        </div>

                        <div style={{ display: "grid", alignContent: "flex-start", overflow: "auto" }}>
                            <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                onClick={() => {
                                    editingGlobalStyleSet(prev => !prev)
                                }}
                            >{editingGlobalStyle ? "close" : "open"} global styles</button>

                            {editingGlobalStyle && (
                                <textarea rows={5} value={websiteObj.globalCss} className={styles.styleEditor}
                                    onChange={(e) => {
                                        const newWebsite = { ...websiteObj }
                                        newWebsite.globalCss = e.target.value

                                        handleWebsiteUpdate(newWebsite)
                                    }}
                                />
                            )}

                            {activePageComponent !== undefined && (
                                <>
                                    <label>styling</label>
                                    <textarea rows={5} value={activePageComponent.css} className={styles.styleEditor}
                                        onChange={(e) => {
                                            const newActiveComp: pageComponent = { ...activePageComponent }
                                            newActiveComp.css = e.target.value

                                            handlePageComponentUpdate(newActiveComp)
                                        }}
                                    />

                                    <label>props</label>
                                    <ComponentDataSwitch activePageComponent={activePageComponent} handlePropsChange={handlePropsChange} websiteObj={websiteObj} activePageId={activePageId} />

                                    <label>preview components</label>
                                    {viewerComponent === null ? (
                                        <button className='mainButton'
                                            onClick={() => {
                                                viewerComponentSet({ pageComponentIdToSwap: activePageComponent.id, component: null, builtComponent: null })
                                            }}
                                        >enable viewer node</button>
                                    ) : (
                                        <button className='mainButton'
                                            onClick={() => {
                                                viewerComponentSet(null)
                                            }}
                                        >cancel viewer node</button>
                                    )}

                                    {/* show options for active */}
                                    {viewerComponent !== null && viewerComponent.pageComponentIdToSwap === activePageComponent.id && websiteObj.pages[activePageId] !== undefined && (
                                        <>
                                            <ComponentSelector seenWebsite={websiteObj} activePageId={activePageId} currentIndex={0} viewerComponentSet={viewerComponentSet} />

                                            {viewerComponent.component !== null && (
                                                <button className='mainButton'
                                                    onClick={async () => {
                                                        try {
                                                            //replace the page component with this selection

                                                            //ensure the component info is there
                                                            if (viewerComponent.component === null || activePageComponent.data === null) return

                                                            //if pageComponents are the same type can reuse data
                                                            const reusingPageComponentData = activePageComponent.data.category === viewerComponent.component.categoryId

                                                            //replace everything except id, pageid, compid, children
                                                            const newReplacedPageComponent = { ...activePageComponent, componentId: viewerComponent.component.id, css: viewerComponent.component.defaultCss, data: reusingPageComponentData ? activePageComponent.data : viewerComponent.component.defaultData, }

                                                            //ensure pageComponent is safe to send to server
                                                            const sanitizedPageComponent = sanitizePageComponentData(newReplacedPageComponent)

                                                            //send to server to replace
                                                            await updateWebsitePageComponent(websiteObj.id, activePageId, sanitizedPageComponent)
                                                            await refreshWebsitePath({ id: websiteObj.id })

                                                            viewerComponentSet(null)

                                                            toast.success("swapped component")

                                                        } catch (error) {
                                                            consoleAndToastError(error)
                                                        }
                                                    }}
                                                >repalce with this component</button>
                                            )}
                                        </>
                                    )}

                                    <label>change order</label>
                                    <ComponentOrderSelector websiteId={websiteObj.id} pageId={activePageId} pageComponentId={activePageComponent.id} seenPageComponents={websiteObj.pages[activePageId].pageComponents} />

                                    <label>delete component</label>
                                    <ConfirmationBox text='delete' confirmationText='are you sure you want to delete' successMessage='deleted!' runAction={async () => {
                                        await deleteWebsitePageComponent(websiteObj.id, activePageId, activePageComponent.id)

                                        await refreshWebsitePath({ id: websiteObj.id })
                                    }} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {!showingSideBar && (
                    <button className='secondaryButton' style={{ position: "absolute", top: 0, right: 0 }}
                        onClick={() => {
                            showingSideBarSet(true)
                            dimSideBarSet(false)
                        }}
                    >open</button>
                )}
            </div>
        </main>
    )
}

function RenderComponentTree({
    seenPageComponent, websiteObj, activePageId, renderedComponentsObj, tempActivePageComponentId, viewerComponent
}: {
    seenPageComponent: pageComponent, websiteObj: website, activePageId: string, renderedComponentsObj: React.MutableRefObject<{ [key: string]: React.ComponentType<{ data: componentDataType; }> }>, tempActivePageComponentId: React.MutableRefObject<string>, viewerComponent: viewerComponentType | null
}) {
    let usingViewerComponent = false

    let SeenViewerComp: React.ComponentType<{
        data: componentDataType;
    }> | null = null
    let seenViewerComponentData: componentDataType | null = null

    //assign new chosen component if using the viewer node
    if (viewerComponent !== null && viewerComponent.pageComponentIdToSwap === seenPageComponent.id && viewerComponent.component !== null && viewerComponent.builtComponent !== null) {
        usingViewerComponent = true
        SeenViewerComp = viewerComponent.builtComponent
        seenViewerComponentData = viewerComponent.component.defaultData
    }

    const ComponentToRender = renderedComponentsObj.current[seenPageComponent.componentId];
    if (ComponentToRender === undefined) {
        console.error(
            `Component with ID ${seenPageComponent.componentId} is not in renderedComponentsObj.`,
            renderedComponentsObj.current
        );
        return null;
    }

    //make sure component data is fetched
    if (seenPageComponent.data === null) {
        console.log(`No data in component`, seenPageComponent);
        return null;
    }

    const scopedCss = addScopeToCSS(seenPageComponent.css, seenPageComponent.id);

    // Recursively render child components
    const childJSX = seenPageComponent.children.map((componentChild) => {
        return <RenderComponentTree key={componentChild.id} seenPageComponent={componentChild} websiteObj={websiteObj} activePageId={activePageId} renderedComponentsObj={renderedComponentsObj} tempActivePageComponentId={tempActivePageComponentId} viewerComponent={viewerComponent} />;
    })

    // If the component is a container, pass children as a prop
    const componentProps = seenPageComponent.data

    //apply scoped styling starter value
    componentProps.styleId = `____${seenPageComponent.id}`

    //handle chuldren for different categories
    if (childJSX.length > 0) {
        if (componentProps.category === "containers") {
            componentProps.children = childJSX
        }
    }

    //add mouse over listener for interaction
    //@ts-expect-error mouseOver
    componentProps.mainElProps.onMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()

        tempActivePageComponentId.current = seenPageComponent.id;

        //highlight the element to show selection
        const seenEl = e.currentTarget as HTMLElement;
        seenEl.classList.add(styles.highlightComponent);

        setTimeout(() => {
            seenEl.classList.remove(styles.highlightComponent);
        }, 1000);
    }

    //pass children to viewer component if valid
    if (seenViewerComponentData !== null && seenViewerComponentData.category === "containers") {
        //check for the children attribute
        seenViewerComponentData.children = childJSX
    }

    return (
        <React.Fragment key={seenPageComponent.id}>
            {usingViewerComponent ? (
                <>
                    {SeenViewerComp !== null && seenViewerComponentData !== null && (
                        <SeenViewerComp data={seenViewerComponentData} />
                    )}
                </>
            ) : (
                <>
                    <style>{scopedCss}</style>

                    {/* Render the main component with injected props */}
                    <ComponentToRender data={componentProps} />
                </>
            )}
        </React.Fragment>
    );
}