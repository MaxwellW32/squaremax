import { changeUsedComponentIndex } from '@/serverFunctions/handleUsedComponents'
import { refreshWebsitePath } from '@/serverFunctions/handleWebsites'
import { usedComponent, usedComponentLocationType, website } from '@/types'
import { getUsedComponentsInSameLocation } from '@/utility/utility'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function ComponentOrderSelector({ websiteId, seenUsedComponents, seenUsedComponent }: { websiteId: website["id"], seenUsedComponents: usedComponent[], seenUsedComponent: usedComponent }) {
    const [inputValue, inputValueSet] = useState("")
    const [wantedIndex, wantedIndexSet] = useState<number | null>(null)

    const seenSiblings = useMemo<usedComponent[]>(() => {
        //match other usedComponents in same location
        const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent, seenUsedComponents)

        return usedComponentsInSameLocation
    }, [seenUsedComponent, seenUsedComponents])

    return (
        <div style={{ display: "grid", alignContent: "flex-start" }}>
            <p>current position: {seenUsedComponent.index + 1}</p>

            <p>max position: {seenSiblings.length - 1 + 1}</p>

            <input type='text' value={inputValue} placeholder='Enter new position'
                onChange={(e) => {
                    inputValueSet(e.target.value)
                }}

                onBlur={() => {
                    let seenNumber = parseInt(inputValue)
                    //add +1 for the number/index difference
                    if (isNaN(seenNumber)) seenNumber = 0 + 1

                    if (seenNumber < 0 + 1) {
                        seenNumber = 0 + 1
                    }

                    if (seenNumber > seenSiblings.length - 1 + 1) {
                        seenNumber = seenSiblings.length - 1 + 1
                    }

                    //returns number position instead of index
                    wantedIndexSet(seenNumber)
                    inputValueSet(`${seenNumber}`)
                }}
            />

            <button className='mainButton'
                onClick={async () => {
                    if (wantedIndex === null) return

                    //change index position
                    await changeUsedComponentIndex(seenUsedComponent, wantedIndex - 1)

                    refreshWebsitePath({ id: websiteId })

                    toast.success("order changed")
                }}
            >change</button>
        </div>
    )
}
