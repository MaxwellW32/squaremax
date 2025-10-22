import { usedComponentType, usedComponentLocationType } from '@/types'
import React from 'react'
import { getChildrenUsedComponents } from '@/utility/utility'
import { containersDataType, templateDataType } from '@/types/templateDataTypes'

export default function EditContainersData({ location, seenUsedComponents }: { data: containersDataType, seenUsedComponent: usedComponentType, location: usedComponentLocationType, seenUsedComponents: usedComponentType[], handlePropsChange: (newPropsObj: templateDataType, sentUsedComponent: usedComponentType) => void }) {
    const seenChildren: usedComponentType[] = location.type === "child" ? getChildrenUsedComponents(location.parentId, seenUsedComponents) : []

    return (
        <div>
            <h3>Edit container</h3>

            <div style={{ padding: "var(--spacingR)" }}>
                {seenChildren.map(eachUsedComponentChild => {
                    return (
                        <div key={eachUsedComponentChild.id}>{eachUsedComponentChild.id}</div>
                    )
                })}
            </div>
        </div>
    )
}
