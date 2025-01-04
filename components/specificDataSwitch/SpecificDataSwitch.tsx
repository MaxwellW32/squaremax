"use client"
import { globalFormDataType, projectsToTemplate, specificDataSwitchSchema, specificDataSwitchType, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useEffect, useState } from 'react'
import EditSpecificDataForAAAA from './aaaa/EditSpecificDataForAAAA'
import ShowMore from '../showMore/ShowMore'

export default function SpecificDataSwitch({ seenSpecificData, seenProjectToTemplate, updateProjectsToTemplate }: { seenSpecificData: globalFormDataType["specificData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => Promise<boolean> }) {
    const [localSpecificData, localSpecificDataSet] = useState<specificDataSwitchType>(seenSpecificData)

    //react to changes above
    useEffect(() => {
        console.log(`$ran localSpecificDataSet from top`);
        localSpecificDataSet(JSON.parse(JSON.stringify(seenSpecificData)))
    }, [seenSpecificData])

    async function handleLocalSpecificData(sentSpecificData: specificDataSwitchType) {
        const newSentSpecificData = JSON.parse(JSON.stringify(sentSpecificData))
        const specificSwitchTest = specificDataSwitchSchema.safeParse(newSentSpecificData)

        console.log(`$seen here`, newSentSpecificData);

        //can send up to sync with server if successfull
        if (specificSwitchTest.success) {
            await updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificSwitchTest.data })
        } else {
            console.log(`$specificSwitchTest.error`, specificSwitchTest.error);
        }

        //update locally to view changes always
        localSpecificDataSet(newSentSpecificData)

        return true
    }

    return (
        <ShowMore label='Specific data' content={(
            <>
                {localSpecificData.templateId === "aaaa" && <EditSpecificDataForAAAA specificData={localSpecificData} seenProjectToTemplate={seenProjectToTemplate} handleLocalSpecificData={handleLocalSpecificData} />}
            </>
        )} />
    )
}
