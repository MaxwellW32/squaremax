import { componentDataType, pageComponent, website } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'
import EditContainersData from './containers/EditContainersData'

export default function ComponentDataSwitch({ activePagesToComponent, handlePropsChange, websiteObj, activePageId }: { activePagesToComponent: pageComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pageComponent) => void, websiteObj: website, activePageId: string }) {
    if (activePagesToComponent.data === null) return null

    return (
        <>
            {activePagesToComponent.data.category === "navbars" && (
                <EditNavbarsData data={activePagesToComponent.data} activePagesToComponent={activePagesToComponent} handlePropsChange={handlePropsChange} />
            )}

            {activePagesToComponent.data.category === "containers" && (
                <EditContainersData data={activePagesToComponent.data} seenPageComponent={activePagesToComponent} handlePropsChange={handlePropsChange} websiteObj={websiteObj} activePageId={activePageId} />
            )}
        </>
    )
}
