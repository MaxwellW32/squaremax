"use client"
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { getSpecificTemplate, getTemplatesByCategory, getTemplatesByName } from '@/serverFunctions/handleTemplates'
import { addUsedComponent } from '@/serverFunctions/handleUsedComponents'
import { category, template, handleManageUpdateUsedComponentsOptions, newUsedComponent, newUsedComponentSchema, usedComponentLocationType, viewerTemplateType, website, usedComponent, previewTemplateType, activeSelectionType, otherSelctionOptionsArr, otherSelctionOptionsType } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import globalDynamicTemplates from '@/utility/globalTemplates'
import { ensureChildCanBeAddedToParent, getUsedComponentsInSameLocation } from '@/utility/utility'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TemplateSelector({ websiteId, location, handleManageUsedComponents, viewerTemplateSet, previewTemplate, previewTemplateSet, seenUsedComponents
}: {
    websiteId: website["id"], location: usedComponentLocationType, handleManageUsedComponents(options: handleManageUpdateUsedComponentsOptions): Promise<void>, viewerTemplateSet?: React.Dispatch<React.SetStateAction<viewerTemplateType | null>>, previewTemplate: previewTemplateType | null, previewTemplateSet: React.Dispatch<React.SetStateAction<previewTemplateType | null>>, seenUsedComponents: usedComponent[]
}) {
    const [userInteracting, userInteractingSet] = useState(false)
    const [otherData, otherDataSet] = useState("")

    const [categories, categoriesSet] = useState<category[]>([])

    const [activeSelection, activeSelectionSet] = useState<activeSelectionType>("navbars")
    const [allSelectionOptions, allSelectionOptionsSet] = useState<activeSelectionType[]>([])

    const filterOptions = ["all", "popular", "mostLiked"] as const
    type filterOptionType = typeof filterOptions[number]

    const [filter, filterSet] = useState<filterOptionType>("all")

    const [seenTemplates, seenTemplatesSet] = useState<{ [key in activeSelectionType]: template[] }>({
        "navbars": [],//operate by pagination
        "heros": [],
        "containers": [],
        "family": [],
        "id": [],
        "recentlyViewed": [],
        "name": [],
    })
    const [activeIndex, activeIndexSet] = useState<{ [key in activeSelectionType]: number }>({
        "navbars": 0,
        "heros": 0,
        "containers": 0,
        "family": 0,
        "id": 0,
        "recentlyViewed": 0,
        "name": 0,
    })
    const filteredTemplates = useMemo<template[]>(() => {
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

    //get all template categories on launch
    useEffect(() => {
        const search = async () => {
            try {
                const seenCategories = await getAllCategories()
                categoriesSet(seenCategories)

                allSelectionOptionsSet([...seenCategories.map(eachCategory => eachCategory.name), ...otherSelctionOptionsArr])

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        search()
    }, [])

    const readyToAddOtherData = otherSelctionOptionsArr.includes(activeSelection as otherSelctionOptionsType)

    const newOrderNumber = useMemo(() => {
        //get used components in same location
        //put them in an array
        const usedComponentsInSameLocation = getUsedComponentsInSameLocation(location, seenUsedComponents)

        //ensure the ordering always adds to the last in the array
        let largestOrderNumberSeen = -1
        usedComponentsInSameLocation.forEach(eachUsedComponentInSameLocation => {
            if (eachUsedComponentInSameLocation.order > largestOrderNumberSeen) {
                largestOrderNumberSeen = eachUsedComponentInSameLocation.order
            }
        })

        return largestOrderNumberSeen + 1
    }, [location, seenUsedComponents])

    function handleActiveIndex(option: "next" | "prev") {
        if (option === "next") {
            //go next
            activeIndexSet(prevActiveIndex => {
                const newActiveIndex = { ...prevActiveIndex }
                const newIndex = activeIndex[activeSelection] + 1

                if (newIndex > seenTemplates[activeSelection].length - 1) {
                    newActiveIndex[activeSelection] = 0
                }

                return newActiveIndex
            })

        } else if (option === "prev") {
            //go prev
            activeIndexSet(prevActiveIndex => {
                const newActiveIndex = { ...prevActiveIndex }
                const newIndex = activeIndex[activeSelection] - 1

                if (newIndex < 0) {
                    newActiveIndex[activeSelection] = seenTemplates[activeSelection].length - 1
                }

                return newActiveIndex
            })
        }
    }

    async function sendTemplateUp(newIndex: number, seenFilteredTemplates: template[]) {
        const newTemplateToBuild: template = seenFilteredTemplates[newIndex]

        //build template
        const seenResponse = await globalDynamicTemplates(newTemplateToBuild.id)
        if (seenResponse === undefined) return

        previewTemplateSet({ builtTemplate: seenResponse(), template: newTemplateToBuild, orderPosition: newOrderNumber })
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start", backgroundColor: "rgb(var(--shade2))" }}>
            <button className='mainButton'
                onClick={() => {
                    userInteractingSet(prev => !prev)
                }}
            >{userInteracting ? "close" : viewerTemplateSet ? "Choose a template" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))" }}>
                <ul style={{ display: "flex" }}>
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

                                        if (eachOtherSelectionOption === "recentlyViewed") {
                                            //get recent template ids stored in browser storage 

                                            toast.success(`searched templates`)
                                            return
                                        }

                                        //ensure data is present
                                        if (otherData === "") return

                                        if (eachOtherSelectionOption === "id") {
                                            //search for template by id
                                            const searchedTemplate = await getSpecificTemplate({ id: otherData })
                                            if (!searchedTemplate) return

                                            //add templates to list
                                            seenTemplatesSet(prevTemplates => {
                                                const newTemplates = { ...prevTemplates }

                                                newTemplates[eachOtherSelectionOption] = [searchedTemplate]

                                                return newTemplates
                                            })

                                        } else if (eachOtherSelectionOption === "name") {
                                            //search for template name
                                            const searchedTemplates = await getTemplatesByName(otherData)

                                            //add templates to list
                                            seenTemplatesSet(prevTemplates => {
                                                const newTemplates = { ...prevTemplates }

                                                newTemplates[eachOtherSelectionOption] = searchedTemplates

                                                return newTemplates
                                            })

                                        } else if (eachOtherSelectionOption === "family") {

                                        }


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
                    <input type='text' value={otherData} placeholder={`Enter the ${activeSelection === "name" ? "name" : activeSelection === "id" ? "id" : ""} of the template`}
                        onChange={(e) => {
                            otherDataSet(e.target.value)
                        }}
                    />
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

                {previewTemplate !== null && }
                <button
                    onClick={async () => {
                        try {
                            //add template to page normally 
                            if (viewerTemplateSet === undefined) {
                                //add to server
                                const newUsedComponent: newUsedComponent = {
                                    websiteId: websiteId,
                                    templateId: eachTemplate.id,
                                    css: eachTemplate.defaultCss,
                                    order: 0,
                                    location: location,
                                    data: eachTemplate.defaultData,
                                }

                                //maintain db recursive constraint with child used component
                                if (newUsedComponent.location.type === "child") {
                                    ensureChildCanBeAddedToParent(newUsedComponent.location.parentId, seenUsedComponents)
                                }

                                //match other usedComponents in same location
                                const usedComponentsInSameLocation = getUsedComponentsInSameLocation(newUsedComponent.location, seenUsedComponents)

                                //ensure the ordering always adds to the last in the array
                                let largestOrderNumberSeen = -1
                                usedComponentsInSameLocation.forEach(eachUsedComponentInSameLocation => {
                                    if (eachUsedComponentInSameLocation.order > largestOrderNumberSeen) {
                                        largestOrderNumberSeen = eachUsedComponentInSameLocation.order
                                    }
                                })
                                newUsedComponent.order = largestOrderNumberSeen + 1

                                //validate
                                const validatedNewUsedComponent = newUsedComponentSchema.parse(newUsedComponent)

                                const newAddedUsedComponent = await addUsedComponent(validatedNewUsedComponent)

                                //then add to page
                                handleManageUsedComponents({ option: "create", seenAddedUsedComponent: newAddedUsedComponent })

                            } else {
                                //only preview the template

                                //build template
                                const seenResponse = await globalDynamicTemplates(eachTemplate.id)
                                if (seenResponse === undefined) return

                                //locally build and show new template
                                viewerTemplateSet(prevViewerTemplate => {
                                    if (prevViewerTemplate === null) return prevViewerTemplate

                                    const newViewerTemplate = { ...prevViewerTemplate }

                                    newViewerTemplate.template = eachTemplate
                                    newViewerTemplate.builtTemplate = seenResponse()

                                    return newViewerTemplate
                                })
                            }

                        } catch (error) {
                            consoleAndToastError(error)
                        }
                    }}
                >confirm</button>
                {/* 
                {filteredTemplates.length > 0 && (
                    <>
                        <h3>{viewerTemplateSet === undefined ? "Select" : "Swap"} your template</h3>

                        <div style={{ backgroundColor: "white", overflow: "auto", display: "grid", gridAutoFlow: "column", gridAutoColumns: "80%" }}>
                            {filteredTemplates.map(eachTemplate => {
                                return (
                                    <div key={eachTemplate.id} style={{ padding: "1rem", border: "1px solid rgb(var(--shade1))", display: "grid", justifyItems: "center", alignContent: "flex-start", gap: ".5rem" }}>
                                        <h3>{eachTemplate.name}</h3>

                                        <button className='mainButton'
                                            
                                        >select</button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )} */}
            </div>
        </div>
    )
}