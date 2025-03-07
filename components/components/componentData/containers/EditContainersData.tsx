import { componentDataType, containersType, handleManageUpdateComponentsOptions, usedComponent, website } from '@/types'
import React from 'react'
import ComponentSelector from '../../ComponentSelector'

export default function EditContainersData({ seenUsedComponent, handleManageUsedComponents }: { data: containersType, seenUsedComponent: usedComponent, handlePropsChange: (newPropsObj: componentDataType, sentUsedComponent: usedComponent) => void, handleManageUsedComponents(options: handleManageUpdateComponentsOptions): Promise<void> }) {
    return (
        <div>
            <h3>Edit container</h3>

            <div style={{ padding: "1rem" }}>
                {seenUsedComponent.children.map(eachUsedComponentChild => {
                    return (
                        <div key={eachUsedComponentChild.id}>{eachUsedComponentChild.id}</div>
                    )
                })}
            </div>

            <h3>Add component children</h3>
            <ComponentSelector handleManageUsedComponents={handleManageUsedComponents} indexToAdd={seenUsedComponent.children.length} location={seenUsedComponent.location} parentComponent={seenUsedComponent} />
        </div>
    )
}
