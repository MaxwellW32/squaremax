import { componentDataType, pagesToComponent, website } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'
import EditContainersData from './containers/EditContainersData'

export default function ComponentDataSwitch({ activePagesToComponent, handlePropsChange, websiteObj }: { activePagesToComponent: pagesToComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) => void, websiteObj: website }) {
    if (activePagesToComponent.data === null) return null

    return (
        <>
            {activePagesToComponent.data.category === "navbars" && (
                <EditNavbarsData data={activePagesToComponent.data} activePagesToComponent={activePagesToComponent} handlePropsChange={handlePropsChange} />
            )}

            {activePagesToComponent.data.category === "containers" && (
                <EditContainersData data={activePagesToComponent.data} activePagesToComponent={activePagesToComponent} handlePropsChange={handlePropsChange} websiteObj={websiteObj} />
            )}
        </>
    )
}
