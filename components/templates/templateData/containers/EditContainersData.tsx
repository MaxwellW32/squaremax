import { templateDataType, containersDataType, usedComponent, usedComponentLocationType } from '@/types'
import React from 'react'
import { getChildrenUsedComponents } from '@/utility/utility'

export default function EditContainersData({ location, seenUsedComponents }: { data: containersDataType, seenUsedComponent: usedComponent, location: usedComponentLocationType, seenUsedComponents: usedComponent[], handlePropsChange: (newPropsObj: templateDataType, sentUsedComponent: usedComponent) => void }) {
    const seenChildren: usedComponent[] = location.type === "child" ? getChildrenUsedComponents(location.parentId, seenUsedComponents) : []

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
        </div>
    )
}
