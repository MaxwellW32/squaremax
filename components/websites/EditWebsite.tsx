"use client"
import { deletePage, getSpecificPage, updateThePage } from '@/serverFunctions/handlePages'
import { deleteUsedComponent, getSpecificUsedComponent, updateTheUsedComponent } from '@/serverFunctions/handleUsedComponents'
import { getSpecificWebsite, refreshWebsitePath, updateTheWebsite } from '@/serverFunctions/handleWebsites'
import { handleManagePageOptions, handleManageUpdateUsedComponentsOptions, page, previewTemplateType, sizeOptionsArr, sizeOptionType, updatePageSchema, updateUsedComponent, updateUsedComponentSchema, updateWebsite, updateWebsiteSchema, usedComponent, usedComponentLocationType, viewerTemplateType, website, webSocketMessageJoinSchema, webSocketMessageJoinType, webSocketMessagePingType, webSocketStandardMessageSchema, webSocketStandardMessageType, } from '@/types'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast'
import globalDynamicTemplates from '@/utility/globalTemplates'
import { addScopeToCSS, controlNavView, formatCSS, getChildrenUsedComponents, getDescendedUsedComponents, makeValidVariableName, sanitizeUsedComponentData, scaleToFit, sortUsedComponentsByOrder, } from '@/utility/utility'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmationBox from '../confirmationBox/ConfirmationBox'
import AddEditPage from '../pages/AddEditPage'
import ShowMore from '../showMore/ShowMore'
import TemplateDataSwitch from '../templates/templateData/TemplateDataSwitch'
import TemplateSelector from '../templates/TemplateSelector'
import UsedComponentLocationSelector from '../usedComponents/usedComponentLocationSelector/UsedComponentLocationSelector'
import UsedComponentOrderSelector from '../usedComponents/usedComponentOrderSelector/UsedComponentOrderSelector'
import styles from "./style.module.css"
import { Session } from 'next-auth'
import DownloadOptions from '../downloadOptions/DownloadOptions'
import RecursiveForm from '../recursiveForm/RecursiveForm'
import useEditingContent from './UseEditingContent'
import Draggable from 'react-draggable';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { templateDataType } from '@/types/templateDataTypes'

export default function EditWebsite({ websiteFromServer, seenSession }: { websiteFromServer: website, seenSession: Session }) {
    const { editingContent, setEditing } = useEditingContent()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [showingSideBar, showingSideBarSet] = useState(false)
    const [dimSideBar, dimSideBarSet] = useState<boolean>(false)
    const [viewingDownloadOptions, viewingDownloadOptionsSet] = useState(false)

    const [sizeOptions, sizeOptionsSet] = useState<sizeOptionType[]>(sizeOptionsArr)
    const activeSizeOption = useMemo(() => {
        return sizeOptions.find(eachSizeOption => eachSizeOption.active)
    }, [sizeOptions])

    const [canvasScale, canvasScaleSet] = useState(1)
    const [fit, fitSet] = useState(true)

    const spacerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const canvasContRef = useRef<HTMLDivElement | null>(null)
    const draggableRef = useRef<HTMLDivElement | null>(null)

    const [websiteObj, websiteObjSet] = useState<website>(websiteFromServer)

    const [activePageId, activePageIdSet] = useState<page["id"] | undefined>(websiteObj.pages !== undefined && websiteObj.pages.length > 0 ? websiteObj.pages[0].id : undefined)
    const activePage = useMemo<page | undefined>(() => {
        if (websiteObj.pages === undefined || activePageId === undefined) return undefined

        const foundPage = websiteObj.pages.find(eachPageFind => eachPageFind.id === activePageId)
        if (foundPage === undefined) return undefined

        return foundPage
    }, [websiteObj.pages, activePageId])

    const [activeLocation, activeLocationSet] = useState<usedComponentLocationType>(activePage === undefined ? { type: "header" } : { type: "page", pageId: activePage.id })

    const [addingPage, addingPageSet] = useState(false)
    const [usedComponentsBuilt, usedComponentsBuiltSet] = useState(false)

    const tempActiveUsedComponentId = useRef<usedComponent["id"]>("")
    const [activeUsedComponentId, activeUsedComponentIdSet] = useState<usedComponent["id"]>("")
    const [selectionOption, selectionOptionSet] = useState<"website" | "page" | "component" | undefined>()

    const activeUsedComponent = useMemo<usedComponent | undefined>(() => {
        if (websiteObj.usedComponents === undefined) return undefined

        const foundUsedComponent = websiteObj.usedComponents.find(eachUsedComponentFind => eachUsedComponentFind.id === activeUsedComponentId)
        return foundUsedComponent

    }, [websiteObj.usedComponents, activeUsedComponentId])

    const renderedUsedComponentsObj = useRef<{
        [key: string]: React.ComponentType<{
            data: templateDataType;
        }>
    }>({})

    const updateWebsiteDebounce = useRef<NodeJS.Timeout>()
    const updatePageDebounce = useRef<{ [key: string]: NodeJS.Timeout }>({})
    const updateUsedComponentDebounce = useRef<{ [key: string]: NodeJS.Timeout }>({})

    const [saveState, saveStateSet] = useState<"saving" | "saved">("saved")
    const [viewerTemplate, viewerTemplateSet] = useState<viewerTemplateType | null>(null)
    const [previewTemplate, previewTemplateSet] = useState<previewTemplateType | null>(null)
    const wsRef = useRef<WebSocket | null>(null);
    const [, webSocketsConnectedSet] = useState(false)

    //get usedComponents on the active page
    const pageUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined || activePage === undefined) return []

        const usedComponentsInPage = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "page" && eachUsedComponentFilter.location.pageId === activePage.id
        })

        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInPage)
        return sortedUsedComponents

    }, [websiteObj.usedComponents, activePage])

    const headerUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined) return []

        const usedComponentsInHeader = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "header"
        })
        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInHeader)
        return sortedUsedComponents

    }, [websiteObj.usedComponents])

    const footerUsedComponents = useMemo(() => {
        if (websiteObj.usedComponents === undefined) return []

        const usedComponentsInFooter = websiteObj.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "footer"
        })
        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInFooter)
        return sortedUsedComponents

    }, [websiteObj.usedComponents])

    // respond to changes from server - build usedComponents seen there
    useEffect(() => {
        const start = async () => {
            try {
                //replace original
                if (websiteFromServer.usedComponents !== undefined) {
                    websiteFromServer.usedComponents = await renderUsedComponentsInUse(websiteFromServer.usedComponents, activePage !== undefined ? activePage.id : undefined)

                    //run check for any broken used components - remove them
                    ////used component is broken if pageId doesnt exist in pages and if parentId not in other used components
                    const brokenUsedComponents = websiteFromServer.usedComponents.filter(eachUsedComponent => {
                        const seenLocation = eachUsedComponent.location

                        //make sure the page it belongs to exits
                        if (seenLocation.type === "page") {
                            if (websiteFromServer.pages === undefined) return false

                            return websiteFromServer.pages.find(eachPage => eachPage.id === seenLocation.pageId) === undefined

                            //make sure its parent used component exists
                        } else if (seenLocation.type === "child") {
                            if (websiteFromServer.usedComponents === undefined) return false

                            return websiteFromServer.usedComponents.find(eachUsedComponentFind => eachUsedComponentFind.id === seenLocation.parentId) === undefined
                        }

                        return false
                    })

                    if (brokenUsedComponents.length > 0) {
                        //delete on server
                        Promise.all(brokenUsedComponents.map(async eachBrokenUsedComponent => {
                            return await deleteUsedComponent(eachBrokenUsedComponent.websiteId, eachBrokenUsedComponent.id)

                        })).then(() => {
                            console.log(`$deleted broken usedComponents`)

                            refreshWebsitePath({ id: websiteFromServer.id })
                        })
                    }
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

        const newScale = scaleToFit(canvasContRef.current.clientWidth, canvasContRef.current.clientHeight, activeSizeOption.width, activeSizeOption.height)

        canvasScaleSet(newScale)

    }, [activeSizeOption])

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

    //load up fonts dynamically
    useEffect(() => {
        const linkElements = websiteObj.fonts.map(eachFont => {
            const link = document.createElement('link')

            //replace underscores with + for google fonts api
            const fontImportNameForApi = eachFont.importName.replace(/ /g, '+')

            link.rel = 'stylesheet'
            link.href = `https://fonts.googleapis.com/css?family=${fontImportNameForApi}&subset=${eachFont.subsets.join(", ")}`

            document.head.appendChild(link);
            const camelCaseName = makeValidVariableName(eachFont.importName)

            link.onload = () => {
                // Set the font family as a CSS variable
                document.documentElement.style.setProperty(`--font-${camelCaseName}`, `${eachFont.importName}`);
                // href="https://fonts.googleapis.com/css?family=Tangerine">
            };

            return link
        })

        return () => {
            linkElements.map(eachLinkEl => {
                document.head.removeChild(eachLinkEl);
            })
        };
    }, [websiteObj.fonts])

    //handle websockets
    useEffect(() => {
        if (websiteObj.authorisedUsers.length < 1) return

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            webSocketsConnectedSet(true);
            console.log(`$ws connected`);

            const newJoinMessage: webSocketMessageJoinType = {
                type: "join",
                websiteId: websiteObj.id
            }

            webSocketMessageJoinSchema.parse(newJoinMessage)

            //send request to join a website id room
            ws.send(JSON.stringify(newJoinMessage));
        };

        ws.onclose = () => {
            webSocketsConnectedSet(false);
        };

        ws.onmessage = (event) => {
            const seenMessage = webSocketStandardMessageSchema.parse(JSON.parse(event.data.toString()))

            if (seenMessage.type === "standard") {
                const seenMessageObj = seenMessage.data.updated

                if (seenMessageObj.type === "website") {
                    const searchWebsite = async () => {
                        const latestWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteObj.id } }, true)
                        if (latestWebsite === undefined) return

                        //set latest
                        websiteObjSet((prevWebsiteObj) => {
                            const newWebsiteObj = { ...prevWebsiteObj, ...latestWebsite }

                            return newWebsiteObj
                        })
                    }
                    searchWebsite()

                } else if (seenMessageObj.type === "page") {
                    //get latest page
                    const searchPage = async () => {
                        if (seenMessageObj.refresh) {
                            const checkIfEditing = async () => {
                                //reload all 
                                if (!editingContent.current.pages) {
                                    refreshWebsitePath({ id: websiteObj.id })

                                } else {
                                    console.log(`$update happened while you were editing will wait until finished to update pages`);

                                    // editing check back later
                                    setTimeout(() => {
                                        checkIfEditing()
                                    }, 10_000);
                                }
                            }
                            checkIfEditing()

                        } else {
                            //add/update specific page
                            const latestPage = await getSpecificPage(seenMessageObj.pageId)
                            if (latestPage === undefined) return

                            //set latest
                            websiteObjSet((prevWebsiteObj) => {
                                const newWebsiteObj = { ...prevWebsiteObj }
                                if (newWebsiteObj.pages === undefined) return prevWebsiteObj

                                const pageFoundInArray = newWebsiteObj.pages.find(eachPageFind => eachPageFind.id === latestPage.id) !== undefined

                                if (pageFoundInArray) {
                                    //update
                                    newWebsiteObj.pages = newWebsiteObj.pages.map(eachPage => {
                                        if (eachPage.id === latestPage.id) {
                                            return latestPage
                                        }

                                        return eachPage
                                    })

                                } else {
                                    //add
                                    newWebsiteObj.pages = [...newWebsiteObj.pages, latestPage]
                                }

                                return newWebsiteObj
                            })
                        }

                    }
                    searchPage()

                } else if (seenMessageObj.type === "usedComponent") {
                    //get latest usedComponent
                    const searchUsedComponent = async () => {
                        if (seenMessageObj.refresh) {
                            const checkIfEditing = async () => {
                                //reload all 
                                if (!editingContent.current.usedComponents) {
                                    refreshWebsitePath({ id: websiteObj.id })

                                } else {
                                    // editing check back later
                                    console.log(`$update happened while you were editing will wait until finished to update usedComponents`);

                                    setTimeout(() => {
                                        checkIfEditing()
                                    }, 10_000);
                                }
                            }
                            checkIfEditing()

                        } else {
                            //add/update specific usedComponent
                            const latestUsedComponent = await getSpecificUsedComponent(seenMessageObj.usedComponentId)
                            if (latestUsedComponent === undefined) return

                            //ensure can be rendered
                            await buildUsedComponents([latestUsedComponent])

                            //set latest
                            websiteObjSet((prevWebsiteObj) => {
                                const newWebsiteObj = { ...prevWebsiteObj }
                                if (newWebsiteObj.usedComponents === undefined) return prevWebsiteObj

                                const usedComponentFoundInArray = newWebsiteObj.usedComponents.find(eachUsedComponentFind => eachUsedComponentFind.id === latestUsedComponent.id) !== undefined

                                if (usedComponentFoundInArray) {
                                    //update
                                    newWebsiteObj.usedComponents = newWebsiteObj.usedComponents.map(eachUsedComponent => {
                                        if (eachUsedComponent.id === latestUsedComponent.id) {
                                            return latestUsedComponent
                                        }

                                        return eachUsedComponent
                                    })

                                } else {
                                    //add
                                    newWebsiteObj.usedComponents = [...newWebsiteObj.usedComponents, latestUsedComponent]
                                }

                                return newWebsiteObj
                            })
                        }

                    }
                    searchUsedComponent()
                }
            };
        }

        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const newPingMessage: webSocketMessagePingType = {
                    type: "ping"
                }

                //keep connection alive
                ws.send(JSON.stringify(newPingMessage));
                console.log(`$sent ping`);
            }
        }, 29000);

        return () => {
            clearInterval(pingInterval);

            if (wsRef.current !== null) {
                wsRef.current.close();
            }
        };
    }, [websiteObj.authorisedUsers.length])

    //write latest page to url
    useEffect(() => {
        if (activePage === undefined) return

        changeUrl({ "page": activePage.link }, searchParams)
    }, [activePage])

    //load up page selection on page load
    useEffect(() => {
        if (websiteObj.pages === undefined) return

        const seenPageName = searchParams.get("page")
        if (seenPageName === null) return

        const seenPage = websiteObj.pages.find(eachPage => eachPage.link === seenPageName)
        if (seenPage === undefined) return

        activePageIdSet(seenPage.id)
    }, [])

    function centerCanvas() {
        if (canvasContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        canvasContRef.current.scrollLeft = (canvasContRef.current.scrollWidth / 2) - (canvasContRef.current.clientWidth / 2)
        canvasContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? canvasContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    async function buildUsedComponents(sentUsedComponents: usedComponent[]) {
        usedComponentsBuiltSet(false)

        //ensure all can be rendered
        await Promise.all(
            sentUsedComponents.map(async eachUsedComponent => {
                //if doesnt exist in renderObj then render it
                if (renderedUsedComponentsObj.current[eachUsedComponent.templateId] === undefined) {
                    const seenResponse = await globalDynamicTemplates(eachUsedComponent.templateId)

                    //assign builds to renderObj
                    if (seenResponse !== undefined) {
                        renderedUsedComponentsObj.current[eachUsedComponent.templateId] = seenResponse()

                    } else {
                        //log component id not found
                        console.log(`$usedComponent template id not found`, eachUsedComponent.templateId);
                    }
                }

                return eachUsedComponent
            }))

        usedComponentsBuiltSet(true)
    }

    async function handleWebsiteUpdate(newWebsite: website) {
        //set is editing
        setEditing("website")

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

                //update websocket
                sendWebsocketUpdate({
                    type: "website"
                })
            }, 3000);

        } catch (error) {
            consoleAndToastError(error)
        }
    }
    async function handleManagePage(options: handleManagePageOptions) {
        //set is editing
        setEditing("pages")

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

                    if (newWebsite.pages.length === 1) {
                        activePageIdSet(options.seenAddedPage.id)
                    }

                    return newWebsite
                })

                //update websocket
                sendWebsocketUpdate({
                    type: "page",
                    pageId: options.seenAddedPage.id,
                    refresh: false
                })

            } else if (options.option === "update") {
                //update locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }

                    //ensure pages seen
                    if (newWebsite.pages === undefined) return prevWebsite

                    //update the page
                    newWebsite.pages = newWebsite.pages.map(eachPage => {
                        if (eachPage.id === options.updatedPageId) {
                            return { ...eachPage, ...options.seenUpdatedPage }
                        }

                        return eachPage
                    })

                    return newWebsite
                })

                //update on server after delay
                if (updatePageDebounce.current[options.updatedPageId]) clearTimeout(updatePageDebounce.current[options.updatedPageId])

                //make new website schema
                updatePageDebounce.current[options.updatedPageId] = setTimeout(async () => {
                    //ensure only certain fields can be updated
                    const validatedUpdatedPage = updatePageSchema.parse(options.seenUpdatedPage)

                    saveStateSet("saving")
                    await updateThePage(options.updatedPageId, websiteObj.id, validatedUpdatedPage)

                    console.log(`$saved page to db`);
                    saveStateSet("saved")

                    //update websocket
                    sendWebsocketUpdate({
                        type: "page",
                        pageId: options.updatedPageId,
                        refresh: false
                    })
                }, 3000);
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }
    async function handleManageUsedComponents(options: handleManageUpdateUsedComponentsOptions) {
        try {
            //set is editing
            setEditing("usedComponents")

            if (options.option === "create") {
                //ensure can be rendered
                await buildUsedComponents([options.seenAddedUsedComponent])

                //add locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }
                    if (newWebsite.usedComponents === undefined) return prevWebsite

                    newWebsite.usedComponents = [...newWebsite.usedComponents, options.seenAddedUsedComponent]

                    return newWebsite
                })

                //update websocket
                sendWebsocketUpdate({
                    type: "usedComponent",
                    usedComponentId: options.seenAddedUsedComponent.id,
                    refresh: false
                })

            } else if (options.option === "update") {
                if (websiteObj.usedComponents === undefined) return

                const foundUsedComponent = websiteObj.usedComponents.find(eachUsedComponentFind => eachUsedComponentFind.id === options.updatedUsedComponentId)
                if (foundUsedComponent === undefined) return

                const updatedUsedComponent: usedComponent = { ...foundUsedComponent, ...options.seenUpdatedUsedComponent }

                if (options.rebuild) {
                    //ensure can be rendered
                    await buildUsedComponents([updatedUsedComponent])
                }

                //update locally
                websiteObjSet(prevWebsite => {
                    const newWebsite = { ...prevWebsite }
                    if (newWebsite.usedComponents === undefined) return prevWebsite

                    newWebsite.usedComponents = newWebsite.usedComponents.map(eachUsedComponent => {
                        if (eachUsedComponent.id === options.updatedUsedComponentId) {
                            return updatedUsedComponent
                        }

                        return eachUsedComponent
                    })

                    return newWebsite
                })

                //update on server after delay
                if (updateUsedComponentDebounce.current[updatedUsedComponent.id]) clearTimeout(updateUsedComponentDebounce.current[updatedUsedComponent.id])

                //make new website schema
                updateUsedComponentDebounce.current[updatedUsedComponent.id] = setTimeout(async () => {
                    //ensure only certain fields can be updated
                    const sanitizedUpdateComponent = sanitizeUsedComponentData(updatedUsedComponent)

                    const validatedUpdatedUsedComponent = updateUsedComponentSchema.parse(sanitizedUpdateComponent)

                    saveStateSet("saving")
                    await updateTheUsedComponent(updatedUsedComponent.websiteId, updatedUsedComponent.id, validatedUpdatedUsedComponent)

                    console.log(`$saved usedComponent to db`);
                    saveStateSet("saved")

                    //update websocket
                    sendWebsocketUpdate({
                        type: "usedComponent",
                        usedComponentId: updatedUsedComponent.id,
                        refresh: false
                    })
                }, 3000);
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    function handlePropsChange(newPropsObj: templateDataType, sentUsedComponent: usedComponent) {
        //update the data
        sentUsedComponent.data = newPropsObj

        handleManageUsedComponents({ option: "update", updatedUsedComponentId: sentUsedComponent.id, seenUpdatedUsedComponent: sentUsedComponent })
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

        //on first click only show side bar
        if (activeUsedComponentId === "") {
            showingSideBarSet(true)
        }

        activeUsedComponentIdSet(tempActiveUsedComponentId.current)

        selectionOptionSet("component")
    }

    async function renderUsedComponentsInUse(seenUsedComponents: usedComponent[], seenActivePageId?: page["id"]) {
        //get the header, footer and usedComponents on this page
        const baseUsedComponentsInUse = seenUsedComponents.filter(eachFilterUsedComponent => {
            return eachFilterUsedComponent.location.type === "header" || eachFilterUsedComponent.location.type === "footer" || (seenActivePageId !== undefined && eachFilterUsedComponent.location.type === "page" && eachFilterUsedComponent.location.pageId === seenActivePageId)
        })

        //then get all of the base components children recursively
        const baseUsedComponentsInUseIds = baseUsedComponentsInUse.map(eachBaseUsedComponentInUseId => eachBaseUsedComponentInUseId.id)
        const baseUsedComponentsDecendants: usedComponent[] = getDescendedUsedComponents(baseUsedComponentsInUseIds, seenUsedComponents)

        const totalUsedComponentsToRender = [...baseUsedComponentsInUse, ...baseUsedComponentsDecendants]

        //ensure can be rendered
        await buildUsedComponents(totalUsedComponentsToRender)

        //add back onto the original list
        const updatedUsedComponents = seenUsedComponents.map(eachUsedComponent => {
            const seenUpdatedUsedComponent = totalUsedComponentsToRender.find(eachBuiltComponentFind => eachBuiltComponentFind.id === eachUsedComponent.id)
            if (seenUpdatedUsedComponent !== undefined) return seenUpdatedUsedComponent

            //return original usedComponent
            return eachUsedComponent
        })

        //return the exact list with some usedComponents built/added to render obj
        return updatedUsedComponents
    }

    function sendWebsocketUpdate(updateOption: webSocketStandardMessageType["data"]["updated"]) {
        const newWebSocketsMessage: webSocketStandardMessageType = {
            type: "standard",
            data: {
                websiteId: websiteObj.id,
                updated: updateOption
            }
        }

        webSocketStandardMessageSchema.parse(newWebSocketsMessage)

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(newWebSocketsMessage));
        }
    }

    function changeUrl(newSearchParams: { [key: string]: string }, seenSearchParams: ReadonlyURLSearchParams) {
        const params = new URLSearchParams(seenSearchParams);

        Object.entries(newSearchParams).forEach(eachEntry => {
            const eachKey = eachEntry[0]
            const eachValue = eachEntry[1]

            params.set(eachKey, eachValue);
        })

        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <main className={styles.main}>
            <div className={styles.topSettingsCont}>
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

                            {usedComponentsBuilt && websiteObj.usedComponents !== undefined && (
                                <>
                                    <RenderComponentTree seenUsedComponents={headerUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} renderedUsedComponentsObj={renderedUsedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} previewTemplate={previewTemplate} viewerTemplate={viewerTemplate} renderLocation={{ type: "header" }} />

                                    {activePage !== undefined && (
                                        <RenderComponentTree seenUsedComponents={pageUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} renderedUsedComponentsObj={renderedUsedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} previewTemplate={previewTemplate} viewerTemplate={viewerTemplate} renderLocation={{ type: "page", pageId: activePage.id }} />
                                    )}

                                    <RenderComponentTree seenUsedComponents={footerUsedComponents} originalUsedComponentsList={websiteObj.usedComponents} websiteObj={websiteObj} renderedUsedComponentsObj={renderedUsedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} previewTemplate={previewTemplate} viewerTemplate={viewerTemplate} renderLocation={{ type: "footer" }} />
                                </>
                            )}
                        </div>
                    )}

                    <div ref={spacerRef} className={styles.spacer}></div>
                </div>

                <div className={styles.sideBarHolder} style={{ width: showingSideBar ? "min(450px, 100%)" : "" }}>
                    <div className={styles.sideBar} style={{ display: showingSideBar && !dimSideBar ? "" : "none" }}>
                        <div className={styles.topSideBar}>
                            <select value={activePageId}
                                onChange={async (event: React.ChangeEvent<HTMLSelectElement>) => {
                                    if (websiteObj.usedComponents === undefined) return

                                    const eachPageId = event.target.value


                                    //whenever page id changes hold off on showing results
                                    activePageIdSet(eachPageId)

                                    //render components for new page
                                    const seenUsedComponents = await renderUsedComponentsInUse(websiteObj.usedComponents, eachPageId)

                                    //add onto website obj
                                    websiteObjSet(prevWebsiteObj => {
                                        const newWebsiteObj = { ...prevWebsiteObj }

                                        newWebsiteObj.usedComponents = seenUsedComponents

                                        return newWebsiteObj
                                    })
                                }}
                            >
                                {websiteObj.pages !== undefined && websiteObj.pages.map(eachPage => {

                                    return (
                                        <option key={eachPage.id} value={eachPage.id}

                                        >{eachPage.link === "/" ? "home" : eachPage.link}</option>
                                    )
                                })}
                            </select>
                        </div>

                        <div className={styles.selectionOptionsCont}>
                            {["website", "page", "component"].map(eachOption => {
                                return (
                                    <button key={eachOption} style={{ backgroundColor: eachOption === selectionOption ? "var(--color1)" : "", justifySelf: "flex-start", padding: "var(--spacingS)" }} className='button3'
                                        onClick={() => {
                                            selectionOptionSet(eachOption as "page" | "website" | "component")
                                        }}
                                    >{eachOption}</button>
                                )
                            })}

                            <div style={{ marginLeft: "auto", display: "flex", gap: "var(--spacingS)", alignItems: "center" }}>
                                {activeSizeOption !== undefined && activePage !== undefined && (
                                    <Link href={`/websites/view/${websiteObj.id}?size=${activeSizeOption.name}&page=${activePage.link}`} target="_blank" className='toolTip' data-tooltip={"view website"} style={{ "--translate": "-100% 0", display: "inline-block" } as React.CSSProperties}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" /></svg>
                                    </Link>
                                )}

                                <button style={{ "--translate": "-100% 0" } as React.CSSProperties} className='toolTip' data-tooltip={"download website"}
                                    onClick={() => { viewingDownloadOptionsSet(true) }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className={styles.selectionContent}>
                            <div style={{ display: selectionOption === "website" ? "grid" : "none", paddingInline: "var(--spacingR)" }}>
                                <ShowMore startShowing={true}
                                    label='global styles'
                                    content={
                                        <textarea rows={10} value={websiteObj.globalCss} className={styles.styleEditor}
                                            onChange={(e) => {
                                                const newWebsite = { ...websiteObj }
                                                newWebsite.globalCss = e.target.value

                                                handleWebsiteUpdate(newWebsite)
                                            }}
                                            onBlur={() => {
                                                const newWebsite = { ...websiteObj }
                                                newWebsite.globalCss = formatCSS(newWebsite.globalCss)

                                                handleWebsiteUpdate(newWebsite)
                                            }}
                                        />
                                    }
                                />

                                <RecursiveForm
                                    seenForm={updateWebsiteSchema.omit({ globalCss: true }).parse(websiteObj)}
                                    seenMoreFormInfo={{
                                        "description": {
                                            element: {
                                                type: "textarea"
                                            }
                                        },
                                        "fonts/0/weights": {
                                            returnToNull: true,
                                        },
                                        "fonts/0/importName": {
                                            placeholder: "copy same name from google fonts - case sensitive",
                                        },
                                    }}
                                    seenArrayStarters={{
                                        "fonts": {
                                            importName: "",
                                            subsets: [],
                                            weights: [],
                                        },
                                        "fonts/0/subsets": "",
                                        "authorisedUsers": {
                                            userId: "",
                                            accessLevel: "view"
                                        },
                                    }}
                                    seenNullishStarters={{
                                        "fonts/0/weights": [],
                                    }}
                                    seenSchema={updateWebsiteSchema.omit({ globalCss: true })}
                                    updater={(seenForm) => {
                                        const newFullWebsite: website = { ...websiteObj, ...(seenForm as updateWebsite) }
                                        handleWebsiteUpdate(newFullWebsite)
                                    }}
                                />
                            </div>

                            {websiteObj.pages !== undefined && (
                                <div style={{ display: selectionOption === "page" ? "grid" : "none", padding: "var(--spacingR)" }}>
                                    <button className='button1' style={{ justifySelf: "flex-end" }}
                                        onClick={() => {
                                            addingPageSet(prev => !prev)
                                        }}
                                    >{addingPage ? (
                                        <svg style={{ fill: "var(--bg2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" /></svg>
                                    ) : (
                                        <svg style={{ fill: "var(--bg2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" /></svg>
                                    )}</button>

                                    {addingPage && (
                                        <AddEditPage sentWebsiteId={websiteObj.id} handleManagePage={handleManagePage}
                                            submissionAction={() => {
                                                addingPageSet(false)
                                            }}
                                        />
                                    )}

                                    {websiteObj.pages.length > 0 && (
                                        <>
                                            <label>Edit Pages</label>

                                            <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingR)" }}>
                                                {websiteObj.pages.map(eachPage => {
                                                    return (
                                                        <div key={eachPage.id} style={{ border: "1px solid var(--shade1)" }}>
                                                            <AddEditPage sentPage={eachPage} sentWebsiteId={websiteObj.id} handleManagePage={handleManagePage} />

                                                            <ConfirmationBox text='' confirmationText='are you sure you want to delete the page?' successMessage='page deleted!'
                                                                icon={
                                                                    <svg style={{ fill: "var(--bg2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                                                                }
                                                                runAction={async () => {
                                                                    await deletePage(websiteObj.id, eachPage.id)

                                                                    //ensure page is no longer selected
                                                                    activePageIdSet(undefined)

                                                                    await refreshWebsitePath({ id: websiteObj.id })

                                                                    //send update that any other clients needs to refresh their pages
                                                                    sendWebsocketUpdate({
                                                                        type: "page",
                                                                        pageId: eachPage.id,
                                                                        refresh: true
                                                                    })
                                                                }}

                                                                style={{
                                                                    justifySelf: "flex-end"
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {websiteObj.usedComponents !== undefined && (
                                <div style={{ display: selectionOption === "component" ? "grid" : "none" }}>
                                    {activeUsedComponent !== undefined ? (
                                        <>
                                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: 'center', justifyContent: "space-between", padding: "var(--spacingR)" }}>
                                                <label>{activeUsedComponent.data.category} template</label>

                                                {Object.hasOwn(activeUsedComponent.data, "children") && (
                                                    <button style={{ zIndex: 1 }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(activeUsedComponent.id);

                                                            toast.success("id copied to clipboard")
                                                        }}
                                                    >
                                                        <svg style={{ width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z" /></svg>
                                                    </button>
                                                )}
                                            </div>

                                            <ShowMore
                                                label='Styling'
                                                startShowing={true}
                                                content={
                                                    <>
                                                        <ShowMore
                                                            label='Css'
                                                            startShowing={true}
                                                            content={
                                                                <textarea rows={5} value={activeUsedComponent.css} className={styles.styleEditor}
                                                                    onChange={(e) => {
                                                                        const newActiveComp: usedComponent = { ...activeUsedComponent }
                                                                        newActiveComp.css = e.target.value

                                                                        handleManageUsedComponents({ option: "update", updatedUsedComponentId: newActiveComp.id, seenUpdatedUsedComponent: newActiveComp })
                                                                    }}
                                                                    onBlur={() => {
                                                                        const newActiveComp: usedComponent = { ...activeUsedComponent }
                                                                        newActiveComp.css = formatCSS(newActiveComp.css)

                                                                        handleManageUsedComponents({ option: "update", updatedUsedComponentId: newActiveComp.id, seenUpdatedUsedComponent: newActiveComp })
                                                                    }}
                                                                />
                                                            }
                                                        />

                                                        <ShowMore
                                                            label='set attributes'
                                                            content={
                                                                <>
                                                                    <input type='text' value={activeUsedComponent.data.mainElProps.id ?? ""} placeholder='Add an id to this element'
                                                                        onChange={(e) => {
                                                                            const newActiveComp: usedComponent = { ...activeUsedComponent }
                                                                            newActiveComp.data.mainElProps.id = e.target.value

                                                                            handleManageUsedComponents({ option: "update", updatedUsedComponentId: newActiveComp.id, seenUpdatedUsedComponent: newActiveComp })
                                                                        }}
                                                                    />

                                                                    <input type='text' value={activeUsedComponent.data.mainElProps.className ?? ""} placeholder='Add css names here' style={{ marginTop: "var(--spacingR)" }}
                                                                        onChange={(e) => {
                                                                            const newActiveComp: usedComponent = { ...activeUsedComponent }
                                                                            newActiveComp.data.mainElProps.className = e.target.value

                                                                            handleManageUsedComponents({ option: "update", updatedUsedComponentId: newActiveComp.id, seenUpdatedUsedComponent: newActiveComp })
                                                                        }}
                                                                    />
                                                                </>
                                                            }
                                                        />
                                                    </>
                                                }
                                            />

                                            <ShowMore
                                                label="data"
                                                content={
                                                    <TemplateDataSwitch location={activeLocation} activeUsedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} handlePropsChange={handlePropsChange} />
                                                }
                                            />

                                            <ShowMore
                                                label='replace'
                                                content={
                                                    <>
                                                        {viewerTemplate === null ? (
                                                            <button className='button2'
                                                                onClick={() => {
                                                                    viewerTemplateSet({ usedComponentIdToSwap: activeUsedComponent.id, template: null, builtTemplate: null })
                                                                }}
                                                            >enable viewer node</button>
                                                        ) : (
                                                            <button className='button2'
                                                                onClick={() => {
                                                                    viewerTemplateSet(null)
                                                                }}
                                                            >cancel viewer node</button>
                                                        )}

                                                        {/* show options for active */}
                                                        {viewerTemplate !== null && viewerTemplate.usedComponentIdToSwap === activeUsedComponent.id && (
                                                            <>
                                                                <TemplateSelector websiteId={websiteObj.id} seenPage={activePage} handleManageUsedComponents={handleManageUsedComponents} viewerTemplateSet={viewerTemplateSet} previewTemplate={previewTemplate} previewTemplateSet={previewTemplateSet} seenLocation={activeUsedComponent.location} activeLocationSet={activeLocationSet} seenActiveUsedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} />

                                                                {viewerTemplate.template !== null && (
                                                                    <button className='button1'
                                                                        onClick={async () => {
                                                                            try {
                                                                                //replace the used component with this selection
                                                                                //ensure the component info is there
                                                                                if (viewerTemplate.template === null) return

                                                                                //if usedComponents are the same type can reuse data
                                                                                const reusingUsedComponentData = activeUsedComponent.data.category === viewerTemplate.template.categoryId

                                                                                //replace everything except id, pageid, compid, children
                                                                                const newReplacedUsedComponent: Partial<updateUsedComponent> = { templateId: viewerTemplate.template.id, css: viewerTemplate.template.defaultCss, data: reusingUsedComponentData ? activeUsedComponent.data : viewerTemplate.template.defaultData }

                                                                                //send to update 
                                                                                handleManageUsedComponents({ option: "update", updatedUsedComponentId: activeUsedComponent.id, seenUpdatedUsedComponent: newReplacedUsedComponent, rebuild: true })

                                                                                viewerTemplateSet(null)

                                                                                toast.success("swapped component")

                                                                            } catch (error) {
                                                                                consoleAndToastError(error)
                                                                            }
                                                                        }}
                                                                    >replace with this component</button>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                }
                                            />

                                            <ShowMore
                                                label='order'
                                                content={
                                                    <UsedComponentOrderSelector websiteId={websiteObj.id} seenUsedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} />
                                                }
                                            />

                                            <ShowMore
                                                label='change location'
                                                content={
                                                    <UsedComponentLocationSelector websiteId={websiteObj.id} seenUsedComponent={activeUsedComponent} seenPages={websiteObj.pages !== undefined ? websiteObj.pages : []} />
                                                }
                                            />

                                            <ShowMore
                                                label='Delete Component'
                                                content={
                                                    <ConfirmationBox text='delete' confirmationText='are you sure you want to delete' successMessage='deleted!' runAction={async () => {
                                                        await deleteUsedComponent(websiteObj.id, activeUsedComponent.id)

                                                        await refreshWebsitePath({ id: websiteObj.id })

                                                        //send update that any other clients needs to refresh their usedComponents
                                                        sendWebsocketUpdate({
                                                            type: "usedComponent",
                                                            usedComponentId: activeUsedComponent.id,
                                                            refresh: true
                                                        })
                                                    }} />
                                                }
                                            />
                                        </>
                                    ) : (
                                        <label>Please select a component</label>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.addOnMenu}>
                        {websiteObj.usedComponents !== undefined && (
                            <Draggable
                                nodeRef={draggableRef}
                            >
                                <div className={styles.addOnMenuDragCont} ref={draggableRef}>
                                    <button className='toolTip button4' data-tooltip={"drag"}>
                                        <svg style={{ fill: "var(--bg2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" /></svg>
                                    </button>

                                    <TemplateSelector websiteId={websiteObj.id} seenLocation={activeLocation} seenPage={activePage} activeLocationSet={activeLocationSet} handleManageUsedComponents={handleManageUsedComponents} previewTemplate={previewTemplate} previewTemplateSet={previewTemplateSet} seenActiveUsedComponent={activeUsedComponent} seenUsedComponents={websiteObj.usedComponents} canFloat={true} />
                                </div>
                            </Draggable>
                        )}

                        {showingSideBar && (//dim button
                            <>
                                <button className='button4 toolTip' data-tooltip={"dim"} style={{ filter: dimSideBar ? "brightness(.4)" : "", backgroundColor: "var(--color3)" }}
                                    onClick={() => {
                                        dimSideBarSet(prev => !prev)
                                    }}
                                >
                                    <svg style={{ fill: "var(--bg2)", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2c0 0 0 0 0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4c0 0 0 0 0 0c19.8 27.1 39.7 54.4 49.2 86.2l160 0zM192 512c44.2 0 80-35.8 80-80l0-16-160 0 0 16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z" /></svg>
                                </button>
                            </>
                        )}

                        <button className='button4 toolTip' style={{ backgroundColor: "var(--color3)" }}
                            data-tooltip={`${showingSideBar ? "close" : "open"} side bar`}
                            onClick={() => {
                                showingSideBarSet(prev => {
                                    const newBool = !prev

                                    if (newBool) {
                                        dimSideBarSet(false)
                                    }

                                    return newBool
                                })
                            }}
                        >{showingSideBar ? (
                            <svg style={{ fill: "var(--bg2)", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>
                        ) : (
                            <svg style={{ fill: "var(--bg2)", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
                        )}</button>
                    </div>
                </div>

                <DownloadOptions style={{ display: viewingDownloadOptions ? "" : "none" }} seenSession={seenSession} seenWebsite={websiteObj} seenGithubTokens={seenSession.user.userGithubTokens} viewingDownloadOptionsSet={viewingDownloadOptionsSet} />
            </div>

            <button className="button1 hideNavButton" style={{}}
                onClick={() => {
                    controlNavView("toggle")
                }}
            >
                <svg style={{ fill: "var(--bg2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
            </button>
        </main>
    )
}

function RenderComponentTree({
    seenUsedComponents, originalUsedComponentsList, websiteObj, renderedUsedComponentsObj, tempActiveUsedComponentId, previewTemplate, viewerTemplate, renderLocation
}: {
    seenUsedComponents: usedComponent[], originalUsedComponentsList: usedComponent[], websiteObj: website, renderedUsedComponentsObj: React.MutableRefObject<{ [key: string]: React.ComponentType<{ data: templateDataType; }> }>, tempActiveUsedComponentId: React.MutableRefObject<string>, previewTemplate: previewTemplateType | null, viewerTemplate: viewerTemplateType | null, renderLocation: usedComponentLocationType
}) {
    let SeenPreviewBuiltTemplate: React.ComponentType<{ data: templateDataType }> | null = null
    let seenPreviewTemplateData: templateDataType | null = null
    let previewScopedCss = null;

    let previewLocationMatches = false
    let usedComponentToAttachFirstChild: usedComponent | null = null

    //check for location match
    if (previewTemplate !== null) {
        if (previewTemplate.location.type === "child" && renderLocation.type !== "child") {
            //attach template preview to first time parent
            const foundParent = seenUsedComponents.find(eachUsedComponentFind => previewTemplate.location.type === "child" && eachUsedComponentFind.id === previewTemplate.location.parentId)

            //only search when child usedComponents empty
            if (foundParent !== undefined) {
                previewLocationMatches = true
                usedComponentToAttachFirstChild = foundParent
            }
        } else if (previewTemplate.location.type === "header" && renderLocation.type === "header") {
            previewLocationMatches = true

        } else if (previewTemplate.location.type === "footer" && renderLocation.type === "footer") {
            previewLocationMatches = true

        } else if (previewTemplate.location.type === "page" && renderLocation.type === "page" && previewTemplate.location.pageId === renderLocation.pageId) {
            previewLocationMatches = true

        } else if (previewTemplate.location.type === "child" && renderLocation.type === "child" && previewTemplate.location.parentId === renderLocation.parentId) {
            previewLocationMatches = true
        }

        if (previewLocationMatches) {
            SeenPreviewBuiltTemplate = previewTemplate.builtTemplate
            seenPreviewTemplateData = previewTemplate.template.defaultData

            previewScopedCss = addScopeToCSS(previewTemplate.template.defaultCss, previewTemplate.template.id)
            seenPreviewTemplateData.styleId = `____${previewTemplate.template.id}`
        }
    }

    const previewTemplateVar = SeenPreviewBuiltTemplate !== null && seenPreviewTemplateData !== null ? (
        <>
            <style>{previewScopedCss}</style>

            <SeenPreviewBuiltTemplate data={seenPreviewTemplateData} />
        </>
    ) : null

    //attached preview template onto usedComponents with no children yet
    if (usedComponentToAttachFirstChild !== null) {
        if (Object.hasOwn(usedComponentToAttachFirstChild.data, "children")) {
            //@ts-expect-error types
            usedComponentToAttachFirstChild.data.children = previewTemplateVar
        }
    }

    if (seenUsedComponents.length === 0) {
        return previewTemplateVar
    }

    return (
        <>
            {seenUsedComponents.map(eachUsedComponent => {
                let usingViewerTemplate = false

                let SeenViewerBuiltTemplate: React.ComponentType<{ data: templateDataType }> | null = null
                let seenViewerTemplateData: templateDataType | null = null

                //assign new chosen component if using the viewer node
                if (viewerTemplate !== null && viewerTemplate.usedComponentIdToSwap === eachUsedComponent.id && viewerTemplate.template !== null && viewerTemplate.builtTemplate !== null) {
                    usingViewerTemplate = true
                    SeenViewerBuiltTemplate = viewerTemplate.builtTemplate
                    seenViewerTemplateData = viewerTemplate.template.defaultData
                }

                const ComponentToRender = renderedUsedComponentsObj.current[eachUsedComponent.templateId];
                if (ComponentToRender === undefined) {
                    console.error(
                        `Component with ID ${eachUsedComponent.templateId} is not in renderedComponentsObj.`,
                        renderedUsedComponentsObj.current
                    );
                    return null;
                }

                let scopedCss = addScopeToCSS(eachUsedComponent.css, eachUsedComponent.id);

                const seenChildren: usedComponent[] = getChildrenUsedComponents(eachUsedComponent.id, originalUsedComponentsList)

                //order the children
                const seenOrderedChildren = sortUsedComponentsByOrder(seenChildren)

                // Recursively render child components
                const childJSX: React.JSX.Element | null = seenOrderedChildren.length > 0 ? <RenderComponentTree seenUsedComponents={seenOrderedChildren} originalUsedComponentsList={originalUsedComponentsList} websiteObj={websiteObj} renderedUsedComponentsObj={renderedUsedComponentsObj} tempActiveUsedComponentId={tempActiveUsedComponentId} previewTemplate={previewTemplate} viewerTemplate={viewerTemplate} renderLocation={{ type: "child", parentId: eachUsedComponent.id }} /> : null;

                //apply scoped styling starter value
                eachUsedComponent.data.styleId = `____${eachUsedComponent.id}`

                // If the component is a container, pass children as a prop
                //handle chuldren for different categories

                if (childJSX !== null) {
                    if (Object.hasOwn(eachUsedComponent.data, "children")) {
                        //@ts-expect-error types
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
                }

                //@ts-expect-error mouseLeave
                eachUsedComponent.data.mainElProps.onMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                    e.stopPropagation()

                    const seenEl = e.currentTarget as HTMLElement;

                    //remove the highlight 
                    seenEl.classList.remove(styles.highlightComponent);
                }

                //pass children to viewer component if valid
                if (seenViewerTemplateData !== null) {
                    if (Object.hasOwn(seenViewerTemplateData, "children")) {
                        //@ts-expect-error types
                        seenViewerTemplateData.children = childJSX
                    }

                    //ensure css on component data is local
                    if (viewerTemplate !== null && viewerTemplate.template !== null) {
                        scopedCss = addScopeToCSS(viewerTemplate.template.defaultCss, eachUsedComponent.id);

                        seenViewerTemplateData.styleId = `____${eachUsedComponent.id}`
                    }
                }

                let seenElementId: string | undefined = undefined
                let seenElementClassNames: string | undefined = undefined

                //modify id and className of mainElProps render
                if (eachUsedComponent.data.mainElProps.className !== undefined) {
                    const seenClasses = eachUsedComponent.data.mainElProps.className.split(" ")
                    seenElementClassNames = seenClasses.map(eachClass => `${eachClass}____${eachUsedComponent.websiteId}`).join(" ")
                }

                if (eachUsedComponent.data.mainElProps.id !== undefined) {
                    seenElementId = `${eachUsedComponent.data.mainElProps.id}____${eachUsedComponent.websiteId}`
                }

                return (
                    <React.Fragment key={eachUsedComponent.id}>
                        <style>{scopedCss}</style>

                        {usingViewerTemplate ? (
                            <>
                                {SeenViewerBuiltTemplate !== null && seenViewerTemplateData !== null && (
                                    <SeenViewerBuiltTemplate data={seenViewerTemplateData} />
                                )}
                            </>
                        ) : (
                            <>
                                {/* Render the main component with injected props */}
                                <ComponentToRender data={{ ...eachUsedComponent.data, mainElProps: { ...eachUsedComponent.data.mainElProps, id: seenElementId, className: seenElementClassNames } }} />
                            </>
                        )}

                        {previewTemplate !== null && previewTemplate.orderPosition === eachUsedComponent.order + 1 && usedComponentToAttachFirstChild === null && (
                            <>
                                {previewTemplateVar}
                            </>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    )
}