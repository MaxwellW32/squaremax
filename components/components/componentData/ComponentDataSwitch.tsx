import { componentDataType, pagesToComponent } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'

export default function ComponentDataSwitch({ activePagesToComponent, handlePropsChange }: { activePagesToComponent: pagesToComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) => void }) {
    if (activePagesToComponent.data === null) return null

    return (
        <>
            {activePagesToComponent.data.category === "navbars" && (
                <EditNavbarsData data={activePagesToComponent.data} activePagesToComponent={activePagesToComponent} handlePropsChange={handlePropsChange} />
            )}
        </>
    )
}
