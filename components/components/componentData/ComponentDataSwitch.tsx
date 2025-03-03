import { componentDataType, pageComponent, website } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'
import EditContainersData from './containers/EditContainersData'

export default function ComponentDataSwitch({ activePageComponent, handlePropsChange, websiteObj, activePageId }: { activePageComponent: pageComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pageComponent) => void, websiteObj: website, activePageId: string }) {
    if (activePageComponent.data === null) return null

    return (
        <>
            {activePageComponent.data.category === "navbars" && (
                <EditNavbarsData data={activePageComponent.data} activePageComponent={activePageComponent} handlePropsChange={handlePropsChange} />
            )}

            {activePageComponent.data.category === "containers" && (
                <EditContainersData data={activePageComponent.data} seenPageComponent={activePageComponent} handlePropsChange={handlePropsChange} websiteObj={websiteObj} activePageId={activePageId} />
            )}
        </>
    )
}
