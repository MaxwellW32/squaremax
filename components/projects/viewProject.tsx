"use client"
import { project, template } from '@/types'
import React, { useState } from 'react'
import InteractwithTemplates from '../templates/InteractWithTemplates'
import TemplateSelector from '../templates/templateSelector'
import { toast } from 'react-hot-toast'
import { refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'

//view project
//choose a template
//start editing template button
//when confirmed show template
//option to delete template from project

//make a template chooser
//returns a template Id

export default function ViewProject({ seenProject }: { seenProject: project }) {
    const [sideBarShowing, sideBarShowingSet] = useState(false)
    const [confirmDelete, confirmDeleteSet] = useState(false)

    async function handleTemplateSelectorId(templateId: Pick<template, "id">) {
        try {
            // ensure only chooses a new template when empty
            if (seenProject.template !== undefined && seenProject.template !== null) {
                toast.error("clear template before replacing")
                return
            }

            // update project with new template id
            await updateProject({
                id: seenProject.id,
                templateId: templateId.id
            })

            toast.success("using template")

            refreshProjectPath({ name: seenProject.name })

        } catch (error) {
            toast.error("error getting template")
            console.log(`$error`, error);
        }
    }

    return (
        <div style={{ position: "relative", backgroundColor: "green", zIndex: 0 }}>
            {/* side bar button */}
            {!sideBarShowing && (
                <div
                    onClick={() => { sideBarShowingSet(true) }}
                >
                    <button>show</button>
                </div>
            )}

            {/* side bar */}
            <div style={{ display: sideBarShowing ? "" : "none", position: "absolute", top: 0, left: 0, height: "100%", width: "min(500px, 90%)", zIndex: 1, backgroundColor: "beige" }}>
                <button
                    onClick={() => { sideBarShowingSet(false) }}
                >close</button>

                <p>Project: {seenProject.name}</p>

                <TemplateSelector setterFunc={handleTemplateSelectorId} />

                {seenProject.template !== undefined && seenProject.template !== null && (
                    <div>
                        <button className='smallButton'
                            onClick={async () => {
                                try {
                                    //get latest template info here

                                    if (seenProject.templateData === null || seenProject.template === null || seenProject.template === undefined) return

                                    const response = await fetch(`/api/downloadWebsite?githubUrl=${seenProject.template.github}`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(seenProject.templateData),
                                    })
                                    const responseBlob = await response.blob()

                                    const url = window.URL.createObjectURL(responseBlob);

                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${seenProject.template.name}.zip`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);

                                } catch (error) {
                                    toast.error("Error downloading zip")
                                    console.error('Error downloading zip:', error);
                                }
                            }}
                        >
                            Download Website
                        </button>

                        <button
                            onClick={async () => {
                                if (!confirmDelete) {
                                    // ensure user confirms deletion
                                    confirmDeleteSet(true)
                                    return
                                }

                                // clears template id and data
                                await updateProject({
                                    id: seenProject.id,
                                    templateId: null,
                                    templateData: null
                                })

                                toast.success("template unlinked")
                                refreshProjectPath({ name: seenProject.name })

                                confirmDeleteSet(false)
                            }}
                        >{confirmDelete && "confirm "}unlink template</button>

                        {confirmDelete && (
                            <button
                                onClick={() => {
                                    confirmDeleteSet(false)
                                }}
                            >cancel</button>
                        )}
                    </div>
                )}
            </div>

            <InteractwithTemplates seenProject={seenProject} />
        </div>
    )
}
