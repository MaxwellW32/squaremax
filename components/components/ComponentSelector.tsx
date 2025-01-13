"use client"
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { getComponents } from '@/serverFunctions/handleComponents'
import { addComponentToPage, updateComponentInPage } from '@/serverFunctions/handlePagesToComponents'
import { refreshWebsitePath } from '@/serverFunctions/handleWebsites'
import { category, categoryName, childComponentType, component, page, pagesToComponent, website } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { sanitizeDataInPageComponent } from '@/utility/utility'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ComponentSelector({ pageIdObj, websiteIdObj, currentIndex, parentComponent }: { pageIdObj: Pick<page, "id">, websiteIdObj: Pick<website, "id">, currentIndex: number, parentComponent?: pagesToComponent }) {
    //receive input
    //search by category
    //save to pagestocomponents the selection

    const [userInteracting, userInteractingSet] = useState(false)

    const [latestCategories, latestCategoriesSet] = useState<category[]>([])
    const [categorySelection, categorySelectionSet] = useState<categoryName | null>(null)

    const [canSearch, canSearchSet] = useState(true)
    const categorysearchDebounce = useRef<NodeJS.Timeout>()

    const [canSearchComponents, canSearchComponentsSet] = useState(true)
    const componentSearchDebounce = useRef<NodeJS.Timeout>()

    const [seenComponents, seenComponentsSet] = useState<component[]>([])

    //get categories
    useEffect(() => {
        handleCategorySearch()
    }, [])

    async function handleCategorySearch() {
        try {
            if (!canSearch) return
            canSearchSet(false)

            latestCategoriesSet(await getAllCategories())

            if (categorysearchDebounce.current) clearTimeout(categorysearchDebounce.current)
            categorysearchDebounce.current = setTimeout(() => {
                canSearchSet(true)
            }, 30_000);

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    //make custom function that sends the data upwards

    return (
        <div>
            <button className='mainButton'
                onClick={() => {
                    userInteractingSet(prev => !prev)

                }}
            >{userInteracting ? "close" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))" }}>
                <div>
                    <button disabled={!canSearch} className='mainButton'
                        onClick={handleCategorySearch}
                    >get categories</button>

                    {latestCategories.length > 0 && (
                        <ul style={{ display: "flex", gap: "1rem" }}>
                            {latestCategories.map(eachCategory => {
                                return (
                                    <button key={eachCategory.name} className='tag' style={{ backgroundColor: eachCategory.name === categorySelection ? "rgb(var(--color1))" : "" }}
                                        onClick={async () => {
                                            try {
                                                if (!canSearchComponents) return
                                                canSearchComponentsSet(false)

                                                //update category selection
                                                categorySelectionSet(eachCategory.name)

                                                //search for component
                                                const searchedComponents = await getComponents({ option: "categoryId", data: { categoryId: eachCategory.name } })
                                                seenComponentsSet(searchedComponents)
                                                toast.success("searched components in category")

                                                if (componentSearchDebounce.current) clearTimeout(componentSearchDebounce.current)
                                                componentSearchDebounce.current = setTimeout(async () => {
                                                    canSearchComponentsSet(true)
                                                }, 5_000);

                                            } catch (error) {
                                                consoleAndToastError(error)
                                            }
                                        }}
                                    >{eachCategory.name}</button>
                                )
                            })}
                        </ul>
                    )}
                </div>

                {seenComponents.length > 0 && (
                    <>
                        <h3>Select your component</h3>

                        <div style={{ backgroundColor: "white", overflow: "auto", display: "grid", gridAutoFlow: "column", gridAutoColumns: "80%" }}>
                            {seenComponents.map(eachComponent => {
                                return (
                                    <div key={eachComponent.id} style={{ padding: "1rem", border: "1px solid rgb(var(--shade1))", display: "grid", justifyItems: "center", alignContent: "flex-start", gap: ".5rem" }}>
                                        <h3>{eachComponent.name}</h3>

                                        <button className='mainButton'
                                            onClick={async () => {
                                                try {
                                                    //add to pagesToComponents
                                                    const newComponentToPage = await addComponentToPage({ id: pageIdObj.id }, { id: eachComponent.id }, {
                                                        indexOnPage: currentIndex + 1
                                                    })

                                                    if (parentComponent) {
                                                        const newCompChild: childComponentType = {
                                                            pagesToComponentsId: newComponentToPage.id
                                                        }

                                                        const seenUpdatedChildren = [...parentComponent.children, newCompChild]

                                                        parentComponent.children = seenUpdatedChildren

                                                        const sanitizedUpdateObj = sanitizeDataInPageComponent(parentComponent)

                                                        await updateComponentInPage(sanitizedUpdateObj)
                                                    }

                                                    await refreshWebsitePath({ id: websiteIdObj.id })

                                                    userInteractingSet(false)

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