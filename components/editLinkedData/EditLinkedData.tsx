"use client"
import { globalFormDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React from 'react'

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    return (
        <div style={{ border: "1px solid red", display: "grid", alignContent: "flex-start" }}>
            <p style={{ whiteSpace: "pre", overflow: "auto" }}> {JSON.stringify(seenLinkedData, null, 2)}</p>

            <button
                onClick={() => {
                    updateProjectsToTemplate({ option: "linked", id: seenProjectToTemplate.id, data: seenLinkedData })

                    console.log(`$seen click `);
                }}
            >test edit</button>
        </div>
    )
}
