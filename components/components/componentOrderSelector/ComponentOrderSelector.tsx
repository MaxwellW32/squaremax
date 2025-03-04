import { changeWebsitePageComponentIndex, refreshWebsitePath } from '@/serverFunctions/handleWebsites'
import { pageComponent, website } from '@/types'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ComponentOrderSelector({ websiteId, pageId, seenPageComponents, pageComponentId }: { websiteId: website["id"], pageId: string, seenPageComponents: pageComponent[], pageComponentId: pageComponent["id"] }) {
    const [inputValue, inputValueSet] = useState("")
    const [wantedIndex, wantedIndexSet] = useState<number | null>(null)

    const foundPageComponentArray = FindPageComponentArray(seenPageComponents, pageComponentId)

    function FindPageComponentArray(seenPageComponents: pageComponent[], wantedPageComponentId: string): pageComponent[] | undefined {
        let foundArray: pageComponent[] | undefined = undefined

        seenPageComponents.map((eachPageComponent) => {
            if (eachPageComponent.id === wantedPageComponentId) {
                foundArray = seenPageComponents
                return
            }

            const seenChildArray = FindPageComponentArray(eachPageComponent.children, wantedPageComponentId)
            if (seenChildArray !== undefined) foundArray = seenChildArray
        });

        return foundArray
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start" }}>
            {foundPageComponentArray !== undefined && (
                <p>max position: {foundPageComponentArray.length - 1 + 1}</p>
            )}

            <input type='text' value={inputValue} placeholder='Enter new position'
                onChange={(e) => {
                    inputValueSet(e.target.value)
                }}

                onBlur={() => {
                    if (foundPageComponentArray === undefined) return

                    let seenNumber = parseInt(inputValue)
                    //add +1 for the number/index difference
                    if (isNaN(seenNumber)) seenNumber = 0 + 1

                    if (seenNumber < 0 + 1) {
                        seenNumber = 0 + 1
                    }

                    if (seenNumber > foundPageComponentArray.length - 1 + 1) {
                        seenNumber = foundPageComponentArray.length - 1 + 1
                    }

                    wantedIndexSet(seenNumber)
                    inputValueSet(`${seenNumber}`)
                }}
            />

            <button className='mainButton'
                onClick={async () => {
                    if (wantedIndex === null) return

                    await changeWebsitePageComponentIndex(websiteId, pageId, pageComponentId, wantedIndex - 1)

                    refreshWebsitePath({ id: websiteId })

                    toast.success("order changed")
                }}
            >change</button>
        </div>
    )
}
