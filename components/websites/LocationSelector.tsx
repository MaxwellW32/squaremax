import { usedComponentLocationType } from '@/types'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function LocationSelector({ location, activeLocationSet, activePageId }: { location: usedComponentLocationType, activeLocationSet: React.Dispatch<React.SetStateAction<usedComponentLocationType>>, activePageId: string }) {
    //view all location options
    //choose and send up selectioed option
    const [interacting, interactingSet] = useState(false)
    const locationOptions: string[] = ['footer', "header", "page"]

    return (
        <div style={{ display: "grid", alignContent: "flex-start", justifyItems: "flex-start" }}>
            <label>location</label>

            <button className='mainButton'
                onClick={() => {
                    interactingSet(prev => !prev)
                }}
            >{typeof location === "object" ? "page" : location}</button>

            <ul style={{ display: interacting ? "grid" : "none" }}>
                {locationOptions.map(eachLocationOption => {
                    const seenLocation = typeof location === "object" ? "page" : location

                    return (
                        <button key={eachLocationOption} className='mainButton' style={{ backgroundColor: eachLocationOption === seenLocation ? "rgb(var(--color1))" : "" }}
                            onClick={() => {
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

                                interactingSet(false)
                            }}
                        >{eachLocationOption}</button>
                    )
                })}
            </ul>
        </div>
    )
}
