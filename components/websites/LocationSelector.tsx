import { usedComponentLocationType } from '@/types'
import React from 'react'
import toast from 'react-hot-toast'

export default function LocationSelector({ location, activeLocationSet, activePageId }: { location: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, activePageId: string | undefined }) {
    const locationOptions: string[] = ["header", "page", 'footer']
    const seenLocation = typeof location === "object" ? "page" : location

    return (
        <label style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            location

            <select value={seenLocation}
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
