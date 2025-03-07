import { componentDataType, handleManageUpdateComponentsOptions, usedComponent, website } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'
import EditContainersData from './containers/EditContainersData'

export default function ComponentDataSwitch({ activeUsedComponent, handlePropsChange, handleManageUsedComponents }: { activeUsedComponent: usedComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: usedComponent) => void, handleManageUsedComponents(options: handleManageUpdateComponentsOptions): Promise<void> }) {
    if (activeUsedComponent.data === null) return null

    return (
        <>
            {activeUsedComponent.data.category === "navbars" && (
                <EditNavbarsData data={activeUsedComponent.data} activeUsedComponent={activeUsedComponent} handlePropsChange={handlePropsChange} />
            )}

            {activeUsedComponent.data.category === "containers" && (
                <EditContainersData data={activeUsedComponent.data} seenUsedComponent={activeUsedComponent} handlePropsChange={handlePropsChange} handleManageUsedComponents={handleManageUsedComponents} />
            )}
        </>
    )
}
