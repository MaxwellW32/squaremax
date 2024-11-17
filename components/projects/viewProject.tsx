"use client"
import { project, sharedDataSchema, sharedDataType, template, templateGlobalFormDataType } from '@/types'
import React, { useState, useEffect } from 'react'
import InteractwithTemplates from '../templates/InteractWithTemplates'
import TemplateSelector from '../templates/templateSelector'
import { toast } from 'react-hot-toast'
import { refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
import { addTemplateToProject, deleteTemplateFromProject } from '@/serverFunctions/handleProjectsToTemplates'

export default function ViewProject({ seenProject }: { seenProject: project }) {
    const [sideBarShowing, sideBarShowingSet] = useState(false)
    const [confirmDelete, confirmDeleteSet] = useState(false)
    const [saved, savedSet] = useState<"in progress" | boolean>(false)
    const [activeProjectTemplateId, activeProjectTemplateIdSet] = useState("")

    //set first seen template to activeProjectTemplateId on load
    useEffect(() => {
        if (seenProject.projectsToTemplates === undefined || seenProject.projectsToTemplates.length === 0) return

        activeProjectTemplateIdSet(seenProject.projectsToTemplates[0].id)
    }, [])

    async function handleTemplateSelection(templateIdObj: Pick<template, "id">) {
        try {
            //update project many many table with template
            await addTemplateToProject({ id: seenProject.id }, { id: templateIdObj.id })

            toast.success("using template")

            refreshProjectPath({ id: seenProject.id })

        } catch (error) {
            toast.error("error getting template")
            console.log(`$error`, error);
        }
    }

    return (
        <div style={{ position: "relative", zIndex: 0 }}>
            {/* side bar button */}
            {!sideBarShowing && (
                <button
                    onClick={() => { sideBarShowingSet(true) }}
                >show</button>
            )}

            {/* side bar */}
            <div style={{ display: sideBarShowing ? "grid" : "none", gap: "1rem", alignContent: "flex-start", position: "absolute", top: 0, left: 0, height: "100%", width: "min(500px, 90%)", zIndex: 1, backgroundColor: "beige" }}>
                <button
                    onClick={() => { sideBarShowingSet(false) }}
                >close</button>

                <p>Project name: {seenProject.name}</p>

                {/* make shared project data here, sync on server */}
                <div>
                    {seenProject.sharedData === null && (
                        <button
                            onClick={async () => {
                                try {
                                    const newSharedData: sharedDataType = {
                                        siteInfo: {
                                            phone: "",
                                            address: "",
                                            websiteName: "myNewWebsite",
                                            websiteTitle: "",
                                            websiteDescription: "",
                                            logo: "",
                                            opengraphLogo: "",
                                            email: "",
                                            workingHours: "",
                                            favicon: "",
                                            copyrightInformation: "",
                                        },
                                        gallery: [],
                                        products: [],
                                        services: [],
                                        socials: [],
                                        team: [],
                                        testimonials: [],
                                    }

                                    sharedDataSchema.parse(newSharedData)

                                    await updateProject({
                                        id: seenProject.id,
                                        sharedData: newSharedData
                                    })

                                    refreshProjectPath({ id: seenProject.id })
                                } catch (error) {
                                    console.log(`$err setting shared data`, error);
                                }
                            }}
                        >
                            create shared data
                        </button>
                    )}
                </div>

                <TemplateSelector setterFunc={handleTemplateSelection} />

                {seenProject.projectsToTemplates !== undefined && (
                    <>
                        {/* seeing templates on this project */}
                        <h2>Choose active template</h2>

                        {/* active template selection */}
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                            {seenProject.projectsToTemplates.map(eachProjectToTemplate => {

                                if (eachProjectToTemplate.template === undefined) return null

                                return (
                                    <div key={eachProjectToTemplate.id}>
                                        <button style={{ backgroundColor: eachProjectToTemplate.id === activeProjectTemplateId ? "blue" : "" }}
                                            onClick={() => {
                                                activeProjectTemplateIdSet(eachProjectToTemplate.id)
                                            }}
                                        >{eachProjectToTemplate.template.name}</button>

                                        <button
                                            onClick={async () => {
                                                if (!confirmDelete) {
                                                    // ensure user confirms deletion
                                                    confirmDeleteSet(true)
                                                    return
                                                }

                                                // clears template from projectsToTemplates
                                                await deleteTemplateFromProject({
                                                    id: seenProject.id
                                                })

                                                toast.success("template unlinked")

                                                refreshProjectPath({ id: seenProject.id })

                                                confirmDeleteSet(false)
                                            }}
                                        >{confirmDelete && "confirm "}unlink {!confirmDelete && "template"}</button>

                                        {confirmDelete && (
                                            <button
                                                onClick={() => {
                                                    confirmDeleteSet(false)
                                                }}
                                            >cancel</button>
                                        )}

                                        <button className='smallButton'
                                            onClick={async () => {
                                                try {
                                                    //get latest template info here
                                                    if (saved === "in progress" || eachProjectToTemplate.template === undefined) return

                                                    if (seenProject.sharedData === null || eachProjectToTemplate.specificData === null) {
                                                        console.log(`$didn't have shared data / specific data`);
                                                        return
                                                    }

                                                    const newTemplateGlobalFormData: templateGlobalFormDataType = {
                                                        sharedData: seenProject.sharedData,
                                                        specificData: eachProjectToTemplate.specificData,
                                                    }

                                                    const response = await fetch(`/api/downloadWebsite?githubUrl=${eachProjectToTemplate.template.github}`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                        },
                                                        body: JSON.stringify(newTemplateGlobalFormData),
                                                    })
                                                    const responseBlob = await response.blob()

                                                    const url = window.URL.createObjectURL(responseBlob);

                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${eachProjectToTemplate.template.name}.zip`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);

                                                } catch (error) {
                                                    toast.error("Error downloading zip")
                                                    console.error('Error downloading zip:', error);
                                                }
                                            }}
                                        >{saved === "in progress" ? "saving" : "Download Website"}</button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {seenProject.projectsToTemplates !== undefined && (
                <>
                    {seenProject.projectsToTemplates.map(eachProjectToTemplate => {

                        if (eachProjectToTemplate.template === undefined) return null
                        if (eachProjectToTemplate.id !== activeProjectTemplateId) return null

                        return (
                            <InteractwithTemplates key={eachProjectToTemplate.id} seenProject={seenProject} seenProjectToTemplate={eachProjectToTemplate} savedSet={savedSet} />
                        )
                    })}
                </>

            )}
        </div>
    )
}
