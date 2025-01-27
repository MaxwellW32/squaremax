"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from "./style.module.css"
import { componentDataType, pagesToComponent, sizeOptionType, updateWebsiteSchema, viewerComponentType, website, } from '@/types'
import { addScopeToCSS, deepClone, sanitizeDataInPageComponent } from '@/utility/utility'
import AddPage from '../pages/addPage'
import globalDynamicComponents from '@/utility/globalComponents'
import { updateComponentInPage } from '@/serverFunctions/handlePagesToComponents'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { refreshWebsitePath, updateTheWebsite } from '@/serverFunctions/handleWebsites'
import ComponentDataSwitch from '../components/componentData/ComponentDataSwitch'
import ComponentSelector from '../components/ComponentSelector'
import toast from 'react-hot-toast'

//switch them
//copy data

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

    const [activePageIndex, activePageIndexSet] = useState<number>(0)
    const [addingPage, addingPageSet] = useState(false)
    const [editingGlobalStyle, editingGlobalStyleSet] = useState(false)
    const [componentsBuilt, componentBuiltSet] = useState(false)

    const tempActivePagesToComponentId = useRef<pagesToComponent["id"]>("")
    const [activePagesToComponentId, activePagesToComponentIdSet] = useState<pagesToComponent["id"]>("")
    const activePageComponent = useMemo<pagesToComponent | undefined>(() => {
        if (websiteObj.pages === undefined) return undefined

        if (websiteObj.pages[activePageIndex] === undefined) return undefined

        if (websiteObj.pages[activePageIndex].pagesToComponents === undefined) return undefined

        const foundPagesToComponent = websiteObj.pages[activePageIndex].pagesToComponents.find(eachPageToComponent => eachPageToComponent.id === activePagesToComponentId)

        return foundPagesToComponent

    }, [websiteObj.pages?.[activePageIndex]?.pagesToComponents, activePagesToComponentId])

    const renderedComponentsObj = useRef<{
        [key: string]: React.ComponentType<{
            data: componentDataType;
        }>
    }>({})

    const updatePagesToComponentDebounce = useRef<NodeJS.Timeout>()
    const updateWebsiteDebounce = useRef<NodeJS.Timeout>()

    const [saveState, saveStateSet] = useState<"saving" | "saved">("saved")

    const [viewerComponent, viewerComponentSet] = useState<viewerComponentType | null>(null)

    // respond to changes from server 
    useEffect(() => {
        const runAction = async () => {
            try {
                const newWebsite = { ...websiteFromServer }
                let builtPageComponents: pagesToComponent[] | undefined = undefined

                if (newWebsite.pages !== undefined && newWebsite.pages[activePageIndex] !== undefined && newWebsite.pages[activePageIndex].pagesToComponents !== undefined) {
                    builtPageComponents = await buildPageComponents(newWebsite.pages[activePageIndex].pagesToComponents)

                    newWebsite.pages[activePageIndex].pagesToComponents = builtPageComponents
                }

                //update obj locally with changes
                websiteObjSet(newWebsite)

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        runAction()
    }, [websiteFromServer])

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
    }, [tempActivePagesToComponentId])

    function centerCanvas() {
        if (canvasContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        canvasContRef.current.scrollLeft = (canvasContRef.current.scrollWidth / 2) - (canvasContRef.current.clientWidth / 2)
        canvasContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? canvasContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    async function buildPageComponents(sentPageComponents: pagesToComponent[]): Promise<pagesToComponent[]> {
        componentBuiltSet(false)

        //build all components
        const builtPageToComponents = await Promise.all(
            sentPageComponents.map(async eachPageToComponent => {
                if (eachPageToComponent.component === undefined || eachPageToComponent.component.category === undefined) throw new Error("need component and category")

                //get started props if none there
                if (eachPageToComponent.data === null) {
                    eachPageToComponent.data = eachPageToComponent.component.defaultData
                }

                //get started props if none there
                if (eachPageToComponent.css === "") {
                    eachPageToComponent.css = eachPageToComponent.component.defaultCss
                }

                //if doesnt exist in renderObj then render it
                if (renderedComponentsObj.current[eachPageToComponent.component.id] === undefined) {
                    const seenResponse = await globalDynamicComponents(eachPageToComponent.component.id)

                    //assign builds to renderObj
                    if (seenResponse !== undefined) {
                        renderedComponentsObj.current[eachPageToComponent.component.id] = seenResponse()

                        //log component id not found
                    } else {
                        console.log(`$woops element component id not found`, eachPageToComponent.component.id);
                    }
                }

                return eachPageToComponent
            }))

        //Ensure component is not a child
        const childPagesToComponentsIds: pagesToComponent["id"][] = []
        builtPageToComponents.forEach(eachBuiltPageToComponent => {
            if (eachBuiltPageToComponent.children.length > 0) {
                eachBuiltPageToComponent.children.forEach(eachPageToComponentForEach => {
                    childPagesToComponentsIds.push(eachPageToComponentForEach.pagesToComponentsId)
                })
            }
        })

        const basePagesToComponentsMarked = builtPageToComponents.map(eachPageToComponentMap => {
            //if not a child is a base component
            eachPageToComponentMap.isBase = !childPagesToComponentsIds.includes(eachPageToComponentMap.id)

            return eachPageToComponentMap
        })

        //sort base components
        const sortedBasePagesToComponents =
            basePagesToComponentsMarked.sort(
                (a, b) => a.indexOnPage - b.indexOnPage
            );

        componentBuiltSet(true)

        return deepClone(sortedBasePagesToComponents)
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
                const validatedNewWebsite = updateWebsiteSchema.parse(newWebsite)

                saveStateSet("saving")

                await updateTheWebsite(validatedNewWebsite)

                console.log(`$saved website to db`);
                saveStateSet("saved")

            }, 3000);

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    async function handlePageComponentUpdate(newPageComponent: pagesToComponent) {
        try {
            //update locally
            websiteObjSet(pevWebsite => {
                const newWebsite = { ...pevWebsite }
                if (newWebsite.pages === undefined) return pevWebsite
                if (newWebsite.pages[activePageIndex] === undefined) return pevWebsite
                if (newWebsite.pages[activePageIndex].pagesToComponents === undefined) return pevWebsite

                newWebsite.pages[activePageIndex].pagesToComponents = newWebsite.pages[activePageIndex].pagesToComponents.map(eachPageToComponent => {
                    //ensure data is for correct component category, and update 
                    if (eachPageToComponent.id === newPageComponent.id) {
                        eachPageToComponent = newPageComponent
                    }

                    return eachPageToComponent
                })

                return newWebsite
            })

            //update server after delay
            if (updatePagesToComponentDebounce.current) clearTimeout(updatePagesToComponentDebounce.current)


            updatePagesToComponentDebounce.current = setTimeout(async () => {
                const sanitizedPagesToComponent = sanitizeDataInPageComponent(newPageComponent)

                //notify saving
                saveStateSet("saving")

                //server update here
                await updateComponentInPage(sanitizedPagesToComponent)

                console.log(`$saved page component to db`);

                saveStateSet("saved")
            }, 3000)

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    function handlePropsChange(newPropsObj: componentDataType, sentComponentInPage: pagesToComponent) {
        //update the data
        sentComponentInPage.data = newPropsObj

        //send to update function
        handlePageComponentUpdate(sentComponentInPage)
    }

    function handleKeyDown(e: KeyboardEvent) {
        const activationKeys = ["alt"]

        const seenKey = e.key.toLowerCase()

        if (activationKeys.includes(seenKey)) {
            activePagesToComponentIdSet(tempActivePagesToComponentId.current)
        }
    }

    function handleSelectPageComponent() {
        if (tempActivePagesToComponentId.current === "") return

        activePagesToComponentIdSet(tempActivePagesToComponentId.current)
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
                            {websiteObj.pages !== undefined && websiteObj.pages[activePageIndex] !== undefined && websiteObj.pages[activePageIndex].pagesToComponents !== undefined && componentsBuilt && (
                                <>
                                    <style>{addScopeToCSS(websiteObj.globalCss, styles.canvas)}</style>

                                    {websiteObj.pages[activePageIndex].pagesToComponents.map(eachPageToComponent => {
                                        return (
                                            <RenderComponentTree key={eachPageToComponent.id} componentOnPage={eachPageToComponent} websiteObj={websiteObj} activePageIndex={activePageIndex} renderedComponentsObj={renderedComponentsObj} tempActivePagesToComponentId={tempActivePagesToComponentId} viewerComponent={viewerComponent} />
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

                    <div className={styles.sideBarContent} style={{ display: showingSideBar ? "" : "none", opacity: dimSideBar ? 0 : "" }}
                        onClick={() => {
                            dimSideBarSet(false)
                        }}
                    >
                        <div style={{ display: "grid", alignContent: "flex-start", overflow: "auto" }}>
                            {websiteObj.pages !== undefined && (
                                <ul style={{ display: "flex", flexWrap: "wrap", overflowX: "auto" }}>
                                    {websiteObj.pages.map((eachPage, eachPageIndex) => {
                                        return (
                                            <button key={eachPage.id} className='mainButton' style={{ backgroundColor: eachPageIndex === activePageIndex ? "rgb(var(--color1))" : "rgb(var(--shade1))" }}
                                                onClick={() => {
                                                    activePageIndexSet(eachPageIndex)
                                                }}
                                            >{eachPage.name}</button>
                                        )
                                    })}

                                    <button className='mainButton'
                                        onClick={() => {
                                            addingPageSet(prev => !prev)
                                        }}
                                    >{addingPage ? "close" : "add page"}</button>
                                </ul>
                            )}

                            <AddPage style={{ display: addingPage ? "" : "none" }} websiteIdObj={{ id: websiteObj.id }} />

                            {websiteObj.pages !== undefined && websiteObj.pages[activePageIndex] !== undefined && websiteObj.pages[activePageIndex].pagesToComponents !== undefined && (
                                <ComponentSelector pageId={websiteObj.pages[activePageIndex].id} websiteId={websiteObj.id} currentIndex={websiteObj.pages[activePageIndex].pagesToComponents.length} />
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
                                    <p>styling</p>
                                    <textarea rows={5} value={activePageComponent.css} className={styles.styleEditor}
                                        onChange={(e) => {
                                            const newActiveComp: pagesToComponent = { ...activePageComponent }
                                            newActiveComp.css = e.target.value

                                            handlePageComponentUpdate(newActiveComp)
                                        }}
                                    />

                                    <p>props</p>
                                    <ComponentDataSwitch activePagesToComponent={activePageComponent} handlePropsChange={handlePropsChange} websiteObj={websiteObj} />

                                    <p>switch</p>
                                    <button className='mainButton'
                                        onClick={() => {
                                            viewerComponentSet({ componentIdToSwap: activePageComponent.id, component: null, builtComponent: null })
                                        }}
                                    >enable viewer node</button>

                                    {viewerComponent !== null && (
                                        <button className='mainButton'
                                            onClick={() => {
                                                viewerComponentSet(null)
                                            }}
                                        >cancel</button>
                                    )}

                                    {/* show options for active */}
                                    {viewerComponent !== null && viewerComponent.componentIdToSwap === activePageComponent.id && websiteObj.pages !== undefined && websiteObj.pages[activePageIndex] !== undefined && websiteObj.pages[activePageIndex].pagesToComponents !== undefined && (
                                        <>
                                            <ComponentSelector pageId={websiteObj.pages[activePageIndex].id} websiteId={websiteObj.id} currentIndex={activePageComponent.indexOnPage} viewerComponentSet={viewerComponentSet} />

                                            {viewerComponent.component !== null && (
                                                <button className='mainButton'
                                                    onClick={async () => {
                                                        try {
                                                            //replace the page to component with this selection
                                                            //repalce everything except id, pageid, compid, children
                                                            if (viewerComponent.component === null) return

                                                            const newReplacedPageComponent = { ...activePageComponent, componentId: viewerComponent.component.id, css: viewerComponent.component.defaultCss, data: viewerComponent.component.defaultData, }

                                                            const sanitizedPageComponent = sanitizeDataInPageComponent(newReplacedPageComponent)

                                                            await updateComponentInPage(sanitizedPageComponent)

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
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {!showingSideBar && (
                    <button className='secondaryButton' style={{ position: "absolute", top: 0, right: 0 }}
                        onClick={() => {
                            showingSideBarSet(true)
                        }}
                    >open</button>
                )}
            </div>
        </main>
    )
}

function RenderComponentTree({
    componentOnPage, websiteObj, activePageIndex, renderedComponentsObj, tempActivePagesToComponentId, viewerComponent, topLevel = true
}: {
    componentOnPage: pagesToComponent, websiteObj: website, activePageIndex: number, renderedComponentsObj: React.MutableRefObject<{ [key: string]: React.ComponentType<{ data: componentDataType; }> }>, tempActivePagesToComponentId: React.MutableRefObject<string>, viewerComponent: viewerComponentType | null, topLevel?: boolean
}) {
    //ensure only render top level components initially
    if (topLevel && !componentOnPage.isBase) return null

    let usingViewerComponent = false

    let SeenViewerComp: React.ComponentType<{
        data: componentDataType;
    }> | null = null
    let seenViewerCompData: componentDataType | null = null

    //assign new chosen component if using the viewer node
    if (viewerComponent !== null && viewerComponent.componentIdToSwap === componentOnPage.id && viewerComponent.component !== null && viewerComponent.builtComponent !== null) {
        usingViewerComponent = true
        SeenViewerComp = viewerComponent.builtComponent
        seenViewerCompData = viewerComponent.component.defaultData
    }

    const ComponentToRender = renderedComponentsObj.current[componentOnPage.componentId];
    if (ComponentToRender === undefined) {
        console.error(
            `Component with ID ${componentOnPage.componentId} is not in renderedComponentsObj.`,
            renderedComponentsObj.current
        );
        return null;
    }

    //make sure component data is fetched
    if (componentOnPage.data === null) {
        console.log(`No data in component`, componentOnPage);
        return null;
    }
    const scopedCss = addScopeToCSS(componentOnPage.css, componentOnPage.id);

    // Recursively render child components
    const childJSX = componentOnPage.children.map((childComponentOnPage) => {
        if (!websiteObj.pages?.[activePageIndex]?.pagesToComponents) return null;

        const foundPagesToComponent = websiteObj.pages[activePageIndex].pagesToComponents.find(
            (eachPageToComponent) => eachPageToComponent.id === childComponentOnPage.pagesToComponentsId
        );

        if (foundPagesToComponent === undefined) {
            console.log(`Couldn't find component with ID`, childComponentOnPage.pagesToComponentsId);
            return null;
        }

        return <RenderComponentTree key={foundPagesToComponent.id} componentOnPage={foundPagesToComponent} websiteObj={websiteObj} activePageIndex={activePageIndex} renderedComponentsObj={renderedComponentsObj} tempActivePagesToComponentId={tempActivePagesToComponentId} viewerComponent={viewerComponent} topLevel={false} />;
    }).filter(each => each !== null);

    // If the component is a container, pass children as a prop
    const componentProps = componentOnPage.data

    //apply scoped styling starter value
    componentProps.styleId = `____${componentOnPage.id}`

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

        tempActivePagesToComponentId.current = componentOnPage.id;

        const seenEl = e.currentTarget as HTMLElement;
        seenEl.classList.add(styles.highlightComponent);

        setTimeout(() => {
            seenEl.classList.remove(styles.highlightComponent);
        }, 1000);
    }

    //if seeing a children array fiels pass it to the viewer component
    if (seenViewerCompData !== null && componentOnPage.data.category === "containers" && seenViewerCompData.category === "containers") {
        //check for the children attribute
        seenViewerCompData.children = childJSX
    }

    return (
        <React.Fragment key={componentOnPage.id}>
            {usingViewerComponent ? (
                <>
                    {SeenViewerComp !== null && seenViewerCompData !== null && (
                        <SeenViewerComp data={seenViewerCompData} />
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