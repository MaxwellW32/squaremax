"use client"
import { getTemplatesByName } from '@/serverFunctions/handleTemplates'
import { template } from '@/types'
import React, { useEffect, useRef, useState } from 'react'

export default function TemplateSelector({ setterFunc }: { setterFunc: (id: Pick<template, "id">) => void }) {
    const [userInteracting, userInteractingSet] = useState(false)

    const [search, searchSet] = useState("")
    const searchDebounce = useRef<NodeJS.Timeout>()

    const [seenTemplates, seenTemplatesSet] = useState<template[]>([])

    return (
        <div>
            <button
                onClick={() => { userInteractingSet(prev => !prev) }}
            >{userInteracting ? "close" : "Add a template"}</button>

            <div style={{ display: userInteracting ? "" : "none" }}>
                <input type='text' value={search} placeholder='Enter template name'
                    onChange={(e) => {
                        const seenText = e.target.value
                        searchSet(seenText)

                        if (searchDebounce.current) clearTimeout(searchDebounce.current)

                        searchDebounce.current = setTimeout(async () => {
                            if (seenText === "") return

                            const foundTemplates = await getTemplatesByName({ name: seenText })
                            seenTemplatesSet(foundTemplates)
                        }, 1000);
                    }}
                />

                {seenTemplates.length > 0 && (
                    <>
                        <h1>Select your template</h1>

                        <div style={{}}>
                            {seenTemplates.map(eachTemplate => {
                                return (
                                    <div key={eachTemplate.id} style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            setterFunc({ id: eachTemplate.id })
                                        }}
                                    >
                                        {eachTemplate.name}
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
