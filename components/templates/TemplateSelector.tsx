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

export default function TemplateSelector({ websiteId, seenLocation, handleManageUsedComponents, viewerTemplateSet, previewTemplate, previewTemplateSet, seenUsedComponents
}: {
    websiteId: website["id"], seenLocation: usedComponentLocationType, handleManageUsedComponents(options: handleManageUpdateUsedComponentsOptions): Promise<void>, viewerTemplateSet?: React.Dispatch<React.SetStateAction<viewerTemplateType | null>>, previewTemplate: previewTemplateType | null, previewTemplateSet: React.Dispatch<React.SetStateAction<previewTemplateType | null>>, seenUsedComponents: usedComponent[]
}) {
    const [userInteracting, userInteractingSet] = useState(false)
    const [runSearch, runSearchSet] = useState(false)

    const [categories, categoriesSet] = useState<category[]>([])

    const [activeSelection, activeSelectionSet] = useState<activeSelectionType | undefined>()

    const filterOptions = ["all", "popular", "mostLiked"] as const
    type filterOptionType = typeof filterOptions[number]

    const [filter, filterSet] = useState<filterOptionType>("all")
    const [otherData, otherDataSet] = useState("")

    const localRenderedPreviewTemplatesObj = useRef<{ [key: string]: React.ComponentType<{ data: templateDataType; }> }>({})

    const [seenTemplates, seenTemplatesSet] = useState<{ [key in activeSelectionType]: template[] }>({
        "navbars": [],//operate by pagination
        "heros": [],
        "containers": [],
        "family": [],
        "id": [],
        "recentlyViewed": [],
        "name": [],
    })
    const [activeTemplateIndex, activeTemplateIndexSet] = useState<{ [key in activeSelectionType]: number }>({
        "navbars": 0,
        "heros": 0,
        "containers": 0,
        "family": 0,
        "id": 0,
        "recentlyViewed": 0,
        "name": 0,
    })

    const filteredTemplates = useMemo<template[]>(() => {
        if (activeSelection === undefined) return []

        if (filter === "all") {
            return seenTemplates[activeSelection]

        } else if (filter === "popular") {
            // ranked by uses
            return seenTemplates[activeSelection]

        } else if (filter === "mostLiked") {
            // ranked by likes
            return seenTemplates[activeSelection]
        } else {
            return []
        }

    }, [activeSelection, filter, seenTemplates])

    const readyToAddOtherData = otherSelctionOptionsArr.includes(activeSelection as otherSelctionOptionsType)

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
    const ranForThisChunk = useRef(false)
    const chunkSize = 10

    //fetch template
    //filter them
    //build them in chunks
    //send up the active selection

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

    //keep previewTemplates built ahead of time
    useEffect(() => {
        const handle = async () => {
            if (activeSelection === undefined) return

            //increase search scope when activeIndex catches up
            if (activeTemplateIndex[activeSelection] > starterSearchIndex.current && ranForThisChunk.current) {
                starterSearchIndex.current += chunkSize
                ranForThisChunk.current = false
            }

            //dont keep re reunning unless array chunk changes
            if (ranForThisChunk.current) return

            const templatesChunk: template[] = seenTemplates[activeSelection].slice(starterSearchIndex.current, starterSearchIndex.current + chunkSize)

            await Promise.all(templatesChunk.map(async eachTemplate => {
                //build template
                const seenResponse = await globalDynamicTemplates(eachTemplate.id)
                if (seenResponse === undefined) return

                localRenderedPreviewTemplatesObj.current[eachTemplate.id] = seenResponse()
            }))

            ranForThisChunk.current = true
        }
        handle()

    }, [seenTemplates, activeTemplateIndex, activeSelection])

    async function addToLocalRenderObj(seenActiveSelection: activeSelectionType) {
        //increase search scope when activeIndex catches up
        if (activeTemplateIndex[seenActiveSelection] > starterSearchIndex.current && ranForThisChunk.current) {
            starterSearchIndex.current += chunkSize
            ranForThisChunk.current = false
        }

        //dont keep re reunning unless array chunk changes
        if (ranForThisChunk.current) return

        const templatesChunk: template[] = seenTemplates[seenActiveSelection].slice(starterSearchIndex.current, starterSearchIndex.current + chunkSize)

        await Promise.all(templatesChunk.map(async eachTemplate => {
            //build template
            const seenResponse = await globalDynamicTemplates(eachTemplate.id)
            if (seenResponse === undefined) return

            localRenderedPreviewTemplatesObj.current[eachTemplate.id] = seenResponse()
        }))

        ranForThisChunk.current = true
    }

    async function readyForNext(seenActiveSelection: activeSelectionType) {
        runSearchSet(prev => !prev)

        //await adding to render obj if needed
        await addToLocalRenderObj(seenActiveSelection)

        sendTemplateUp(activeTemplateIndex[seenActiveSelection], filteredTemplates)
    }

    function handleActiveIndex(option: "next" | "prev") {
        let setIndex: number | null = null

        if (option === "next") {
            //go next
            activeTemplateIndexSet(prevActiveIndex => {
                const newActiveIndex = { ...prevActiveIndex }
                if (activeSelection === undefined) return prevActiveIndex

                let newIndex = newActiveIndex[activeSelection] + 1

                if (newIndex > seenTemplates[activeSelection].length - 1) {
                    newIndex = 0
                }

                newActiveIndex[activeSelection] = newIndex
                setIndex = newIndex

                return newActiveIndex
            })

        } else if (option === "prev") {
            //go prev
            activeTemplateIndexSet(prevActiveIndex => {
                const newActiveIndex = { ...prevActiveIndex }
                if (activeSelection === undefined) return prevActiveIndex

                let newIndex = newActiveIndex[activeSelection] - 1

                if (newIndex < 0) {
                    newIndex = seenTemplates[activeSelection].length - 1
                }

                newActiveIndex[activeSelection] = newIndex
                setIndex = newIndex

                return newActiveIndex
            })
        }

        if (setIndex === null) throw new Error("index not set")
        console.log(`$setIndex`, setIndex);
        //continue fetch
        sendTemplateUp(setIndex, filteredTemplates)
    }

    async function sendTemplateUp(newIndex: number, seenFilteredTemplates: template[]) {
        const newTemplateToBuild: template = seenFilteredTemplates[newIndex]
        if (newTemplateToBuild === undefined) return

        //if not built already rebuild
        if (localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id] === undefined) {
            console.log(`$not found in localRenderedPreviewTemplatesObj had to build personally`);

            //build template
            const seenResponse = await globalDynamicTemplates(newTemplateToBuild.id)
            if (seenResponse === undefined) return

            localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id] = seenResponse()
        }

        previewTemplateSet({ builtTemplate: localRenderedPreviewTemplatesObj.current[newTemplateToBuild.id], template: newTemplateToBuild, location: seenLocation, orderPosition: newOrderNumber })
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start", backgroundColor: "rgb(var(--shade2))" }}>
            <button className='mainButton'
                onClick={() => {
                    userInteractingSet(prev => !prev)
                }}
            >{userInteracting ? "close" : viewerTemplateSet ? "Choose a template" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))" }}>
                <ul style={{ display: "flex", flexWrap: "wrap" }}>
                    {categories.map(eachCategory => {
                        return (
                            <button key={eachCategory.name} className='mainButton' style={{ backgroundColor: eachCategory.name === activeSelection ? "rgb(var(--color1))" : "" }}
                                onClick={async () => {
                                    try {
                                        //update active selection
                                        activeSelectionSet(eachCategory.name)

                                        //search for template name
                                        const searchedTemplates = await getTemplatesByCategory(eachCategory.name)

                                        //add templates to list
                                        seenTemplatesSet(prevTemplates => {
                                            const newTemplates = { ...prevTemplates }

                                            newTemplates[eachCategory.name] = searchedTemplates

                                            return newTemplates
                                        })

                                        readyForNext(eachCategory.name)
                                        toast.success(`searched templates`)

                                    } catch (error) {
                                        consoleAndToastError(error)
                                    }
                                }}
                            >{eachCategory.name}</button>
                        )
                    })}

                    {otherSelctionOptionsArr.map(eachOtherSelectionOption => {
                        return (
                            <button key={eachOtherSelectionOption} className='mainButton' style={{ backgroundColor: eachOtherSelectionOption === activeSelection ? "rgb(var(--color1))" : "" }}
                                onClick={async () => {
                                    try {
                                        //update active selection
                                        activeSelectionSet(eachOtherSelectionOption)

                                        if (activeSelection === "recentlyViewed") {
                                            //get recent template ids stored in browser storage 

                                            toast.success(`searched templates`)
                                            return
                                        }

                                        readyForNext(eachOtherSelectionOption)
                                        toast.success(`searched templates`)

                                    } catch (error) {
                                        consoleAndToastError(error)
                                    }
                                }}
                            >{eachOtherSelectionOption}</button>
                        )
                    })}
                </ul>

                {readyToAddOtherData && activeSelection !== "recentlyViewed" && (
                    <>
                        <input type='text' value={otherData} placeholder={`Enter the ${activeSelection === "name" ? "name" : activeSelection === "id" ? "id" : ""} of the template`}
                            onChange={(e) => {
                                otherDataSet(e.target.value)
                            }}
                        />

                        <button className='mainButton'
                            onClick={async () => {
                                if (activeSelection === undefined) return

                                //ensure data is present
                                if (otherData === "") return

                                if (activeSelection === "id") {
                                    //search for template by id
                                    const searchedTemplate = await getSpecificTemplate({ id: otherData })
                                    if (!searchedTemplate) return

                                    //add templates to list
                                    seenTemplatesSet(prevTemplates => {
                                        const newTemplates = { ...prevTemplates }

                                        newTemplates[activeSelection] = [searchedTemplate]

                                        return newTemplates
                                    })

                                } else if (activeSelection === "name") {
                                    //search for template name
                                    const searchedTemplates = await getTemplatesByName(otherData)

                                    //add templates to list
                                    seenTemplatesSet(prevTemplates => {
                                        const newTemplates = { ...prevTemplates }

                                        newTemplates[activeSelection] = searchedTemplates

                                        return newTemplates
                                    })

                                } else if (activeSelection === "family") {

                                }

                                runSearchSet(prev => !prev)
                            }}
                        >search</button>
                    </>
                )}

                <ul style={{ display: "flex", flexWrap: "wrap" }}>
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

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("prev") }}
                    >prev</button>

                    <button className='mainButton'
                        onClick={() => { handleActiveIndex("next") }}
                    >next</button>
                </div>

                {previewTemplate !== null && (
                    <>
                        <p>{previewTemplate.template.name}</p>

                        <button className='mainButton'
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
                    </>
                )}
            </div>
        </div>
    )
}