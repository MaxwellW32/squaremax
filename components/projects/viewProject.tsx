"use client"
import { project, projectsToTemplate, sharedDataSchema, sharedDataType, template, templateGlobalFormDataType } from '@/types'
import React, { useState, useEffect } from 'react'
import InteractwithTemplates from '../templates/InteractWithTemplates'
import TemplateSelector from '../templates/templateSelector'
import { toast } from 'react-hot-toast'
import { refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
import { addTemplateToProject, deleteTemplateFromProject } from '@/serverFunctions/handleProjectsToTemplates'

export default function ViewProject({ seenProject }: { seenProject: project }) {
    const [project, projectSet] = useState<project>({ ...seenProject })

    type projectToTemplatePlusType = projectsToTemplate & {
        confirmDelete: boolean,
        saveState: "saved" | "saving" | null,
        active: boolean
    }
    const [projectsToTemplatesPlus, projectsToTemplatesPlusSet] = useState<projectToTemplatePlusType[]>([])

    const [sideBarShowing, sideBarShowingSet] = useState(false)

    //keep projects in sync with server
    useEffect(() => {
        projectSet({ ...seenProject })
    }, [seenProject])

    //keep projectsToTemplatePlus synced with server
    useEffect(() => {
        projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
            const newProjectToTemplatePlus = [...prevProjectToTemplatePlus]
            //if nothing on server return []
            if (project.projectsToTemplates === undefined) return newProjectToTemplatePlus

            // current list reduced to only those on server
            let projectToTemplatePlusSynced = newProjectToTemplatePlus.filter(eachProjectToTemplatePlus => {
                if (project.projectsToTemplates === undefined) return false

                //look through server current list
                const foundInServerIndex = project.projectsToTemplates.findIndex(eachServerProjectToTemplate => eachServerProjectToTemplate.id === eachProjectToTemplatePlus.id)

                if (foundInServerIndex < 0) {
                    return false
                } else {
                    return true
                }
            })

            // local list has additional server projectsToTemplates added
            project.projectsToTemplates.forEach(eachServerProjectToTemplate => {
                const foundInCurrentIndex = projectToTemplatePlusSynced.findIndex(eachProjectsToTemplatePlusInServer => eachProjectsToTemplatePlusInServer.id === eachServerProjectToTemplate.id)

                // add to the current list
                if (foundInCurrentIndex < 0) {
                    const newProjectsToTemplatePlus: projectToTemplatePlusType = {
                        ...eachServerProjectToTemplate,
                        confirmDelete: false,
                        saveState: null,
                        active: false
                    }

                    projectToTemplatePlusSynced = [...projectToTemplatePlusSynced, newProjectsToTemplatePlus]
                }
            })

            //if nothing active in list make first template active
            const activeCheckIndex = projectToTemplatePlusSynced.findIndex(eachProjectToTemplatePlusSynced => eachProjectToTemplatePlusSynced.active)
            if (activeCheckIndex < 0 && projectToTemplatePlusSynced.length > 0) {
                projectToTemplatePlusSynced[0].active = true
            }

            return projectToTemplatePlusSynced
        })

    }, [project.projectsToTemplates])

    async function handleTemplateSelection(templateIdObj: Pick<template, "id">) {
        try {
            //update project many many table with template
            await addTemplateToProject({ id: project.id }, { id: templateIdObj.id })

            toast.success("using template")

            refreshProjectPath({ id: project.id })

        } catch (error) {
            toast.error("error getting template")
            console.log(`$error`, error);
        }
    }

    function markTemplateSave(id: string, option: "saving" | "saved") {
        projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
            const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachProjectToTemplatePlus => {

                if (eachProjectToTemplatePlus.id === id) {
                    if (option === "saving") {

                        eachProjectToTemplatePlus.saveState = "saving"

                    } else if (option === "saved") {
                        eachProjectToTemplatePlus.saveState = "saved"
                    }
                }

                return eachProjectToTemplatePlus
            })

            return newProjectToTemplatePlus
        })
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

                <p>Project name: {project.name}</p>

                {/* make shared project data here, sync on server */}
                <div>
                    {project.sharedData === null && (
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
                                        id: project.id,
                                        sharedData: newSharedData
                                    })

                                    refreshProjectPath({ id: project.id })
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

                {projectsToTemplatesPlus.length > 0 && (
                    <>
                        {/* seeing templates on this project */}
                        <h2>Choose active template</h2>

                        {/* active template selection */}
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                            {projectsToTemplatesPlus.map(eachProjectToTemplatePlus => {

                                if (eachProjectToTemplatePlus.template === undefined) return null

                                return (
                                    <div key={eachProjectToTemplatePlus.id}>
                                        <button style={{ backgroundColor: eachProjectToTemplatePlus.active ? "blue" : "" }}
                                            onClick={() => {
                                                projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                    const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                        eachSmallProjectToTemplatePlus.active = false

                                                        if (eachSmallProjectToTemplatePlus.id === eachProjectToTemplatePlus.id) {
                                                            eachSmallProjectToTemplatePlus.active = true
                                                        }

                                                        return eachProjectToTemplatePlus
                                                    })

                                                    return newProjectToTemplatePlus
                                                })
                                            }}
                                        >{eachProjectToTemplatePlus.template.name}</button>

                                        <button
                                            onClick={async () => {
                                                if (!eachProjectToTemplatePlus.confirmDelete) {
                                                    // ensure user confirms deletion
                                                    projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                        const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                            eachSmallProjectToTemplatePlus.confirmDelete = false

                                                            if (eachSmallProjectToTemplatePlus.id === eachProjectToTemplatePlus.id) {
                                                                eachSmallProjectToTemplatePlus.confirmDelete = true
                                                            }

                                                            return eachProjectToTemplatePlus
                                                        })

                                                        return newProjectToTemplatePlus
                                                    })

                                                    //stop here on first delete try
                                                    return
                                                }

                                                // clears template from projectsToTemplates
                                                await deleteTemplateFromProject({
                                                    id: project.id
                                                })

                                                toast.success("template unlinked")

                                                refreshProjectPath({ id: project.id })

                                                projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                    const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                        eachSmallProjectToTemplatePlus.confirmDelete = false

                                                        return eachProjectToTemplatePlus
                                                    })

                                                    return newProjectToTemplatePlus
                                                })
                                            }}
                                        >{eachProjectToTemplatePlus.confirmDelete && "confirm "}remove {!eachProjectToTemplatePlus.confirmDelete && "template"}</button>

                                        {eachProjectToTemplatePlus.confirmDelete && (
                                            <button
                                                onClick={() => {
                                                    projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                        const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                            eachSmallProjectToTemplatePlus.confirmDelete = false

                                                            return eachProjectToTemplatePlus
                                                        })

                                                        return newProjectToTemplatePlus
                                                    })
                                                }}
                                            >cancel</button>
                                        )}

                                        <button
                                            onClick={async () => {
                                                console.log(`$seeing click`);
                                                try {
                                                    //get latest template info here
                                                    if (eachProjectToTemplatePlus.saveState === "saving") {
                                                        toast.error("saving in progress")
                                                        return
                                                    }
                                                    if (eachProjectToTemplatePlus.template === undefined) {
                                                        toast.error("no template to download")
                                                        return
                                                    }

                                                    if (project.sharedData === null || eachProjectToTemplatePlus.specificData === null) {
                                                        toast.error("please add both shared and specific data")
                                                        return
                                                    }

                                                    const newTemplateGlobalFormData: templateGlobalFormDataType = {
                                                        sharedData: project.sharedData,
                                                        specificData: eachProjectToTemplatePlus.specificData,
                                                    }

                                                    const response = await fetch(`/api/downloadWebsite?githubUrl=${eachProjectToTemplatePlus.template.github}`, {
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
                                                    a.download = `${eachProjectToTemplatePlus.template.name}.zip`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);

                                                } catch (error) {
                                                    toast.error("Error downloading zip")
                                                    console.error('Error downloading zip:', error);
                                                }
                                            }}
                                        >{eachProjectToTemplatePlus.saveState === "saving" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg>
                                        )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {project.projectsToTemplates !== undefined && project.projectsToTemplates.length > 0 && (
                <>
                    {project.projectsToTemplates.map(eachProjectToTemplate => {
                        if (eachProjectToTemplate.template === undefined) return null

                        // ensure only original projectsToTemplates are used
                        const foundProjectToTemplatePlus = projectsToTemplatesPlus.find(eachProjectsToTemplatesPlus => eachProjectsToTemplatesPlus.id === eachProjectToTemplate.id)
                        if (foundProjectToTemplatePlus === undefined) return null

                        if (!foundProjectToTemplatePlus.active) return null

                        return (
                            <InteractwithTemplates key={eachProjectToTemplate.id} seenProject={project} seenProjectToTemplate={eachProjectToTemplate} markTemplateSave={markTemplateSave} />
                        )
                    })}
                </>

            )}
        </div>
    )
}
