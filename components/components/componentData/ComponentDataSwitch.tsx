import { componentDataType, handleManageUpdateComponentsOptions, usedComponent, usedComponentLocationType, website } from '@/types'
import React from 'react'
import EditNavbarsData from './navbars/EditNavbarsData'
import EditContainersData from './containers/EditContainersData'

export default function ComponentDataSwitch({ websiteId, seenLocation, activeUsedComponent, handlePropsChange, handleManageUsedComponents }: { websiteId: website["id"], seenLocation: usedComponentLocationType, activeUsedComponent: usedComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: usedComponent) => void, handleManageUsedComponents(options: handleManageUpdateComponentsOptions): Promise<void> }) {
    if (activeUsedComponent.data === null) return null

    return (
        <>
            {activeUsedComponent.data.category === "navbars" && (
                <EditNavbarsData data={activeUsedComponent.data} activeUsedComponent={activeUsedComponent} handlePropsChange={handlePropsChange} />
            )}

            {activeUsedComponent.data.category === "containers" && (
                <EditContainersData websiteId={websiteId} seenLocation={seenLocation} data={activeUsedComponent.data} seenUsedComponent={activeUsedComponent} handlePropsChange={handlePropsChange} handleManageUsedComponents={handleManageUsedComponents} />
            )}
        </>
    )
}
