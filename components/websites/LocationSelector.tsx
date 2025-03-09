import { page, usedComponent, usedComponentLocationType } from '@/types'
import React, { useEffect } from 'react'

export default function LocationSelector({ location, activeLocationSet, activePage, activeUsedComponent }: { location: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, activePage: page | undefined, activeUsedComponent?: usedComponent }) {
    const locationSelectionOptions: usedComponentLocationType["type"][] = ["header", "page", "footer", "child"]
    const usedComponentCanHaveChild = !(activeUsedComponent === undefined || activeUsedComponent.template === undefined || activeUsedComponent.template.category === undefined)

    //keep activeLocation in line with activeUsedComponent
    useEffect(() => {
        if (!usedComponentCanHaveChild) return

        //if can accept children update the location
        if (activeUsedComponent.template?.categoryId === "containers") {
            activeLocationSet({
                type: "child",
                parentId: activeUsedComponent.id
            })

        } else {
            //if not compatible with children and location set to child then switch off
            if (location.type === "child" && activePage !== undefined) {
                activeLocationSet({
                    type: "page",
                    pageId: activePage.id
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
                        if (activePage === undefined) return

                        activeLocationSet({ type: "page", pageId: activePage.id })
                    }
                }}
            >
                {locationSelectionOptions.map(eachLocationOption => {
                    if (eachLocationOption === "page" && activePage === undefined) return null
                    if (eachLocationOption === "child" && !usedComponentCanHaveChild) return null

                    return (
                        <option key={eachLocationOption} value={eachLocationOption}

                        >Add to {eachLocationOption}</option>
                    )
                })}
            </select>
        </label>
    )
}
