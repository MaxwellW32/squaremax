"use client"
import { globalFormDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React from 'react'

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    return (
        <div style={{ height: "200px", overflowY: "auto", border: "1px solid red" }}>
            <p style={{ whiteSpace: "wrap" }}> {JSON.stringify(seenLinkedData, null, 2)}</p>

            <button
                onClick={() => {
                    updateProjectsToTemplate({ option: "linked", id: seenProjectToTemplate.id, data: seenLinkedData })

                    console.log(`$seen click `);
                }}
            >test edit</button>
        </div>
    )
}
