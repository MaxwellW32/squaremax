"use client"
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { getSpecificTemplate, getTemplatesByCategory, getTemplatesByFamily, getTemplatesByName } from '@/serverFunctions/handleTemplates'
import { addUsedComponent } from '@/serverFunctions/handleUsedComponents'
import { category, template, handleManageUpdateUsedComponentsOptions, newUsedComponent, newUsedComponentSchema, usedComponentLocationType, viewerTemplateType, website, usedComponent, previewTemplateType, activeSelectionType, otherSelctionOptionsArr, otherSelctionOptionsType, templateFilterOptionType, templateFilterOptions, page } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import globalDynamicTemplates from '@/utility/globalTemplates'
import { ensureChildCanBeAddedToParent, getUsedComponentsInSameLocation } from '@/utility/utility'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./styles.module.css"
import LocationSelector from '../websites/LocationSelector'
import { categoryName, categoryNameSchema, templateDataType } from '@/types/templateDataTypes'

export default function TemplateSelector({ websiteId, seenLocation, activeLocationSet, seenPage, handleManageUsedComponents, viewerTemplateSet, previewTemplate, previewTemplateSet, seenActiveUsedComponent, seenUsedComponents, canFloat = false }: {
    websiteId: website["id"], seenLocation: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, seenPage: page | undefined, handleManageUsedComponents(options: handleManageUpdateUsedComponentsOptions): Promise<void>, viewerTemplateSet?: React.Dispatch<React.SetStateAction<viewerTemplateType | null>>, previewTemplate: previewTemplateType | null, previewTemplateSet: React.Dispatch<React.SetStateAction<previewTemplateType | null>>, seenActiveUsedComponent: usedComponent | undefined, seenUsedComponents: usedComponent[], canFloat?: boolean
}) {
    const [userInteracting, userInteractingSet] = useState(false)
    const [, refresherSet] = useState(false)
    const [categories, categoriesSet] = useState<category[]>([])

    const [filter, filterSet] = useState<templateFilterOptionType>("popular")
    const [otherData, otherDataSet] = useState("")

    const activeSelection = useRef<activeSelectionType | undefined>()
    const localRenderedPreviewTemplatesObj = useRef<{ [key: string]: React.ComponentType<{ data: templateDataType; }> }>({})

    const seenTemplates = useRef<{ [key in activeSelectionType]: template[] }>({
        "navbars": [],//operate by pagination
        "heros": [],
        "containers": [],
        "family": [],
        "id": [],
        "recentlyViewed": [],
        "name": [],
    })
    const activeTemplateIndex = useRef<{ [key in activeSelectionType]: number }>({
        "navbars": 0,
        "heros": 0,
        "containers": 0,
        "family": 0,
        "id": 0,
        "recentlyViewed": 0,
        "name": 0,
    })
    const previewsBuilt = useRef(false)


    // const filteredTemplates = useMemo<template[]>(() => {
    //     if (activeSelection === undefined) return []

    //     if (filter === "all") {
    //         return seenTemplates[activeSelection]

    //     } else if (filter === "popular") {
    //         // ranked by uses
    //         return seenTemplates[activeSelection]

    //     } else if (filter === "mostLiked") {
    //         // ranked by likes
    //         return seenTemplates[activeSelection]
    //     } else {
    //         return []
    //     }

    // }, [activeSelection, filter, seenTemplates])

    const readyToAddOtherData = otherSelctionOptionsArr.includes(activeSelection.current as otherSelctionOptionsType)

    const newOrderNumber = useMemo(() => {
        //get used components in same location
        //put them in an array
        const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenLocation, seenUsedComponents)

        //ensure the ordering always adds to the last in the array
        let largestOrderNumberSeen = -1
        usedComponentsInSameLocation.forEach(eachUsedComponentInSameLocation => {
            if (eachUsedComponentInSameLocation.order > largestOrderNumberSeen) {
                largestOrderNumberSeen = eachUsedComponentInSameLocation.order
            }
        })

        return largestOrderNumberSeen + 1
    }, [seenLocation, seenUsedComponents])

    const starterSearchIndex = useRef(0)
    const chunkSize = 10

    //get all template categories on launch
    useEffect(() => {
        const search = async () => {
            try {
                const seenCategories = await getAllCategories()
                categoriesSet(seenCategories)

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        search()
    }, [])

    async function buildSearchedTemplates() {
        if (activeSelection.current === undefined) return

        //increase search scope when activeIndex catches up
        if (activeTemplateIndex.current[activeSelection.current] > (starterSearchIndex.current + chunkSize)) {
            starterSearchIndex.current += chunkSize
            previewsBuilt.current = false
        }

        //dont keep re reunning unless array chunk changes
        if (previewsBuilt.current) return

        const templatesChunk: template[] = seenTemplates.current[activeSelection.current].slice(starterSearchIndex.current, starterSearchIndex.current + chunkSize)

        await Promise.all(templatesChunk.map(async eachTemplate => {
            //build template
            const seenResponse = await globalDynamicTemplates(eachTemplate.id)
            if (seenResponse === undefined) return

            localRenderedPreviewTemplatesObj.current[eachTemplate.id] = seenResponse()
        }))

        console.log(`$built templates for chunk`);
        previewsBuilt.current = true

        refreshAll()
    }

    async function handleActiveIndex(option: "next" | "prev") {
        if (activeSelection.current === undefined) return

        if (option === "next") {
            //go next
            let newIndex = activeTemplateIndex.current[activeSelection.current] + 1

            if (newIndex > seenTemplates.current[activeSelection.current].length - 1) {
                newIndex = 0
            }

            activeTemplateIndex.current[activeSelection.current] = newIndex

        } else if (option === "prev") {
            //go prev
            let newIndex = activeTemplateIndex.current[activeSelection.current] - 1

            if (newIndex < 0) {
                newIndex = seenTemplates.current[activeSelection.current].length - 1
            }

            activeTemplateIndex.current[activeSelection.current] = newIndex
        }

        //await build and send up if necessary
        await buildSearchedTemplates()

        await sendTemplateUp()
    }

    async function sendTemplateUp() {
        if (activeSelection.current === undefined) return

        const newTemplateToBuild: template = seenTemplates.current[activeSelection.current][activeTemplateIndex.current[activeSelection.current]]
        if (newTemplateToBuild === undefined) return

        //if not built already rebuild
        if (localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id] === undefined) {
            console.log(`$not found in localRenderedPreviewTemplatesObj had to build`);

            //build template
            const seenResponse = await globalDynamicTemplates(newTemplateToBuild.id)
            if (seenResponse === undefined) return

            localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id] = seenResponse()
        }

        if (viewerTemplateSet === undefined) {
            previewTemplateSet({ builtTemplate: localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id], template: newTemplateToBuild, location: seenLocation, orderPosition: newOrderNumber })

        } else {
            //locally build and show new template
            viewerTemplateSet(prevViewerTemplate => {
                if (prevViewerTemplate === null) return prevViewerTemplate

                const newViewerTemplate = { ...prevViewerTemplate }

                newViewerTemplate.template = newTemplateToBuild
                newViewerTemplate.builtTemplate = localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id]

                return newViewerTemplate
            })
        }

        refreshAll()
    }

    async function searchUnderCategory(categoryName: categoryName) {
        try {
            //update active selection
            activeSelection.current = categoryName

            //change to false always on activeSelection
            previewsBuilt.current = false

            //search for template name
            const searchedTemplates = await getTemplatesByCategory(categoryName, filter)

            seenTemplates.current[categoryName] = searchedTemplates

            //wait for build if necessary
            await buildSearchedTemplates()

            //send
            toast.success(`searched templates`)
            sendTemplateUp()
            refreshAll()

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    function refreshAll() {
        setTimeout(() => {
            refresherSet(prev => !prev)
        }, 200);
    }

    return (
        <div className={`${canFloat ? styles.templateSelectorCont : ""}`} style={{ display: "grid", alignContent: "flex-start", backgroundColor: "rgb(var(--shade2))", overflow: "auto" }}>
            <button className='mainButton' style={{ padding: ".5rem" }}
                onClick={() => {
                    userInteractingSet(prev => !prev)
                }}
            >{userInteracting ? (
                <svg style={{ fill: "rgb(var(--shade2))", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>
            ) : viewerTemplateSet === undefined ? (
                <svg style={{ fill: "rgb(var(--shade2))", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg>) : (
                <svg style={{ fill: "rgb(var(--shade2))", width: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" /></svg>
            )}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))", overflow: "auto", width: "min(300px, 80vw)", justifyItems: "center", zIndex: 999 }}>
                <LocationSelector location={seenLocation} activeLocationSet={activeLocationSet} activePage={seenPage} activeUsedComponent={seenActiveUsedComponent} style={{ justifySelf: "stretch" }} />

                <ul style={{ display: "flex", overflowX: "auto", justifySelf: "stretch" }}>
                    {categories.map(eachCategory => {
                        return (
                            <button key={eachCategory.name} className='mainButton' style={{ backgroundColor: eachCategory.name === activeSelection.current ? "rgb(var(--color1))" : "" }}
                                onClick={() => {
                                    searchUnderCategory(eachCategory.name)

                                    refreshAll()
                                }}
                            >{eachCategory.name}</button>
                        )
                    })}

                    {otherSelctionOptionsArr.map(eachOtherSelectionOption => {
                        return (
                            <button key={eachOtherSelectionOption} className='mainButton' style={{ backgroundColor: eachOtherSelectionOption === activeSelection.current ? "rgb(var(--color1))" : "" }}
                                onClick={async () => {
                                    try {
                                        //update active selection
                                        activeSelection.current = eachOtherSelectionOption

                                        //change to false always on activeSelection
                                        previewsBuilt.current = false

                                        if (activeSelection.current === "recentlyViewed") {
                                            //get recent template ids stored in browser storage 

                                            toast.success(`searched templates`)
                                            // possibly get and build
                                            // buildSearchedTemplates()
                                        }

                                        refreshAll()

                                    } catch (error) {
                                        consoleAndToastError(error)
                                    }
                                }}
                            >{eachOtherSelectionOption}</button>
                        )
                    })}
                </ul>

                {readyToAddOtherData && activeSelection.current !== "recentlyViewed" && (
                    <>
                        <input type='text' value={otherData} placeholder={`Enter the ${activeSelection.current === "name" ? "name" : activeSelection.current === "id" ? "id" : activeSelection.current === "family" ? "family" : ""} of the template`}
                            onChange={(e) => {
                                otherDataSet(e.target.value)
                            }}
                        />

                        <button className='mainButton'
                            onClick={async () => {
                                if (activeSelection.current === undefined) return

                                //ensure data is present
                                if (otherData === "") {
                                    toast.error("please provide more info")
                                    return
                                }

                                if (activeSelection.current === "id") {
                                    //search for template by id
                                    const searchedTemplate = await getSpecificTemplate({ id: otherData })
                                    if (!searchedTemplate) return

                                    seenTemplates.current[activeSelection.current] = [searchedTemplate]

                                } else if (activeSelection.current === "name") {
                                    //search for template name
                                    const searchedTemplates = await getTemplatesByName(otherData)

                                    seenTemplates.current[activeSelection.current] = searchedTemplates

                                } else if (activeSelection.current === "family") {
                                    //search for template name
                                    const searchedTemplates = await getTemplatesByFamily(otherData)

                                    seenTemplates.current[activeSelection.current] = searchedTemplates
                                }

                                //get and build
                                await buildSearchedTemplates()

                                //send
                                await sendTemplateUp()
                            }}
                        >search</button>
                    </>
                )}

                {activeSelection.current !== undefined && (otherSelctionOptionsArr.find(eachOtherSelectionOption => eachOtherSelectionOption === activeSelection.current) === undefined) && (
                    <ul style={{ display: "flex", flexWrap: "wrap", justifySelf: "flex-end" }}>
                        {templateFilterOptions.map(eachFilterOption => {
                            return (
                                <button key={eachFilterOption} className='secondaryButton' style={{ backgroundColor: eachFilterOption === filter ? "rgb(var(--color1))" : "" }}
                                    onClick={() => {
                                        filterSet(eachFilterOption)

                                        const categoryNameTest = categoryNameSchema.safeParse(eachFilterOption)

                                        if (categoryNameTest.success) {
                                            searchUnderCategory(categoryNameTest.data)
                                        }
                                    }}
                                >{eachFilterOption}</button>
                            )
                        })}
                    </ul>
                )}

                {previewTemplate !== null && (
                    <label>{previewTemplate.template.name}</label>
                )}

                <div style={{ display: "flex", justifySelf: "stretch", overflow: "auto" }}>
                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("prev") }}
                    >prev</button>

                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("next") }}
                    >next</button>

                    {previewTemplate !== null && (
                        <>
                            <button className='mainButton' style={{ marginLeft: "1rem" }}
                                onClick={async () => {
                                    try {
                                        //add template to page normally 
                                        if (viewerTemplateSet === undefined) {
                                            //add to server
                                            const newUsedComponent: newUsedComponent = {
                                                websiteId: websiteId,
                                                templateId: previewTemplate.template.id,
                                                css: previewTemplate.template.defaultCss,
                                                order: previewTemplate.orderPosition, //add at the wanted order - then update other affected usedComponents
                                                location: seenLocation,
                                                data: previewTemplate.template.defaultData,
                                            }

                                            //maintain db recursive constraint with child used component
                                            if (newUsedComponent.location.type === "child") {
                                                ensureChildCanBeAddedToParent(newUsedComponent.location.parentId, seenUsedComponents)
                                            }

                                            //validate
                                            const validatedNewUsedComponent = newUsedComponentSchema.parse(newUsedComponent)

                                            const newAddedUsedComponent = await addUsedComponent(validatedNewUsedComponent)

                                            //then add to page
                                            handleManageUsedComponents({ option: "create", seenAddedUsedComponent: newAddedUsedComponent })

                                            //reset
                                            previewTemplateSet(null)

                                        }
                                    } catch (error) {
                                        consoleAndToastError(error)
                                    }
                                }}
                            >confirm</button>

                            <button className='mainButton'
                                onClick={() => {
                                    previewTemplateSet(null)
                                    userInteractingSet(false)
                                }}
                            >cancel</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}