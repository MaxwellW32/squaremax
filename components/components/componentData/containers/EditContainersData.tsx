import { componentDataType, containersType, pageComponent, website } from '@/types'
import React from 'react'
import ComponentSelector from '../../ComponentSelector'

export default function EditContainersData({ seenPageComponent, websiteObj, activePageId }: { data: containersType, seenPageComponent: pageComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pageComponent) => void, websiteObj: website, activePageId: string }) {
    return (
        <div>
            <h3>Edit container</h3>

            <div style={{ padding: "1rem" }}>
                {seenPageComponent.children.map(eachPageComponentChild => {
                    return (
                        <div key={eachPageComponentChild.id}>{eachPageComponentChild.id}</div>
                    )
                })}
            </div>

            <h3>Add template to component</h3>

            <ComponentSelector seenWebsite={websiteObj} activePageId={activePageId} currentIndex={websiteObj.pages[activePageId].pageComponents.length} parentComponent={seenPageComponent} />
        </div>
    )
}
