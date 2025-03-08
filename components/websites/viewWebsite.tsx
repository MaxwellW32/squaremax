"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from "./style.module.css"
import { componentDataType, usedComponent, sizeOptionType, updateWebsiteSchema, viewerComponentType, website, usedComponentLocationType, page, handleManagePageOptions, handleManageUpdateComponentsOptions, updateUsedComponentSchema, } from '@/types'
import { addScopeToCSS, getChildrenUsedComponents, getDescendedUsedComponents, sanitizeUsedComponentData, sortUsedComponentsByIndex, } from '@/utility/utility'
import AddEditPage from '../pages/AddEditPage'
import globalDynamicComponents from '@/utility/globalComponents'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import ComponentDataSwitch from '../components/componentData/ComponentDataSwitch'
import ComponentSelector from '../components/ComponentSelector'
import toast from 'react-hot-toast'
import { getSpecificComponent } from '@/serverFunctions/handleComponents'
import ConfirmationBox from '../confirmationBox/ConfirmationBox'
import ComponentOrderSelector from '../components/componentOrderSelector/ComponentOrderSelector'
import ShowMore from '../showMore/ShowMore'
import AddEditWebsite from './AddEditWebsite'
import LocationSelector from './LocationSelector'
import { refreshWebsitePath, updateTheWebsite } from '@/serverFunctions/handleWebsites'
import { deletePage } from '@/serverFunctions/handlePages'
import { deleteUsedComponent, updateTheUsedComponent } from '@/serverFunctions/handleUsedComponents'

//flesh out the data needed for all website categories
//think up all the possible website categories
//get file creation working

//built website folder - separated by website id
//starting point with base files
//package json customized
//layout - fonts built and spread, global css built
//each page router built
//import the used components based on component id
//name them appropriately by their category
//have a function to write a used component to code, call it recursively if children seen on that page

// Web sockets - signals to update website, update page, update used components 
//fix ordering
//separare update function into quick updates sync later, and sync now local later

export default function ViewWebsite({ websiteFromServer }: { websiteFromServer: website }) {
    const [showingSideBar, showingSideBarSet] = useState(false)
    const [dimSideBar, dimSideBarSet] = useState<boolean>(false)
    const [editOptions, editOptionsSet] = useState(false)

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

    const [activePageId, activePageIdSet] = useState<page["id"] | undefined>(websiteObj.pages !== undefined && websiteObj.pages.length > 0 ? websiteObj.pages[0].id : undefined)
    const activePage = useMemo<page | undefined>(() => {
        if (websiteObj.pages === undefined || activePageId === undefined) return undefined

        const foundPage = websiteObj.pages.find(eachPageFind => eachPageFind.id === activePageId)
        if (foundPage === undefined) return undefined

        return foundPage
    }, [websiteObj.pages, activePageId])

    const [activeLocation, activeLocationSet] = useState<usedComponentLocationType>(activePageId === undefined ? { type: "header" } : { type: "page", pageId: activePageId })

    const [addingPage, addingPageSet] = useState(false)
    const [componentsBuilt, componentBuiltSet] = useState(false)

    const tempActiveUsedComponentId = useRef<usedComponent["id"]>("")
    const [activeUsedComponentId, activeUsedComponentIdSet] = useState<usedComponent["id"]>("")

    const activeUsedComponent = useMemo<usedComponent | undefined>(() => {
        if (websiteObj.usedComponents === undefined) return undefined

        const foundUsedComponent = websiteObj.usedComponents.find(eachUsedComponentFind => eachUsedComponentFind.id === activeUsedComponentId)
        return foundUsedComponent

    }, [websiteObj.usedComponents, activeUsedComponentId])

    const renderedComponentsObj = useRef<{
        [key: string]: React.ComponentType<{
            data: componentDataType;
        }>
    }>({})

    const updateWebsiteDebounce = useRef<NodeJS.Timeout>()
    const updateUsedComponentDebounce = useRef<{ [key: string]: NodeJS.Timeout }>({})

    const [saveState, saveStateSet] = useState<"saving" | "saved">("saved")
    const [viewerComponent, viewerComponentSet] = useState<viewerComponentType | null>(null)

    //get usedComponents on the active page
    const pageUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined) return []

        const usedComponentsInPage = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "page" && eachUsedComponentFilter.location.pageId === activePageId
        })

        const sortedUsedComponents = sortUsedComponentsByIndex(usedComponentsInPage)

        return sortedUsedComponents

    }, [websiteObj.usedComponents, activePageId])

    const headerUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined) return []

        const usedComponentsInHeader = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "header"
        })
        const sortedUsedComponents = sortUsedComponentsByIndex(usedComponentsInHeader)

        return sortedUsedComponents

    }, [websiteObj.usedComponents])

    const footerUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined) return []

        const usedComponentsInFooter = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "footer"
        })
        const sortedUsedComponents = sortUsedComponentsByIndex(usedComponentsInFooter)

        return sortedUsedComponents

    }, [websiteObj.usedComponents])

    // respond to changes from server - build components seen there
    useEffect(() => {
        const start = async () => {
            try {
                //replace original

                if (websiteFromServer.usedComponents !== undefined && activePageId !== undefined) {
                    websiteFromServer.usedComponents = await renderUsedComponentsInUse(websiteFromServer.usedComponents, activePageId)
                }

                //update obj locally with changes
                websiteObjSet(websiteFromServer)

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        start()
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
    }, [tempActiveUsedComponentId])

    //keep active location in line with page selection 
    useEffect(() => {
        //if page selection is active update on page change
        if (activeLocation.type === "page" && activePageId !== undefined) {
            activeLocationSet({ type: "page", pageId: activePageId })
        }
    }, [activePageId])

    function centerCanvas() {
        if (canvasContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        canvasContRef.current.scrollLeft = (canvasContRef.current.scrollWidth / 2) - (canvasContRef.current.clientWidth / 2)
        canvasContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? canvasContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    async function addComponentInfoToUsedComponents(usedComponents: usedComponent[]): Promise<usedComponent[]> {
        return Promise.all(
            usedComponents.map(async eachUsedComponent => {
                //if no component get it for the first time
                if (eachUsedComponent.component === undefined) {
                    const seenComponent = await getSpecificComponent({ id: eachUsedComponent.componentId })
                    if (seenComponent === undefined) {
                        console.log(`$not seeing component for `, eachUsedComponent.componentId);
                    }

                    //add component onto object
                    eachUsedComponent.component = seenComponent
                }

                return eachUsedComponent
            })
        )
    }

    async function buildUsedComponents(sentUsedComponents: usedComponent[]): Promise<usedComponent[]> {
        componentBuiltSet(false)

        //build all components
        const builtUsedComponents = await Promise.all(
            sentUsedComponents.map(async eachUsedComponent => {
                if (eachUsedComponent.component === undefined || eachUsedComponent.component.category === undefined) throw new Error("need component and category")

                //get started props if none there
                if (eachUsedComponent.data === null) {
                    eachUsedComponent.data = eachUsedComponent.component.defaultData
                }

                //get started props if none there
                if (eachUsedComponent.css === "") {
                    eachUsedComponent.css = eachUsedComponent.component.defaultCss
                }

                //if doesnt exist in renderObj then render it
                if (renderedComponentsObj.current[eachUsedComponent.component.id] === undefined) {
                    const seenResponse = await globalDynamicComponents(eachUsedComponent.component.id)

                    //assign builds to renderObj
                    if (seenResponse !== undefined) {
                        renderedComponentsObj.current[eachUsedComponent.component.id] = seenResponse()

                    } else {
                        //log component id not found
                        console.log(`$element component id not found`, eachUsedComponent.component.id);
                    }
                }

                return eachUsedComponent
            }))

        componentBuiltSet(true)

        return builtUsedComponents
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
    async function handleManagePage(options: handleManagePageOptions) {
        try {
            if (options.option === "create") {
                //add locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }

                    //ensure pages seen
                    if (newWebsite.pages === undefined) {
                        return prevWebsite
                    }

                    //set new page
                    newWebsite.pages = [...newWebsite.pages, options.seenAddedPage]

                    return newWebsite
                })

            } else if (options.option === "update") {

                //update locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }

                    //ensure pages seen
                    if (newWebsite.pages === undefined) return prevWebsite

                    //set new page
                    const indexToAddAt = newWebsite.pages.findIndex(eachPageFindIndex => eachPageFindIndex.id === options.seenUpdatedPage.id)
                    newWebsite.pages[indexToAddAt] = options.seenUpdatedPage

                    return newWebsite
                })
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }
    async function handleManageUsedComponents(options: handleManageUpdateComponentsOptions) {
        try {
            if (options.option === "create") {
                //add component info onto object
                const usedComponentsWithInfo = await addComponentInfoToUsedComponents([options.seenAddedUsedComponent])

                //build components
                const [builtUsedComponent]: usedComponent[] = await buildUsedComponents(usedComponentsWithInfo)

                //add locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }
                    if (newWebsite.usedComponents === undefined) return prevWebsite

                    newWebsite.usedComponents = [...newWebsite.usedComponents, builtUsedComponent]

                    return newWebsite
                })

            } else if (options.option === "update") {
                //add component info onto object

                if (options.rebuild) {
                    const usedComponentsWithInfo = await addComponentInfoToUsedComponents([options.seenUpdatedUsedComponent])

                    //build components
                    const [builtUsedComponent]: usedComponent[] = await buildUsedComponents(usedComponentsWithInfo)

                    options.seenUpdatedUsedComponent = builtUsedComponent
                }

                //update locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }
                    if (newWebsite.usedComponents === undefined) return prevWebsite

                    newWebsite.usedComponents = newWebsite.usedComponents.map(eachUsedComponent => {
                        if (eachUsedComponent.id === options.seenUpdatedUsedComponent.id) {
                            return options.seenUpdatedUsedComponent
                        }

                        return eachUsedComponent
                    })

                    return newWebsite
                })

                //update on server after delay
                if (updateUsedComponentDebounce.current[options.seenUpdatedUsedComponent.id]) clearTimeout(updateUsedComponentDebounce.current[options.seenUpdatedUsedComponent.id])

                //make new website schema
                updateUsedComponentDebounce.current[options.seenUpdatedUsedComponent.id] = setTimeout(async () => {
                    //ensure only certain fields can be updated
                    const sanitizedUpdateComponent = sanitizeUsedComponentData(options.seenUpdatedUsedComponent)

                    const validatedUpdatedUsedComponent = updateUsedComponentSchema.parse(sanitizedUpdateComponent)

                    saveStateSet("saving")
                    await updateTheUsedComponent(options.seenUpdatedUsedComponent.websiteId, options.seenUpdatedUsedComponent.id, validatedUpdatedUsedComponent)

                    console.log(`$saved usedComponent to db`);
                    saveStateSet("saved")
                }, 3000);
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    function handlePropsChange(newPropsObj: componentDataType, sentUsedComponent: usedComponent) {
        //update the data
        sentUsedComponent.data = newPropsObj

        handleManageUsedComponents({ option: "update", seenUpdatedUsedComponent: sentUsedComponent })
    }

    function handleKeyDown(e: KeyboardEvent) {
        const activationKeys = ["alt"]

        const seenKey = e.key.toLowerCase()

        if (activationKeys.includes(seenKey)) {
            activeUsedComponentIdSet(tempActiveUsedComponentId.current)
        }
    }

    function handleSelectUsedComponent() {
        if (tempActiveUsedComponentId.current === "") return

        activeUsedComponentIdSet(tempActiveUsedComponentId.current)
    }

    async function renderUsedComponentsInUse(seenUsedComponents: usedComponent[], seenActivePageId: string) {
        //get the header, footer and usedComponents on this page
        const baseUsedComponentsInUse = seenUsedComponents.filter(eachFilterUsedComponent => {
            return eachFilterUsedComponent.location.type === "header" || eachFilterUsedComponent.location.type === "footer" || (eachFilterUsedComponent.location.type === "page" && eachFilterUsedComponent.location.pageId === seenActivePageId)
        })

        //then get all of the base components children recursively
        const baseUsedComponentsDecendants: usedComponent[] = getDescendedUsedComponents(baseUsedComponentsInUse, seenUsedComponents)

        const totalUsedComponentsToRender = [...baseUsedComponentsInUse, ...baseUsedComponentsDecendants]

        //add component info onto object
        const usedComponentsWithInfo = await addComponentInfoToUsedComponents(totalUsedComponentsToRender)

        //build components
        const builtUsedComponents: usedComponent[] = await buildUsedComponents(usedComponentsWithInfo)

        //add back onto the original list
        const updatedUsedComponents = seenUsedComponents.map(eachUsedComponent => {
            const seenUpdatedUsedComponent = builtUsedComponents.find(eachBuiltComponentFind => eachBuiltComponentFind.id === eachUsedComponent.id)
            if (seenUpdatedUsedComponent !== undefined) return seenUpdatedUsedComponent

            //return riginal usedComponent
            return eachUsedComponent
        })

        //return the exact list with some components built/added to render obj
        return updatedUsedComponents
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
                            onClick={handleSelectUsedComponent}
                        >
                            <style>{addScopeToCSS(websiteObj.globalCss, websiteObj.id)}</style>

                            {componentsBuilt && activePage !== undefined && websiteObj.usedComponents !== undefined && (
                                <>
                                    <RenderComponentTree seenUsedComponents={headerUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} activePageId={activePage.id} renderedComponentsObj={renderedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} viewerComponent={viewerComponent} />

                                    <RenderComponentTree seenUsedComponents={pageUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} activePageId={activePage.id} renderedComponentsObj={renderedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} viewerComponent={viewerComponent} />

                                    <RenderComponentTree seenUsedComponents={footerUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} activePageId={activePage.id} renderedComponentsObj={renderedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} viewerComponent={viewerComponent} />
                                </>
                            )}
                        </div>
                    )}

                    <div ref={spacerRef} className={styles.spacer}></div>
                </div>

                <div className={styles.sideBar} style={{ display: showingSideBar ? "" : "none" }}                >
                    <div className={styles.sideBarSettings} style={{ backgroundColor: dimSideBar ? "" : "rgb(var(--color3))" }}>
                        <div style={{ display: "grid", alignContent: "flex-start", }}>
                            <button className='secondaryButton'
                                onClick={() => {
                                    editOptionsSet(prev => !prev)
                                }}
                            >{editOptions ? "stop editing" : "edit"}</button>

                            <div style={{ display: editOptions ? "grid" : "none", position: "absolute", top: "100%", right: 0, backgroundColor: "rgb(var(--color3))", padding: "1rem", width: "min(500px, 90vw)" }}>
                                <ShowMore
                                    label='Edit Website'
                                    content={
                                        <AddEditWebsite sentWebsite={websiteObj} />
                                    }
                                />

                                {activePage !== undefined && (
                                    <ShowMore
                                        label='Edit Page'
                                        content={
                                            <AddEditPage key={activePageId} sentPage={activePage} sentWebsiteId={websiteObj.id} handleManagePage={handleManagePage} />
                                        }
                                    />
                                )}
                            </div>
                        </div>

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
                                {websiteObj.pages !== undefined && websiteObj.pages.map(eachPage => {
                                    //show each page name

                                    return (
                                        <button key={eachPage.id} className='mainButton' style={{ backgroundColor: activePage !== undefined && eachPage.id === activePage.id ? "rgb(var(--color1))" : "rgb(var(--shade1))" }}
                                            onClick={async () => {
                                                if (websiteObj.usedComponents === undefined) return

                                                //whenever page id changes hold off on showing results
                                                activePageIdSet(eachPage.id)

                                                //render components for new page
                                                const seenUsedComponents = await renderUsedComponentsInUse(websiteObj.usedComponents, eachPage.id)

                                                //add onto website obj
                                                websiteObjSet(prevWebsiteObj => {
                                                    const newWebsiteObj = { ...prevWebsiteObj }

                                                    newWebsiteObj.usedComponents = seenUsedComponents

                                                    return newWebsiteObj
                                                })
                                            }}
                                        >{eachPage.name}</button>
                                    )
                                })}

                                <button className='mainButton'
                                    onClick={() => {
                                        addingPageSet(prev => !prev)
                                    }}
                                >{addingPage ? "close" : "add page"}</button>

                                {activePage !== undefined && (
                                    <ConfirmationBox text='' confirmationText='are you sure you want to delete the page?' successMessage='page deleted!' float={true}
                                        icon={
                                            <svg style={{ fill: "rgb(var(--shade2))" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                                        }
                                        runAction={async () => {
                                            await deletePage(websiteObj.id, activePage.id)

                                            await refreshWebsitePath({ id: websiteObj.id })
                                        }}
                                    />
                                )}
                            </ul>

                            <AddEditPage style={{ display: addingPage ? "" : "none" }} sentWebsiteId={websiteObj.id} handleManagePage={handleManagePage}
                                submissionAction={() => {
                                    addingPageSet(false)
                                }}
                            />

                            <LocationSelector location={activeLocation} activeLocationSet={activeLocationSet} activePageId={activePageId} activeUsedComponent={activeUsedComponent} />

                            <ComponentSelector websiteId={websiteObj.id} handleManageUsedComponents={handleManageUsedComponents} location={activeLocation} />
                        </div>

                        <div style={{ display: "grid", gap: "1rem", alignContent: "flex-start", overflow: "auto", padding: "1rem" }}>
                            <ShowMore
                                label='Edit global styles'
                                content={
                                    <textarea rows={5} value={websiteObj.globalCss} className={styles.styleEditor}
                                        onChange={(e) => {
                                            const newWebsite = { ...websiteObj }
                                            newWebsite.globalCss = e.target.value

                                            handleWebsiteUpdate(newWebsite)
                                        }}
                                    />
                                }
                            />

                            {activeUsedComponent !== undefined && websiteObj.usedComponents !== undefined && (
                                <>
                                    <label>{activeUsedComponent.component?.categoryId ?? ""} component</label>

                                    <ShowMore
                                        label='Styling'

                                        content={
                                            <textarea rows={5} value={activeUsedComponent.css} className={styles.styleEditor}
                                                onChange={(e) => {
                                                    const newActiveComp: usedComponent = { ...activeUsedComponent }
                                                    newActiveComp.css = e.target.value

                                                    handleManageUsedComponents({ option: "update", seenUpdatedUsedComponent: newActiveComp })
                                                }}
                                            />
                                        }
                                    />

                                    <ShowMore
                                        label="edit data"
                                        content={
                                            <ComponentDataSwitch location={activeLocation} activeUsedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} handlePropsChange={handlePropsChange} />
                                        }
                                    />

                                    <ShowMore
                                        label='replace component'
                                        content={
                                            <>
                                                {viewerComponent === null ? (
                                                    <button className='mainButton'
                                                        onClick={() => {
                                                            viewerComponentSet({ usedComponentIdToSwap: activeUsedComponent.id, component: null, builtComponent: null })
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
                                                {viewerComponent !== null && viewerComponent.usedComponentIdToSwap === activeUsedComponent.id && (
                                                    <>
                                                        <ComponentSelector websiteId={websiteObj.id} handleManageUsedComponents={handleManageUsedComponents} viewerComponentSet={viewerComponentSet} location={activeUsedComponent.location} />

                                                        {viewerComponent.component !== null && (
                                                            <button className='mainButton'
                                                                onClick={async () => {
                                                                    try {
                                                                        //replace the used component with this selection

                                                                        //ensure the component info is there
                                                                        if (viewerComponent.component === null || activeUsedComponent.data === null) return

                                                                        console.log(`$got here`);

                                                                        //if usedComponents are the same type can reuse data
                                                                        const reusingUsedComponentData = activeUsedComponent.data.category === viewerComponent.component.categoryId

                                                                        //replace everything except id, pageid, compid, children
                                                                        const newReplacedUsedComponent = { ...activeUsedComponent, componentId: viewerComponent.component.id, css: viewerComponent.component.defaultCss, data: reusingUsedComponentData ? activeUsedComponent.data : viewerComponent.component.defaultData, }

                                                                        //send to update 
                                                                        handleManageUsedComponents({ option: "update", seenUpdatedUsedComponent: newReplacedUsedComponent, rebuild: true })

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
                                        }
                                    />

                                    <ShowMore
                                        label='order'
                                        content={
                                            <ComponentOrderSelector websiteId={websiteObj.id} usedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} />
                                        }
                                    />

                                    <ShowMore
                                        label='Delete Component'
                                        content={
                                            <ConfirmationBox text='delete' confirmationText='are you sure you want to delete' successMessage='deleted!' runAction={async () => {
                                                await deleteUsedComponent(websiteObj.id, activeUsedComponent.id)

                                                await refreshWebsitePath({ id: websiteObj.id })
                                            }} />
                                        }
                                    />
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
    seenUsedComponents, originalUsedComponentsList, websiteObj, activePageId, renderedComponentsObj, tempActiveUsedComponentId, viewerComponent
}: {
    seenUsedComponents: usedComponent[], originalUsedComponentsList: usedComponent[], websiteObj: website, activePageId: string, renderedComponentsObj: React.MutableRefObject<{ [key: string]: React.ComponentType<{ data: componentDataType; }> }>, tempActiveUsedComponentId: React.MutableRefObject<string>, viewerComponent: viewerComponentType | null
}) {

    return (
        <>
            {seenUsedComponents.map(eachUsedComponent => {
                let usingViewerComponent = false

                let SeenViewerComponent: React.ComponentType<{ data: componentDataType }> | null = null
                let seenViewerComponentData: componentDataType | null = null

                //assign new chosen component if using the viewer node
                if (viewerComponent !== null && viewerComponent.usedComponentIdToSwap === eachUsedComponent.id && viewerComponent.component !== null && viewerComponent.builtComponent !== null) {
                    usingViewerComponent = true
                    SeenViewerComponent = viewerComponent.builtComponent
                    seenViewerComponentData = viewerComponent.component.defaultData
                }

                const ComponentToRender = renderedComponentsObj.current[eachUsedComponent.componentId];
                if (ComponentToRender === undefined) {
                    console.error(
                        `Component with ID ${eachUsedComponent.componentId} is not in renderedComponentsObj.`,
                        renderedComponentsObj.current
                    );
                    return null;
                }

                //make sure component data is fetched
                if (eachUsedComponent.data === null) {
                    console.log(`No data in component`, eachUsedComponent);
                    return null;
                }

                let scopedCss = addScopeToCSS(eachUsedComponent.css, eachUsedComponent.id);

                const seenChildren: usedComponent[] = getChildrenUsedComponents(eachUsedComponent.id, originalUsedComponentsList)

                //order the children
                const seenOrderedChildren = sortUsedComponentsByIndex(seenChildren)

                // Recursively render child components
                const childJSX: React.JSX.Element | null = seenOrderedChildren.length > 0 ? <RenderComponentTree seenUsedComponents={seenOrderedChildren} originalUsedComponentsList={originalUsedComponentsList} websiteObj={websiteObj} activePageId={activePageId} renderedComponentsObj={renderedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} viewerComponent={viewerComponent} /> : null;

                //apply scoped styling starter value
                eachUsedComponent.data.styleId = `____${eachUsedComponent.id}`

                // If the component is a container, pass children as a prop
                //handle chuldren for different categories
                if (childJSX !== null) {
                    if (eachUsedComponent.data.category === "containers") {
                        eachUsedComponent.data.children = childJSX
                    }
                }

                //add mouse over listener for interaction
                //@ts-expect-error mouseOver
                eachUsedComponent.data.mainElProps.onMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                    e.stopPropagation()

                    tempActiveUsedComponentId.current = eachUsedComponent.id;

                    //highlight the element to show selection
                    const seenEl = e.currentTarget as HTMLElement;
                    seenEl.classList.add(styles.highlightComponent);

                    setTimeout(() => {
                        seenEl.classList.remove(styles.highlightComponent);
                    }, 1000);
                }

                //pass children to viewer component if valid
                if (seenViewerComponentData !== null) {
                    if (seenViewerComponentData.category === "containers") {

                        //check for the children attribute
                        seenViewerComponentData.children = childJSX
                    }

                    //ensure css on component data is local
                    if (viewerComponent !== null && viewerComponent.component !== null) {
                        scopedCss = addScopeToCSS(viewerComponent.component.defaultCss, eachUsedComponent.id);

                        seenViewerComponentData.styleId = `____${eachUsedComponent.id}`
                    }
                }

                return (
                    <React.Fragment key={eachUsedComponent.id}>
                        <style>{scopedCss}</style>

                        {usingViewerComponent ? (
                            <>
                                {SeenViewerComponent !== null && seenViewerComponentData !== null && (
                                    <SeenViewerComponent data={seenViewerComponentData} />
                                )}
                            </>
                        ) : (
                            <>
                                {/* Render the main component with injected props */}
                                <ComponentToRender data={eachUsedComponent.data} />
                            </>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    )
}