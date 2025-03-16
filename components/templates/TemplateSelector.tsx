"use client"
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { getSpecificTemplate, getTemplatesByCategory, getTemplatesByName } from '@/serverFunctions/handleTemplates'
import { addUsedComponent } from '@/serverFunctions/handleUsedComponents'
import { category, template, handleManageUpdateUsedComponentsOptions, newUsedComponent, newUsedComponentSchema, usedComponentLocationType, viewerTemplateType, website, usedComponent, previewTemplateType, activeSelectionType, otherSelctionOptionsArr, otherSelctionOptionsType, templateDataType } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import globalDynamicTemplates from '@/utility/globalTemplates'
import { ensureChildCanBeAddedToParent, getUsedComponentsInSameLocation } from '@/utility/utility'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TemplateSelector({ websiteId, seenLocation, handleManageUsedComponents, viewerTemplateSet, previewTemplate, previewTemplateSet, seenUsedComponents }: {
    websiteId: website["id"], seenLocation: usedComponentLocationType, handleManageUsedComponents(options: handleManageUpdateUsedComponentsOptions): Promise<void>, viewerTemplateSet?: React.Dispatch<React.SetStateAction<viewerTemplateType | null>>, previewTemplate: previewTemplateType | null, previewTemplateSet: React.Dispatch<React.SetStateAction<previewTemplateType | null>>, seenUsedComponents: usedComponent[]
}) {
    const [userInteracting, userInteractingSet] = useState(false)
    const [, refresherSet] = useState(false)
    const [categories, categoriesSet] = useState<category[]>([])

    const filterOptions = ["all", "popular", "mostLiked"] as const
    type filterOptionType = typeof filterOptions[number]

    const [filter, filterSet] = useState<filterOptionType>("all")
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

        refresherSet(prev => !prev)
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

        previewTemplateSet({ builtTemplate: localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id], template: newTemplateToBuild, location: seenLocation, orderPosition: newOrderNumber })
        refresherSet(prev => !prev)
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start", backgroundColor: "rgb(var(--shade2))", overflow: "auto" }}>
            <button className='mainButton'
                onClick={() => {
                    userInteractingSet(prev => !prev)
                }}
            >{userInteracting ? "close" : viewerTemplateSet ? "Choose a template" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))", overflow: "auto", width: "min(300px, 80vw)", justifyItems: "center" }}>
                <ul style={{ display: "flex", overflowX: "auto", justifySelf: "stretch" }}>
                    {categories.map(eachCategory => {
                        return (
                            <button key={eachCategory.name} className='mainButton' style={{ backgroundColor: eachCategory.name === activeSelection.current ? "rgb(var(--color1))" : "" }}
                                onClick={async () => {
                                    try {
                                        //update active selection
                                        activeSelection.current = eachCategory.name

                                        //change to false always on activeSelection
                                        previewsBuilt.current = false

                                        //search for template name
                                        const searchedTemplates = await getTemplatesByCategory(eachCategory.name)

                                        seenTemplates.current[eachCategory.name] = searchedTemplates

                                        toast.success(`searched templates`)
                                        refresherSet(prev => !prev)

                                        //wait for build if necessary
                                        await buildSearchedTemplates()

                                        //send
                                        sendTemplateUp()

                                    } catch (error) {
                                        consoleAndToastError(error)
                                    }
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
                                            return
                                        }

                                        toast.success(`searched templates`)
                                        refresherSet(prev => !prev)

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
                        <input type='text' value={otherData} placeholder={`Enter the ${activeSelection.current === "name" ? "name" : activeSelection.current === "id" ? "id" : ""} of the template`}
                            onChange={(e) => {
                                otherDataSet(e.target.value)
                            }}
                        />

                        <button className='mainButton'
                            onClick={async () => {
                                if (activeSelection.current === undefined) return

                                //ensure data is present
                                if (otherData === "") return

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

                                }

                                //get and build
                                await buildSearchedTemplates()

                                //send
                                await sendTemplateUp()
                            }}
                        >search</button>
                    </>
                )}

                <ul style={{ display: "flex", flexWrap: "wrap", justifySelf: "flex-end" }}>
                    {filterOptions.map(eachFilterOption => {
                        return (
                            <button key={eachFilterOption} className='secondaryButton' style={{ backgroundColor: eachFilterOption === filter ? "rgb(var(--color1))" : "" }}
                                onClick={() => {
                                    filterSet(eachFilterOption)
                                }}
                            >{eachFilterOption}</button>
                        )
                    })}
                </ul>

                {previewTemplate !== null && (
                    <>
                        <label>{previewTemplate.template.name}</label>

                        <div>
                            <button className='mainButton' style={{ justifySelf: "center" }}
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

                                        } else {
                                            //only preview the template

                                            //locally build and show new template
                                            viewerTemplateSet(prevViewerTemplate => {
                                                if (prevViewerTemplate === null) return prevViewerTemplate

                                                const newViewerTemplate = { ...prevViewerTemplate }

                                                newViewerTemplate.template = previewTemplate.template
                                                newViewerTemplate.builtTemplate = previewTemplate.builtTemplate

                                                return newViewerTemplate
                                            })
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
                        </div>
                    </>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", justifySelf: "center" }}>
                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("prev") }}
                    >prev</button>

                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("next") }}
                    >next</button>
                </div>
            </div>
        </div>
    )
}