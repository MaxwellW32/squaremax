"use client"
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { getComponents } from '@/serverFunctions/handleComponents'
import { addUsedComponent } from '@/serverFunctions/handleUsedComponents'
import { category, component, handleManageUpdateComponentsOptions, newUsedComponent, newUsedComponentSchema, usedComponentLocationType, viewerComponentType, website } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import globalDynamicComponents from '@/utility/globalComponents'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ComponentSelector({ websiteId, location, handleManageUsedComponents, viewerComponentSet
}: {
    websiteId: website["id"], location: usedComponentLocationType, handleManageUsedComponents(options: handleManageUpdateComponentsOptions): Promise<void>, viewerComponentSet?: React.Dispatch<React.SetStateAction<viewerComponentType | null>>
}) {
    const [userInteracting, userInteractingSet] = useState(false)

    const [allCategories, allCategoriesSet] = useState<category[]>([])
    const [activeCategory, activeCategorySet] = useState<category | null>(null)

    const [seenComponents, seenComponentsSet] = useState<component[]>([])

    //get categories on launch
    useEffect(() => {
        const search = async () => {
            try {
                allCategoriesSet(await getAllCategories())

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        search()
    }, [])

    return (
        <div>
            <button className='mainButton'
                onClick={() => {
                    userInteractingSet(prev => !prev)
                }}
            >{userInteracting ? "close" : viewerComponentSet ? "Choose a component" : "Add a component"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))" }}>
                {allCategories.length > 0 && (
                    <ul style={{ display: "flex" }}>
                        {allCategories.map(eachCategory => {
                            return (
                                <button key={eachCategory.name} className='mainButton' style={{ backgroundColor: eachCategory.name === activeCategory?.name ? "rgb(var(--color1))" : "" }}
                                    onClick={async () => {
                                        try {
                                            //update active selection
                                            activeCategorySet(eachCategory)

                                            //search for component
                                            const searchedComponents = await getComponents({ option: "categoryId", data: { categoryId: eachCategory.name } })
                                            seenComponentsSet(searchedComponents)

                                            toast.success(`searched ${eachCategory.name} components`)

                                        } catch (error) {
                                            consoleAndToastError(error)
                                        }
                                    }}
                                >{eachCategory.name}</button>
                            )
                        })}
                    </ul>
                )}

                {seenComponents.length > 0 && (
                    <>
                        <h3>{viewerComponentSet === undefined ? "Select" : "Swap"} your component</h3>

                        <div style={{ backgroundColor: "white", overflow: "auto", display: "grid", gridAutoFlow: "column", gridAutoColumns: "80%" }}>
                            {seenComponents.map(eachComponent => {
                                return (
                                    <div key={eachComponent.id} style={{ padding: "1rem", border: "1px solid rgb(var(--shade1))", display: "grid", justifyItems: "center", alignContent: "flex-start", gap: ".5rem" }}>
                                        <h3>{eachComponent.name}</h3>

                                        <button className='mainButton'
                                            onClick={async () => {
                                                try {
                                                    //add component to page normally 
                                                    if (viewerComponentSet === undefined) {
                                                        //add to server
                                                        const newUsedComponent: newUsedComponent = {
                                                            componentId: eachComponent.id,
                                                            index: 0,
                                                            css: "",
                                                            data: null,
                                                            location: location,
                                                            websiteId: websiteId
                                                        }

                                                        const validatedNewUsedComponent = newUsedComponentSchema.parse(newUsedComponent)

                                                        const newAddedUsedComponent = await addUsedComponent(validatedNewUsedComponent)

                                                        //the add to page
                                                        handleManageUsedComponents({ option: "create", seenAddedUsedComponent: newAddedUsedComponent })

                                                    } else {
                                                        //only preview the component

                                                        //build component
                                                        const seenResponse = await globalDynamicComponents(eachComponent.id)
                                                        if (seenResponse === undefined) return

                                                        //locally build and show new component
                                                        viewerComponentSet(prevViewerComponent => {
                                                            if (prevViewerComponent === null) return prevViewerComponent

                                                            const newViewerComponent = { ...prevViewerComponent }

                                                            newViewerComponent.component = eachComponent
                                                            newViewerComponent.builtComponent = seenResponse()

                                                            return newViewerComponent
                                                        })
                                                    }

                                                } catch (error) {
                                                    consoleAndToastError(error)
                                                }
                                            }}
                                        >select</button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}