"use client"
import { project, projectToTemplatePlusType, projectsToTemplate, sharedDataSchema, sharedDataType, template, templateGlobalFormDataType } from '@/types'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import InteractwithTemplates from '../templates/InteractWithTemplates'
import TemplateSelector from '../templates/templateSelector'
import { toast } from 'react-hot-toast'
import { refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
import { addTemplateToProject, deleteTemplateFromProject } from '@/serverFunctions/handleProjectsToTemplates'
import styles from "./style.module.css"

export default function ViewProject({ seenProject }: { seenProject: project }) {
    const [project, projectSet] = useState<project>({ ...seenProject })

    const [projectsToTemplatesPlus, projectsToTemplatesPlusSet] = useState<projectToTemplatePlusType[]>([])

    const [showSideBar, showSideBarSet] = useState(false)
    const [dimSideBar, dimSideBarSet] = useState(false)
    const [fitActive, fitActiveSet] = useState(false)
    const [contentScale, contentScaleSet] = useState(1)

    type sizeOptionType = {
        name: string,
        width: number,
        height: number,
        active: boolean,
        icon: JSX.Element
    }
    const [sizeOptions, sizeOptionsSet] = useState<sizeOptionType[]>([
        {
            name: "mobile",
            width: 375,
            height: 667,
            active: false,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M80 0C44.7 0 16 28.7 16 64l0 384c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L80 0zM192 400a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
        },
        {
            name: "tablet",
            width: 768,
            height: 1024,
            active: false,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM176 432l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" /></svg>
        },
        {
            name: "desktop",
            width: 1920,
            height: 1080,
            active: true,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l176 0-10.7 32L160 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-69.3 0L336 416l176 0c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0zM512 64l0 224L64 288 64 64l448 0z" /></svg>
        },
    ])

    const activeSizeOption = useMemo(() => {
        return sizeOptions.find(eachSizeOption => eachSizeOption.active)
    }, [sizeOptions])

    const middleBarContentRef = useRef<HTMLDivElement | null>(null)
    const [middleBarContentSize, middleBarContentSizeSet] = useState({ width: 0, height: 0 })

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
            project.projectsToTemplates.forEach((eachServerProjectToTemplate: projectsToTemplate) => {
                const foundInCurrentIndex = projectToTemplatePlusSynced.findIndex(eachProjectsToTemplatePlusInServer => eachProjectsToTemplatePlusInServer.id === eachServerProjectToTemplate.id)

                // add to the current list
                if (foundInCurrentIndex < 0) {
                    const newProjectsToTemplatePlus: projectToTemplatePlusType = {
                        ...eachServerProjectToTemplate,
                        confirmDelete: false,
                        saveState: null,
                        active: false,
                        connected: false
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

    //get proper height of middleBarContent element
    useEffect(() => {
        getMiddleBarContentSize()

        // keep height current if window size changes
        window.addEventListener("resize", getMiddleBarContentSize)

        return () => { window.removeEventListener("resize", getMiddleBarContentSize) }
    }, [])

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

    function updateProjectToTemplatePlus(id: string, data: Partial<projectToTemplatePlusType>) {
        projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
            const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachProjectToTemplatePlus => {

                if (eachProjectToTemplatePlus.id === id) {
                    eachProjectToTemplatePlus = { ...eachProjectToTemplatePlus, ...data }
                }

                return eachProjectToTemplatePlus
            })

            return newProjectToTemplatePlus
        })
    }

    function getMiddleBarContentSize() {
        if (middleBarContentRef.current === null) return

        middleBarContentSizeSet({ height: middleBarContentRef.current.clientHeight - 20, width: middleBarContentRef.current.clientWidth })
    }

    function fitElement(elementWidth: number, elementHeight: number, contElementWidth: number, contElementHeight: number) {
        const scaleX = contElementWidth / elementWidth
        const scaleY = contElementHeight / elementHeight
        return Math.min(scaleX, scaleY);
    }

    return (
        <div className={styles.barCont}>
            <div className={styles.leftBar} style={{ display: showSideBar ? "" : "none", opacity: dimSideBar ? 0.1 : "", }}
                onMouseEnter={() => { dimSideBarSet(false) }}
                onMouseLeave={() => { dimSideBarSet(true) }}
            >
                <h2>{project.name}</h2>

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

                {/* active template selection */}
                {projectsToTemplatesPlus.length > 0 && (
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        {projectsToTemplatesPlus.map(eachProjectToTemplatePlus => {

                            if (eachProjectToTemplatePlus.template === undefined) return null

                            return (
                                <div key={eachProjectToTemplatePlus.id} className={styles.templateOptionCont}>
                                    <div style={{ width: "1rem", aspectRatio: "1/1", backgroundColor: eachProjectToTemplatePlus.connected ? "green" : "#eee" }}>
                                    </div>

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
                )}
            </div>

            <div className={styles.middleBar}>
                <div className={styles.middleBarSettings}>
                    <button
                        onClick={() => {
                            showSideBarSet(prev => !prev)
                            dimSideBarSet(false)
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" /></svg>
                    </button>

                    <div className={styles.sizeOptions}>
                        {sizeOptions.map(eachSizeOption => {
                            return (
                                <button key={eachSizeOption.name}
                                    onClick={() => {
                                        sizeOptionsSet(prevSizeOptions => {
                                            const newSizeOptions = prevSizeOptions.map(eachSmallSizeOption => {
                                                if (eachSmallSizeOption.name === eachSizeOption.name) {
                                                    eachSmallSizeOption.active = true
                                                } else {
                                                    eachSmallSizeOption.active = false
                                                }

                                                return eachSmallSizeOption
                                            })

                                            return newSizeOptions
                                        })

                                        fitActiveSet(false)
                                    }}
                                >
                                    {eachSizeOption.icon}
                                </button>
                            )
                        })}
                    </div>

                    {/* only show fit button if overflowing on width */}
                    <button
                        onClick={() => {
                            if (activeSizeOption === undefined || middleBarContentRef.current === null) return;

                            if (!fitActive) {
                                fitActiveSet(true)

                                const scale = fitElement(activeSizeOption.width, activeSizeOption.height, middleBarContentSize.width, middleBarContentSize.height);
                                contentScaleSet(scale)
                            } else {
                                fitActiveSet(false)
                            }

                            // ensure horizantal scroll is left
                            middleBarContentRef.current.scrollLeft = 0
                        }}
                    >
                        fit
                    </button>
                </div>

                <div ref={middleBarContentRef} className={`${styles.middleBarContent} noScrollBar`} style={{ overflow: fitActive ? "hidden" : "" }}>
                    {project.projectsToTemplates !== undefined && project.projectsToTemplates.length > 0 && (
                        <>
                            {project.projectsToTemplates.map(eachProjectToTemplate => {
                                if (eachProjectToTemplate.template === undefined) return null

                                // ensure only original projectsToTemplates are used
                                const foundProjectToTemplatePlus = projectsToTemplatesPlus.find(eachProjectsToTemplatesPlus => eachProjectsToTemplatesPlus.id === eachProjectToTemplate.id)
                                if (foundProjectToTemplatePlus === undefined) return null

                                if (!foundProjectToTemplatePlus.active) return null

                                if (activeSizeOption === undefined) {
                                    console.log(`$no size option active`);
                                    return null
                                }

                                return (
                                    <InteractwithTemplates
                                        style={{ scale: fitActive ? contentScale : "", transformOrigin: "top left" }}
                                        key={eachProjectToTemplate.id}
                                        seenProject={project}
                                        seenProjectToTemplate={eachProjectToTemplate}
                                        updateProjectToTemplatePlus={updateProjectToTemplatePlus}
                                        width={activeSizeOption.width}
                                        height={fitActive ? activeSizeOption.height : middleBarContentSize.height} />
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}


