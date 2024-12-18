import { globalFormDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React from 'react'
import EditSpecificDataForAAAA from './aaaa/EditSpecificDataForAAAA'
import ShowMore from '../showMore/ShowMore'

export default function SpecificDataSwitch({ seenSpecificData, seenProjectToTemplate, updateProjectsToTemplate }: { seenSpecificData: globalFormDataType["specificData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {

    return (
        <ShowMore label='Specific data' content={(
            <>
                {seenSpecificData.templateId === "aaaa" && <EditSpecificDataForAAAA specificData={seenSpecificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />}
            </>
        )} />
    )
}
