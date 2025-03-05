import { componentDataType, containersType, usedComponent, website } from '@/types'
import React from 'react'
import ComponentSelector from '../../ComponentSelector'

export default function EditContainersData({ seenUsedComponent, websiteObj }: { data: containersType, seenUsedComponent: usedComponent, handlePropsChange: (newPropsObj: componentDataType, sentPageComponent: usedComponent) => void, websiteObj: website }) {
    return (
        <div>
            <h3>Edit container</h3>

            <div style={{ padding: "1rem" }}>
                {seenUsedComponent.children.map(eachPageComponentChild => {
                    return (
                        <div key={eachPageComponentChild.id}>{eachPageComponentChild.id}</div>
                    )
                })}
            </div>

            <h3>Add component children</h3>
            <ComponentSelector seenWebsite={websiteObj} currentIndex={seenUsedComponent.children.length} location={seenUsedComponent.location} parentComponent={seenUsedComponent} />
        </div>
    )
}
