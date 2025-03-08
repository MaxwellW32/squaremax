import { refreshWebsitePath } from '@/serverFunctions/handleWebsites'
import { usedComponent, usedComponentLocationType, website } from '@/types'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function ComponentOrderSelector({ websiteId, seenUsedComponents, usedComponent }: { websiteId: website["id"], seenUsedComponents: usedComponent[], usedComponent: usedComponent }) {
    const [inputValue, inputValueSet] = useState("")
    const [wantedIndex, wantedIndexSet] = useState<number | null>(null)

    const [foundUsedComponentLocalArray, foundUsedComponentLocalArraySet] = useState(findUsedComponentLocalArray(seenUsedComponents, usedComponent.location, usedComponent.id))

    const currentIndexInLocalArray = useMemo(() => {
        if (foundUsedComponentLocalArray === undefined) return undefined

        const seenIndex = foundUsedComponentLocalArray.findIndex(eachFindUsedComponent => eachFindUsedComponent.id === usedComponent.id)
        if (seenIndex < 0) return undefined

        return seenIndex
    }, [foundUsedComponentLocalArray])

    //respond to outside changes in seenUsedComponents
    useEffect(() => {
        foundUsedComponentLocalArraySet(findUsedComponentLocalArray(seenUsedComponents, usedComponent.location, usedComponent.id))

    }, [seenUsedComponents, usedComponent.id])

    function findUsedComponentLocalArray(sentUsedComponents: usedComponent[], location: usedComponentLocationType, wantedSentComponentId: string): usedComponent[] | undefined {
        let foundArray: usedComponent[] | undefined = undefined

        //get usedComponents in same location
        const filteredUsedComponents = sentUsedComponents.filter(eachFilterUsedComponent => {
            let matchingLocation = false

            //match header footer area
            if (eachFilterUsedComponent.location === location) {
                matchingLocation = true
            }

            //match usedComponents on the same page
            if (eachFilterUsedComponent.location.type === "page" && location.type === "page") {
                if (eachFilterUsedComponent.location.pageId === location.pageId) {
                    matchingLocation = true
                }
            }

            return matchingLocation
        })

        //if wanted usedComponent is found in the local array return that array
        filteredUsedComponents.map((eachUsedComponent) => {
            if (eachUsedComponent.id === wantedSentComponentId) {
                foundArray = filteredUsedComponents
                return
            }

            const seenChildren: usedComponent[] = []
            const seenChildArray = findUsedComponentLocalArray(seenChildren, location, wantedSentComponentId)
            if (seenChildArray !== undefined) foundArray = seenChildArray
        });

        return foundArray === undefined ? undefined : [...foundArray]
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start" }}>
            {foundUsedComponentLocalArray !== undefined && currentIndexInLocalArray !== undefined && (
                <>
                    <p>current position: {currentIndexInLocalArray + 1}</p>

                    <p>max position: {foundUsedComponentLocalArray.length - 1 + 1}</p>
                </>
            )}

            <input type='text' value={inputValue} placeholder='Enter new position'
                onChange={(e) => {
                    inputValueSet(e.target.value)
                }}

                onBlur={() => {
                    if (foundUsedComponentLocalArray === undefined) return

                    let seenNumber = parseInt(inputValue)
                    //add +1 for the number/index difference
                    if (isNaN(seenNumber)) seenNumber = 0 + 1

                    if (seenNumber < 0 + 1) {
                        seenNumber = 0 + 1
                    }

                    if (seenNumber > foundUsedComponentLocalArray.length - 1 + 1) {
                        seenNumber = foundUsedComponentLocalArray.length - 1 + 1
                    }

                    //returns number position instead of index
                    wantedIndexSet(seenNumber)
                    inputValueSet(`${seenNumber}`)
                }}
            />

            <button className='mainButton'
                onClick={async () => {
                    if (wantedIndex === null) return

                    // const sanitizedUsedComponent = sanitizeUsedComponentData(usedComponent)

                    //change index position
                    // await changeWebsiteUsedComponentIndex(websiteId, sanitizedUsedComponent, wantedIndex - 1)

                    refreshWebsitePath({ id: websiteId })

                    toast.success("order changed")
                }}
            >change</button>
        </div>
    )
}
