import { usedComponent, usedComponentLocationType } from '@/types'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function LocationSelector({ location, activeLocationSet, activePageId, activeUsedComponent }: { location: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, activePageId: string | undefined, activeUsedComponent?: usedComponent }) {
    const locationSelectionOptions: usedComponentLocationType["type"][] = ["header", "page", "footer", "child"]
    const ableToAddChild = !(activeUsedComponent === undefined || activeUsedComponent.component === undefined || activeUsedComponent.component.category === undefined)

    //keep activeLocation in line with activeUsedComponent
    useEffect(() => {
        if (!ableToAddChild) return

        //if can accept children update the location
        if (activeUsedComponent.component?.categoryId === "containers") {
            activeLocationSet({
                type: "child",
                parentId: activeUsedComponent.id
            })

        } else {
            //is not compatile with children
            //check if already child type selected

            if (location.type === "child" && activePageId !== undefined) {
                activeLocationSet({
                    type: "page",
                    pageId: activePageId
                })
            }

        }

    }, [activeUsedComponent])

    return (
        <label style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            location

            <select value={location.type}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const eachLocationOption = event.target.value

                    if (eachLocationOption === "footer") {
                        activeLocationSet({ type: "footer" })

                    } else if (eachLocationOption === "header") {
                        activeLocationSet({ type: "header" })

                    } else if (eachLocationOption === "page") {
                        if (activePageId === undefined) {
                            toast.error("need to select a page")
                            return
                        }

                        activeLocationSet({ type: "page", pageId: activePageId })
                    }
                }}
            >
                {locationSelectionOptions.map(eachLocationOption => {
                    if (eachLocationOption === "child" && !ableToAddChild) return null

                    return (
                        <option key={eachLocationOption} value={eachLocationOption}

                        >Add to {eachLocationOption}</option>
                    )
                })}
            </select>
        </label>
    )
}
