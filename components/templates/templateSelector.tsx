"use client"
import { getTemplateById, getTemplatesByName } from '@/serverFunctions/handleTemplates'
import { template } from '@/types'
import React, { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TemplateSelector({ setterFunc }: { setterFunc: (templateIdObj: Pick<template, "id">) => void }) {
    const [userInteracting, userInteractingSet] = useState(false)
    type selectionType = "id" | "name"
    const [selectionOptions,] = useState<selectionType[]>(["id", "name"])
    const [currentSelection, currentSelectionSet] = useState<selectionType>("id")


    const [search, searchSet] = useState("")
    const searchDebounce = useRef<NodeJS.Timeout>()

    const [seenTemplates, seenTemplatesSet] = useState<template[]>([])

    return (
        <div>
            <button className='mainButton'
                onClick={() => { userInteractingSet(prev => !prev) }}
            >{userInteracting ? "close" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "grid" : "none", alignContent: "flex-start", padding: "1rem", gap: "1rem", border: "1px solid rgb(var(--shade1))" }}>
                <h3>Search using</h3>

                {/* options to change search type */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "" }}>
                    {selectionOptions.map(eachOption => {
                        return (
                            <button key={eachOption} className='mainButton' style={{ backgroundColor: eachOption === currentSelection ? "rgb(var(--color1))" : "" }}
                                onClick={() => {
                                    currentSelectionSet(eachOption)
                                }}
                            >{eachOption}</button>
                        )
                    })}
                </div>

                <input type='text' value={search} placeholder={currentSelection === "id" ? "Enter template id" : "Enter template name"}
                    onChange={(e) => {
                        const seenText = e.target.value
                        searchSet(seenText)

                        if (searchDebounce.current) clearTimeout(searchDebounce.current)

                        searchDebounce.current = setTimeout(async () => {
                            if (seenText === "") return

                            if (currentSelection === "id") {
                                const foundTemplates = await getTemplateById({ id: seenText })

                                if (foundTemplates === undefined) {
                                    toast.error("template id not found")
                                    return
                                }

                                seenTemplatesSet([foundTemplates])

                            } else if (currentSelection === "name") {
                                const foundTemplates = await getTemplatesByName({ name: seenText })

                                seenTemplatesSet(foundTemplates)
                            }

                        }, 1000);
                    }}
                />

                {seenTemplates.length > 0 && (
                    <>
                        <h3>Select your template</h3>

                        <div style={{ backgroundColor: "white", overflow: "auto", display: "grid", gridAutoFlow: "column", gridAutoColumns: "80%" }}>
                            {seenTemplates.map(eachTemplate => {
                                return (
                                    <div key={eachTemplate.id} style={{ padding: "1rem", border: "1px solid rgb(var(--shade1))", display: "grid", justifyItems: "center", alignContent: "flex-start", gap: ".5rem" }}>
                                        <h3>{eachTemplate.name}</h3>

                                        <button className='mainButton'
                                            onClick={() => {
                                                setterFunc({ id: eachTemplate.id })
                                            }}
                                        >select</button>
                                        {/* need to display images */}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
