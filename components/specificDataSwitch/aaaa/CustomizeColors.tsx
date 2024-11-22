"use client"
import React from 'react'
import styles from "./style.module.css"
import { specificDataForAAAAType } from '@/templateSpecificDataTypes/aaaaTypes'
import { projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'

export default function CustomizeColors({ specificData, seenProjectToTemplate, updateProjectsToTemplate }: { specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {


    return (
        <div style={{ display: "grid", paddingLeft: ".5rem", gap: "1rem" }}>
            {Object.entries(specificData.colors).map(eachColorTypeEntry => {
                const eachColorTypeKey = eachColorTypeEntry[0]
                const eachColorTypeObj = eachColorTypeEntry[1]

                return (
                    <div key={eachColorTypeKey} style={{ display: "grid", gap: "1rem" }}>
                        <label>{eachColorTypeKey}</label>

                        {Object.entries(eachColorTypeObj).map(eachColorEntry => {
                            const eachColorKey = eachColorEntry[0]
                            const eachColorValue = eachColorEntry[1]

                            return (
                                <div key={eachColorKey} style={{ paddingLeft: ".5rem", display: "flex", alignItems: "center", gap: "var(--smallGap)", flexWrap: "wrap" }}>
                                    <label>{eachColorKey}</label>

                                    <input className={styles.colorInput} type="color" name={eachColorKey} value={eachColorValue} placeholder={"Enter a color"}
                                        onChange={(e) => {
                                            //just to refresh for the useEffect
                                            specificData.colors = { ...specificData.colors }

                                            specificData.colors[eachColorTypeKey][eachColorKey] = e.target.value

                                            updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}
