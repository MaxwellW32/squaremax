import { changeWebsitePageComponentIndex, refreshWebsitePath } from '@/serverFunctions/handleWebsites'
import { pageComponent, website } from '@/types'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ComponentOrderSelector({ websiteId, pageId, seenPageComponents, pageComponentId }: { websiteId: website["id"], pageId: string, seenPageComponents: pageComponent[], pageComponentId: pageComponent["id"] }) {
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    <p>min index: {0}</p>

                    <p>max index: {foundPageComponentArray.length - 1}</p>
                </div>
            )}

            <input type='number' value={wantedIndex === null ? "" : wantedIndex}
                onChange={(e) => {
                    if (foundPageComponentArray === undefined) return

                    let seenNumber = parseInt(e.target.value)
                    if (isNaN(seenNumber)) seenNumber = 0

                    if (seenNumber < 0) {
                        seenNumber = 0
                    }

                    if (seenNumber > foundPageComponentArray.length - 1) {
                        seenNumber = foundPageComponentArray.length - 1
                    }

                    wantedIndexSet(seenNumber)
                }}
            />

            <button className='mainButton'
                onClick={async () => {
                    if (wantedIndex === null) return

                    await changeWebsitePageComponentIndex(websiteId, pageId, pageComponentId, wantedIndex)

                    refreshWebsitePath({ id: websiteId })

                    toast.success("order changed")
                }}
            >change</button>
        </div>
    )
}
