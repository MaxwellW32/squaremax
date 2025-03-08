import { componentDataType, containersType, handleManageUpdateComponentsOptions, usedComponent, usedComponentLocationType, website } from '@/types'
import React from 'react'
import ComponentSelector from '../../ComponentSelector'

export default function EditContainersData({ websiteId, seenLocation, handleManageUsedComponents }: { websiteId: website["id"], seenLocation: usedComponentLocationType, data: containersType, seenUsedComponent: usedComponent, handlePropsChange: (newPropsObj: componentDataType, sentUsedComponent: usedComponent) => void, handleManageUsedComponents(options: handleManageUpdateComponentsOptions): Promise<void> }) {
    const seenChildren: usedComponent[] = []

    return (
        <div>
            <h3>Edit container</h3>

            <div style={{ padding: "1rem" }}>
                {seenChildren.map(eachUsedComponentChild => {
                    return (
                        <div key={eachUsedComponentChild.id}>{eachUsedComponentChild.id}</div>
                    )
                })}
            </div>

            <h3>Add component children</h3>
            <ComponentSelector websiteId={websiteId} handleManageUsedComponents={handleManageUsedComponents} location={seenLocation} />
        </div>
    )
}
