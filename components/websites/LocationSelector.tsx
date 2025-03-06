import { usedComponentLocationType } from '@/types'
import React from 'react'
import toast from 'react-hot-toast'

export default function LocationSelector({ location, activeLocationSet, activePageId }: { location: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, activePageId: string }) {
    const locationOptions: string[] = ["header", "page", 'footer']
    const seenLocation = typeof location === "object" ? "page" : location

    return (
        <label style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            location

            <select value={seenLocation}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const eachLocationOption = event.target.value

                    if (eachLocationOption === "footer") {
                        activeLocationSet("footer")

                    } else if (eachLocationOption === "header") {
                        activeLocationSet("header")

                    } else if (eachLocationOption === "page") {
                        if (activePageId === "") {
                            toast.error("need to select a page")
                            return
                        }

                        activeLocationSet({ pageId: activePageId })
                    }
                }}
            >
                {locationOptions.map(eachLocationOption => {

                    return (
                        <option key={eachLocationOption} value={eachLocationOption}

                        >Add to {eachLocationOption}</option>
                    )
                })}
            </select>
        </label>
    )
}
