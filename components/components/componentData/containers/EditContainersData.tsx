"use client"
import { componentDataType, containersType, pagesToComponent, website } from '@/types'
import React from 'react'
import ComponentSelector from '../../ComponentSelector'

export default function EditContainersData({ activePagesToComponent, websiteObj }: { data: containersType, activePagesToComponent: pagesToComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) => void, websiteObj: website }) {
    return (
        <form action={() => { }}>
            <h3>Edit container</h3>

            <div style={{ padding: "1rem" }}>
                {activePagesToComponent.children.map(eachComponentLogicalChild => {
                    return (
                        <div key={eachComponentLogicalChild.pagesToComponentsId}>{eachComponentLogicalChild.pagesToComponentsId}</div>
                    )
                })}
            </div>

            <h3>Add template to component</h3>
            <ComponentSelector currentIndex={-1} pageId={activePagesToComponent.pageId} websiteId={websiteObj.id} parentComponent={activePagesToComponent} />
        </form>
    )
}
