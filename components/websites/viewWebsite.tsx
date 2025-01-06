"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from "./style.module.css"
import { addScopeToCSS } from '@/utility/css'
import { categoryName, componentDataType, pagesToComponent, pagesToComponentsSchema, sizeOptionType, website, websiteSchema } from '@/types'
import { deepClone } from '@/utility/utility'
import AddPage from '../pages/addPage'
import SelectComponent from '../components/selectComponent'
import globalDynamicComponents from '@/utility/globalComponents'
import { updateComponentInPage } from '@/serverFunctions/handlePagesToComponents'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { updateWebsite } from '@/serverFunctions/handleWebsites'
import ComponentDataSwitch from '../components/componentData/ComponentDataSwitch'

export default function ViewWebsite({ websiteFromServer }: { websiteFromServer: website }) {
    const [showingSideBar, showingSideBarSet] = useState(true)
    const [dimSideBar, dimSideBarSet] = useState(false)

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
    const middleBarContentContRef = useRef<HTMLDivElement | null>(null)

    const [websiteObj, websiteObjSet] = useState<website>(websiteFromServer)

    const [activePageIndex, activePageIndexSet] = useState<number>(0)
    const [addingPage, addingPageSet] = useState(false)
    const [editingGlobalStyle, editingGlobalStyleSet] = useState(false)
    const [buildComponentCheck, buildComponentCheckSet] = useState(false)

    const [activePagesToComponentId, activePagesToComponentIdSet] = useState<pagesToComponent["id"]>("")
    const activePagesToComponent = useMemo<pagesToComponent | undefined>(() => {
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

    // respond to server changes 
    useEffect(() => {
        const runAction = async () => {
            try {
                const builtWebsite = await buildComponentsOnPage(websiteFromServer)

                websiteObjSet(builtWebsite)

                buildComponentCheckSet(true)

            } catch (error) {
                console.log(`$error`, error);
            }
        }

        runAction()
    }, [websiteFromServer])

    //save website to server on pagesToComponents change
    useEffect(() => {
        console.log(`$changing pagesToComponents on server useeffect`);

        if (updatePagesToComponentDebounce.current) clearTimeout(updatePagesToComponentDebounce.current)

        updatePagesToComponentDebounce.current = setTimeout(async () => {
            if (websiteObj.pages === undefined) return
            if (websiteObj.pages[activePageIndex] === undefined) return
            if (websiteObj.pages[activePageIndex].pagesToComponents === undefined) return

            websiteObj.pages[activePageIndex].pagesToComponents.forEach((eachPageToComponent, eachPageToComponentIndex) => {
                handleUpdateComponentInPage({ ...eachPageToComponent, indexOnPage: eachPageToComponentIndex })
            })
        }, 3000)

    }, [websiteObj.pages?.[activePageIndex]?.pagesToComponents])

    //save website to server on change
    useEffect(() => {
        handleWebsiteUpdate({ ...websiteObj })

        console.log(`$changing websiteobj on server useeffect`);

    }, [websiteObj])

    //calculate fit on device size change
    useEffect(() => {
        if (middleBarContentContRef.current === null || activeSizeOption === undefined) return

        const widthDiff = middleBarContentContRef.current.clientWidth / activeSizeOption.width
        const heightDiff = middleBarContentContRef.current.clientHeight / activeSizeOption.height

        const newScale = widthDiff < heightDiff ? widthDiff : heightDiff

        canvasScaleSet(newScale)

    }, [activeSizeOption, middleBarContentContRef])

    //center canvasView
    useEffect(() => {
        centerCanvas()
    }, [activeSizeOption, fit])

    function centerCanvas() {
        if (middleBarContentContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        middleBarContentContRef.current.scrollLeft = (middleBarContentContRef.current.scrollWidth / 2) - (middleBarContentContRef.current.clientWidth / 2)
        middleBarContentContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? middleBarContentContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    async function buildComponentsOnPage(sentWebsite: website): Promise<website> {
        buildComponentCheckSet(false)

        if (sentWebsite.pages === undefined) throw new Error("pages undefined")

        if (sentWebsite.pages[activePageIndex] === undefined) throw new Error("page not in index")

        if (sentWebsite.pages[activePageIndex].pagesToComponents === undefined) throw new Error("pagesToComponents undefined")

        const newRenderedComponentsObj: {
            [key: string]: React.ComponentType<{
                data: componentDataType;
            }>
        } = {}

        //sort by index
        sentWebsite.pages[activePageIndex].pagesToComponents =
            sentWebsite.pages[activePageIndex].pagesToComponents.sort(
                (a, b) => a.indexOnPage - b.indexOnPage
            );

        //on this active page wait to build all components
        sentWebsite.pages[activePageIndex].pagesToComponents = await Promise.all(
            sentWebsite.pages[activePageIndex].pagesToComponents.map(async eachPageToComponent => {
                if (eachPageToComponent.component === undefined || eachPageToComponent.component.category === undefined) throw new Error("need component and category")

                //assign default props onto component in page if nothing there
                if (eachPageToComponent.data === null) {
                    eachPageToComponent.data = getStarterComponentProps(eachPageToComponent.component.category.name)

                    console.log(`$ran props`);
                    console.log(`$ eachPageToComponent.data`, eachPageToComponent.data);
                }

                const seenResponse = await globalDynamicComponents(eachPageToComponent.component.id)

                //assign builds to page
                if (seenResponse !== undefined) {
                    newRenderedComponentsObj[eachPageToComponent.component.id] = seenResponse()

                } else {
                    console.log(`$woops element component id not found`, eachPageToComponent.component.id);
                }

                return eachPageToComponent
            }))

        renderedComponentsObj.current = newRenderedComponentsObj

        return deepClone(sentWebsite)
    }

    function getStarterComponentProps(categoryName: categoryName): componentDataType {
        const defaultProps: { [key in categoryName]: componentDataType } = {
            navbars: {
                category: "navbars",
                menu: [
                    {
                        label: "menu item 1",
                        link: "/",
                        subMenu: [
                            {
                                label: "sub menu item 1",
                                link: "/",
                            }
                        ]
                    },
                    {
                        label: "menu item 2",
                        link: "/",
                    },
                ]
            },
            heros: {
                category: "heros"
            },
            containers: {
                category: "containers",
                children: [
                    <div key={0} style={{ backgroundColor: "green" }}>sup there this is children text up</div>
                ]
            },
        }

        if (defaultProps[categoryName] === undefined) throw new Error("no seeing props for category name")

        return defaultProps[categoryName]
    }

    async function handleUpdateComponentInPage(updateObj: Partial<pagesToComponent>) {
        try {
            await updateComponentInPage({ ...updateObj })

            console.log(`$saved pagesToComponent to db`);

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    async function handleWebsiteUpdate(updateObj: Partial<website>) {
        if (updateWebsiteDebounce.current) clearTimeout(updateWebsiteDebounce.current)

        updateWebsiteDebounce.current = setTimeout(async () => {
            try {
                websiteSchema.partial().parse(updateObj)

                await updateWebsite({ ...updateObj })

                console.log(`$saved website to db`);

            } catch (error) {
                consoleAndToastError(error)
            }
        }, 3000);
    }

    function handlePropsChange(newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) {

        websiteObjSet(prevWebsite => {
            const newWebsite = { ...prevWebsite }
            if (newWebsite.pages === undefined) return prevWebsite
            if (newWebsite.pages[activePageIndex] === undefined) return prevWebsite
            if (newWebsite.pages[activePageIndex].pagesToComponents === undefined) return prevWebsite

            newWebsite.pages[activePageIndex].pagesToComponents = newWebsite.pages[activePageIndex].pagesToComponents.map(eachPageToComponent => {
                if (eachPageToComponent.id === seenComponentInPage.id && seenComponentInPage.data !== null && seenComponentInPage.data.category === newPropsObj.category) {//ensure data is for correct component category
                    eachPageToComponent.data = newPropsObj
                }

                return eachPageToComponent
            })

            return newWebsite
        })
    }

    // function RenderComponentTree({ componentOnPage }: { componentOnPage: pagesToComponent, }) {
    //     // Get the React component from the `renderedComponentsObj` using the current component's ID.
    //     const ComponentToRender = renderedComponentsObj.current[componentOnPage.componentId];

    //     if (ComponentToRender === undefined) {
    //         console.error(
    //             `Component with ID ${componentOnPage.componentId} is not in renderedComponentsObj.`
    //             , renderedComponentsObj.current);
    //         return null;
    //     }

    //     if (componentOnPage.data === null) {
    //         console.log(`$no data in component`, componentOnPage);
    //         return null
    //     }

    //     const scopedClass = `canvas-${componentOnPage.id}`;
    //     const scopedCss = addScopeToCSS(componentOnPage.css, scopedClass)

    //     let newJSX: React.JSX.Element | null = null

    //     const compPageData = componentOnPage.data

    //     //handle recursion
    //     if (componentOnPage.children.length > 0) {
    //         componentOnPage.children.map((childComponentOnPage) => {
    //             if (websiteObj.pages === undefined) return null

    //             if (websiteObj.pages[activePageIndex] === undefined) return null

    //             if (websiteObj.pages[activePageIndex].pagesToComponents === undefined) return null

    //             const foundPagesToComponent = websiteObj.pages[activePageIndex].pagesToComponents.find(eachPageToComponentFind => eachPageToComponentFind.id === childComponentOnPage.pagesToComponentsId)
    //             if (foundPagesToComponent === undefined) {
    //                 console.log(`$woops didn't find the id`, childComponentOnPage.pagesToComponentsId);
    //                 return null
    //             }

    //             newJSX = (
    //                 <>
    //                     {newJSX}

    //                     <RenderComponentTree componentOnPage={foundPagesToComponent} />
    //                 </>
    //             )
    //         })

    //         if (newJSX !== null) {
    //             if (compPageData.category === "containers") {
    //                 compPageData.children = newJSX
    //             }
    //         }
    //     }

    //     return (
    //         <div className={`${scopedClass}`}
    //             onMouseEnter={(e) => {
    //                 activePagesToComponentIdSet(componentOnPage.id)

    //                 const seenEl = e.currentTarget as HTMLElement

    //                 seenEl.classList.add(styles.highlightComponent)

    //                 setTimeout(() => {
    //                     seenEl.classList.remove(styles.highlightComponent)
    //                 }, 1000);
    //             }}
    //         >
    //             <style>{scopedCss}</style>

    //             {/* Render the main component */}
    //             <ComponentToRender data={componentOnPage.data} />
    //         </div>
    //     );

    // }

    function RenderComponentTree({ componentOnPage }: { componentOnPage: pagesToComponent }) {
        const ComponentToRender = renderedComponentsObj.current[componentOnPage.componentId];

        if (ComponentToRender === undefined) {
            console.error(
                `Component with ID ${componentOnPage.componentId} is not in renderedComponentsObj.`,
                renderedComponentsObj.current
            );
            return null;
        }

        if (componentOnPage.data === null) {
            console.log(`No data in component`, componentOnPage);
            return null;
        }

        const scopedClass = `canvas-${componentOnPage.id}`;
        const scopedCss = addScopeToCSS(componentOnPage.css, scopedClass);

        // Recursively render child components
        const childJSX = componentOnPage.children.map((childComponentOnPage) => {
            if (!websiteObj.pages?.[activePageIndex]?.pagesToComponents) return null;

            const foundPagesToComponent = websiteObj.pages[activePageIndex].pagesToComponents.find(
                (eachPageToComponent) => eachPageToComponent.id === childComponentOnPage.pagesToComponentsId
            );

            if (!foundPagesToComponent) {
                console.log(`Couldn't find component with ID`, childComponentOnPage.pagesToComponentsId);
                return null;
            }

            return <RenderComponentTree key={foundPagesToComponent.id} componentOnPage={foundPagesToComponent} />;
        }).filter(each => each !== null);

        // If the component is a container, pass children as a prop
        const componentProps = componentOnPage.data
        console.log(`$componentOnPage.data`, componentOnPage.data);

        if (childJSX.length > 0) {
            if (componentProps.category === "containers") {
                componentProps.children = childJSX
            }

        }

        return (
            <div
                className={`${scopedClass}`}
                onMouseEnter={(e) => {
                    activePagesToComponentIdSet(componentOnPage.id);

                    const seenEl = e.currentTarget as HTMLElement;
                    seenEl.classList.add(styles.highlightComponent);

                    setTimeout(() => {
                        seenEl.classList.remove(styles.highlightComponent);
                    }, 1000);
                }}
            >
                <style>{scopedCss}</style>

                {/* Render the main component with injected props */}
                <ComponentToRender data={componentProps} />
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.middleBar}>
                <div className={styles.middleBarSettingsCont}>
                    <div className={styles.sizeOptions}>
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
                </div>

                <div ref={middleBarContentContRef} className={styles.middleBarContentCont}>
                    {activeSizeOption !== undefined && (
                        <div ref={canvasRef} className={styles.canvas} style={{ width: fit ? middleBarContentContRef.current?.clientWidth : activeSizeOption.width, height: fit ? middleBarContentContRef.current?.clientHeight : activeSizeOption.height, scale: fit ? 1 : canvasScale }}>
                            {websiteObj.pages !== undefined && websiteObj.pages[activePageIndex] !== undefined && websiteObj.pages[activePageIndex].pagesToComponents !== undefined && buildComponentCheck && (
                                <>
                                    <style>{addScopeToCSS(websiteObj.globalCss, styles.canvas)}</style>

                                    {websiteObj.pages[activePageIndex].pagesToComponents.map(eachPageToComponent => {
                                        return (
                                            <RenderComponentTree key={eachPageToComponent.id} componentOnPage={eachPageToComponent} />
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    )}

                    <div ref={spacerRef} className={styles.spacer}></div>
                </div>
            </div>

            <div className={styles.sideBar} style={{ display: showingSideBar ? "" : "none" }}>
                <div style={{ display: "grid", alignContent: "flex-start", overflow: "auto" }}>
                    <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
                        <button className='secondaryButton'
                            onClick={() => {
                                showingSideBarSet(false)
                            }}
                        >close</button>

                        <button className='secondaryButton'
                            onClick={() => {
                                dimSideBarSet(prev => !prev)
                            }}
                        >{dimSideBar ? "full" : "dim"}</button>
                    </div>

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
                        </ul>
                    )}

                    <button className='mainButton'
                        onClick={() => {
                            addingPageSet(prev => !prev)
                        }}
                    >{addingPage ? "close" : "add page"}</button>

                    <div style={{ display: addingPage ? "" : "none" }}>
                        <AddPage websiteIdObj={{ id: websiteObj.id }} />
                    </div>

                    {activePageIndex !== null && websiteObj.pages !== undefined && websiteObj.pages[activePageIndex] !== undefined && websiteObj.pages[activePageIndex].pagesToComponents !== undefined && (
                        <SelectComponent pageIdObj={{ id: websiteObj.pages[activePageIndex].id }} websiteIdObj={{ id: websiteObj.id }} currentIndex={websiteObj.pages[activePageIndex].pagesToComponents.length} />
                    )}
                </div>

                <div style={{ display: "grid", alignContent: "flex-start", overflow: "auto" }}>
                    <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                        onClick={() => { editingGlobalStyleSet(prev => !prev) }}
                    >{editingGlobalStyle ? "close" : "open"} global styles</button>

                    {editingGlobalStyle && (
                        <>
                            <p>global styles</p>

                            <textarea rows={5} value={websiteObj.globalCss} className={styles.styleEditor}
                                onChange={(e) => {
                                    websiteObjSet(prevWebsite => {
                                        const newWebsite = { ...prevWebsite }

                                        newWebsite.globalCss = e.target.value

                                        return newWebsite
                                    })
                                }}
                            />
                        </>
                    )}

                    {activePagesToComponent !== undefined && (
                        <>
                            <p>styling</p>
                            <textarea rows={5} value={activePagesToComponent.css} className={styles.styleEditor}
                                onChange={(e) => {
                                    websiteObjSet(prevWebsite => {
                                        const newWebsite = { ...prevWebsite }
                                        if (newWebsite.pages === undefined) return prevWebsite
                                        if (newWebsite.pages[activePageIndex] === undefined) return prevWebsite
                                        if (newWebsite.pages[activePageIndex].pagesToComponents === undefined) return prevWebsite

                                        newWebsite.pages[activePageIndex].pagesToComponents = newWebsite.pages[activePageIndex].pagesToComponents.map(eachPageToComponent => {
                                            if (eachPageToComponent.id === activePagesToComponent.id) {
                                                eachPageToComponent.css = e.target.value
                                            }

                                            return eachPageToComponent
                                        })

                                        return newWebsite
                                    })
                                }}
                            />

                            <p>props</p>
                            <ComponentDataSwitch activePagesToComponent={activePagesToComponent} handlePropsChange={handlePropsChange} />
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}

