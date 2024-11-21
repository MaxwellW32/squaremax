import { globalFormDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React from 'react'
import EditSpecificDataForAAAA from './templates/aaaa/EditSpecificDataForAAAA'

export default function SpecificDataSwitch({ seenSpecificData, seenProjectToTemplate, updateProjectsToTemplate }: { seenSpecificData: globalFormDataType["specificData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {

    return (
        <>
            {seenSpecificData.forTemplate === "aaaa" && <EditSpecificDataForAAAA specificData={seenSpecificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />}
        </>
    )
}
