import { changeUsedComponentLocation } from '@/serverFunctions/handleUsedComponents';
import { refreshWebsitePath } from '@/serverFunctions/handleWebsites';
import { page, usedComponent, usedComponentLocationType, website } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast';
import { sanitizeUsedComponentData } from '@/utility/utility';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

export default function ComponentLocationSelector({ seenUsedComponent, seenPage }: { websiteId: website["id"], seenUsedComponent: usedComponent, seenPage?: page }) {
    const locationSelectionOptions: usedComponentLocationType["type"][] = ["header", "page", "footer", "child"]
    const [transferToLocation, transferToLocationSet] = useState<usedComponentLocationType["type"] | undefined>()
    const [activeParentId, activeParentIdSet] = useState<usedComponent["id"]>("")

    async function handleSubmission(sentUsedComponent: usedComponent, newLocation: usedComponentLocationType) {
        try {
            const sanitizedUsedComponent = sanitizeUsedComponentData(sentUsedComponent)

            await changeUsedComponentLocation(sanitizedUsedComponent, newLocation)

            toast.success("location changed!")

            await refreshWebsitePath({ id: sentUsedComponent.websiteId })

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem" }}>
            {/* location options list */}
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {locationSelectionOptions.map(eachLocationSelectionOption => {
                    return (
                        <button key={eachLocationSelectionOption} className='mainButton' style={{ backgroundColor: transferToLocation !== undefined && eachLocationSelectionOption === transferToLocation ? "rgb(var(--color1))" : "" }}
                            onClick={() => {
                                if (eachLocationSelectionOption === "header" || eachLocationSelectionOption === "footer") {
                                    transferToLocationSet(eachLocationSelectionOption)

                                } else if (eachLocationSelectionOption === "page") {
                                    transferToLocationSet(eachLocationSelectionOption)

                                } else if (eachLocationSelectionOption === "child") {
                                    transferToLocationSet(eachLocationSelectionOption)
                                }
                            }}
                        >{eachLocationSelectionOption}</button>
                    )
                })}
            </div>

            {/* extra step options for each */}
            {transferToLocation !== undefined && (
                <>
                    {/* server function that handles a location */}
                    {(transferToLocation === "header" || transferToLocation === "footer") && (
                        <>
                            <button className='mainButton'
                                onClick={async () => {
                                    handleSubmission(seenUsedComponent, { type: transferToLocation })
                                }}
                            >Add to place</button>
                        </>
                    )}

                    {transferToLocation === "page" && (
                        <>
                            <button className='mainButton'
                                onClick={async () => {
                                    if (seenPage === undefined) {
                                        toast.error("need to provide a page")
                                        return
                                    }
                                    handleSubmission(seenUsedComponent, { type: "page", pageId: seenPage.id })
                                }}
                            >Add to page</button>
                        </>
                    )}

                    {transferToLocation === "child" && (
                        <>
                            <input type='text' placeholder='paste parent container id' value={activeParentId}
                                onChange={(e) => {
                                    activeParentIdSet(e.target.value)
                                }}
                            />

                            <button className='mainButton'
                                onClick={async () => {
                                    if (activeParentId === "") {
                                        toast.error("copy the id of a container parent")
                                        return
                                    }

                                    //get seen components
                                    //if not seen blah
                                    //scan 
                                    //if no then blah 

                                    await handleSubmission(seenUsedComponent, { type: "child", parentId: activeParentId })
                                }}
                            >Add to container</button>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
