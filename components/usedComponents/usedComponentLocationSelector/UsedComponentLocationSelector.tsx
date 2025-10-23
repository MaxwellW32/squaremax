import { changeUsedComponentLocation } from '@/serverFunctions/handleUsedComponents';
import { refreshWebsitePath } from '@/serverFunctions/handleWebsites';
import { pageType, usedComponentType, usedComponentLocationType, websiteType } from '@/types'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast';
import { sanitizeUsedComponentData } from '@/utility/utility';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

export default function UsedComponentLocationSelector({ seenUsedComponent, seenPages }: { websiteId: websiteType["id"], seenUsedComponent: usedComponentType, seenPages: pageType[] }) {
    const locationSelectionOptions: usedComponentLocationType["type"][] = ["header", "page", "footer", "child"]
    const [transferToLocation, transferToLocationSet] = useState<usedComponentLocationType["type"] | undefined>()
    const [activeParentId, activeParentIdSet] = useState<usedComponentType["id"]>("")

    async function handleSubmission(sentUsedComponent: usedComponentType, newLocation: usedComponentLocationType) {
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
        <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingR)" }}>
            {/* location options list */}
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {locationSelectionOptions.map(eachLocationSelectionOption => {
                    return (
                        <button key={eachLocationSelectionOption} className='button1' style={{ backgroundColor: transferToLocation !== undefined && eachLocationSelectionOption === transferToLocation ? "var(--color1)" : "" }}
                            onClick={() => {
                                transferToLocationSet(eachLocationSelectionOption)
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
                            <button className='button1'
                                onClick={async () => {
                                    handleSubmission(seenUsedComponent, { type: transferToLocation })
                                }}
                            >Add to {transferToLocation}</button>
                        </>
                    )}

                    {transferToLocation === "page" && (
                        <>
                            <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingS)" }}>
                                {seenPages.map(eachPage => {
                                    return (
                                        <button key={eachPage.id} className='button1'
                                            onClick={async () => {
                                                handleSubmission(seenUsedComponent, { type: "page", pageId: eachPage.id })
                                            }}
                                        >add to {eachPage.link}</button>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    {transferToLocation === "child" && (
                        <>
                            <input type='text' placeholder='paste parent container id' value={activeParentId}
                                onChange={(e) => {
                                    activeParentIdSet(e.target.value)
                                }}
                            />

                            <button className='button1'
                                onClick={async () => {
                                    //ensure active selection
                                    if (activeParentId === "") {
                                        toast.error("copy the id of a container parent")
                                        return
                                    }

                                    await handleSubmission(seenUsedComponent, { type: "child", parentId: activeParentId })

                                    activeParentIdSet("")
                                }}
                            >Add to container</button>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
