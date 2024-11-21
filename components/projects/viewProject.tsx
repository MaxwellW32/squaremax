"use client"
import { globalFormDataSchema, linkedDataSchema, project, projectToTemplatePlusType, projectsToTemplate, specificDataSwitchSchema, template, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import InteractwithTemplates from '../templates/InteractWithTemplates'
import TemplateSelector from '../templates/templateSelector'
import { toast } from 'react-hot-toast'
import { refreshProjectPath } from '@/serverFunctions/handleProjects'
import { addTemplateToProject, deleteTemplateFromProject, updateTemplateInProject } from '@/serverFunctions/handleProjectsToTemplates'
import styles from "./style.module.css"
import EditLinkedData from '../editLinkedData/EditLinkedData'
import SpecificDataSwitch from '../specificDataSwitch/SpecificDataSwitch'

//may need...
//everything stored on template - specific and linked starter...
//both template and main share the same schema for linked, then specific data depending on the template id...
//sent up to main to edit...
////template constanlty sends update signal - main website responds - connected...
//template then listens for changes to display... 

export default function ViewProject({ projectFromServer }: { projectFromServer: project }) {
    const [seenProject, seenProjectSet] = useState<project>({ ...projectFromServer })

    const [projectsToTemplatesPlus, projectsToTemplatesPlusSet] = useState<projectToTemplatePlusType[]>([])

    const activeProjectToTemplate = useMemo(() => {
        if (seenProject.projectsToTemplates === undefined) return undefined

        const activeProjectToTemplatePlus = projectsToTemplatesPlus.find(eachProjectsToTemplatesPlus => eachProjectsToTemplatesPlus.moreInfo.active)
        if (activeProjectToTemplatePlus === undefined) return undefined

        const seenActiveProjectToTemplate = seenProject.projectsToTemplates.find(eachProjectsToTemplates => eachProjectsToTemplates.id === activeProjectToTemplatePlus.id)

        return seenActiveProjectToTemplate
    }, [seenProject.projectsToTemplates, projectsToTemplatesPlus])

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

    const syncDebounce = useRef<NodeJS.Timeout>()

    //keep projects in sync with server
    useEffect(() => {
        seenProjectSet({ ...projectFromServer })
    }, [projectFromServer])

    //keep projectsToTemplatePlus synced with seenProject projectsToTemplates - plus make active if empty
    useEffect(() => {
        projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
            //ensures more info data is preserved while also being the latest server copy of projectToTemplate
            if (seenProject.projectsToTemplates === undefined) return prevProjectToTemplatePlus

            const newProjectsToTemplatesPlus: projectToTemplatePlusType[] = seenProject.projectsToTemplates.map(eachProjectsToTemplates => {
                //find the more info that already exits in this session
                const foundProjectToTemplatePlus = prevProjectToTemplatePlus.find(eachFindProjectToTemplatePlus => eachFindProjectToTemplatePlus.id === eachProjectsToTemplates.id)

                // if no info then start new
                const newFoundMoreInfo: projectToTemplatePlusType["moreInfo"] = {
                    active: false,
                    confirmDelete: false,
                    connected: false,
                    saveState: "saved"
                }

                //assign the new projectTemplatePlus items
                const newProjectToTemplatePlus: projectToTemplatePlusType = {
                    ...eachProjectsToTemplates,
                    moreInfo: foundProjectToTemplatePlus === undefined ? newFoundMoreInfo : foundProjectToTemplatePlus.moreInfo
                }

                return newProjectToTemplatePlus
            })

            //if nothing active in list make first template active
            const activeCheckIndex = newProjectsToTemplatesPlus.findIndex(eachFindNewProjectsToTemplatesPlus => eachFindNewProjectsToTemplatesPlus.moreInfo.active)
            if (activeCheckIndex < 0 && newProjectsToTemplatesPlus.length > 0) {
                newProjectsToTemplatesPlus[0].moreInfo.active = true
            }

            return newProjectsToTemplatesPlus
        })

    }, [seenProject.projectsToTemplates])

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
            await addTemplateToProject({ id: seenProject.id }, { id: templateIdObj.id })

            toast.success("using template")

            refreshProjectPath({ id: seenProject.id })

        } catch (error) {
            toast.error("error getting template")
            console.log(`$error`, error);
        }
    }

    function updateProjectsToTemplatePlus(id: string, data: Partial<projectToTemplatePlusType["moreInfo"]>) {
        projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
            const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachProjectToTemplatePlus => {

                if (eachProjectToTemplatePlus.id === id) {
                    eachProjectToTemplatePlus = { ...eachProjectToTemplatePlus, moreInfo: { ...eachProjectToTemplatePlus.moreInfo, ...data } }
                }

                return eachProjectToTemplatePlus
            })

            return newProjectToTemplatePlus
        })
    }

    function updateProjectsToTemplate(choiceObj: updateProjectsToTemplateFunctionType) {
        try {
            let seenUpdatedProjectsToTemplates: projectsToTemplate | null = null

            seenProjectSet(prevSeenProject => {
                const newSeenProject = { ...prevSeenProject }

                if (newSeenProject.projectsToTemplates === undefined) return prevSeenProject

                //cause refresh on anything listening to projectsToTemplates
                newSeenProject.projectsToTemplates = [...newSeenProject.projectsToTemplates]

                //update linked data
                if (choiceObj.option === "linked") {
                    newSeenProject.projectsToTemplates = newSeenProject.projectsToTemplates.map(eachProjectsToTemplates => {
                        if (eachProjectsToTemplates.id === choiceObj.id) {
                            linkedDataSchema.parse(choiceObj.data)

                            eachProjectsToTemplates = { ...eachProjectsToTemplates, globalFormData: eachProjectsToTemplates.globalFormData === null ? null : { ...eachProjectsToTemplates.globalFormData, linkedData: choiceObj.data } }
                            console.log(`$updated linked data`);
                        }

                        return eachProjectsToTemplates
                    })

                    //update specific data
                } else if (choiceObj.option === "specific") {
                    newSeenProject.projectsToTemplates = newSeenProject.projectsToTemplates.map(eachProjectsToTemplates => {
                        if (eachProjectsToTemplates.id === choiceObj.id) {
                            specificDataSwitchSchema.parse(choiceObj.data)

                            eachProjectsToTemplates = { ...eachProjectsToTemplates, globalFormData: eachProjectsToTemplates.globalFormData === null ? null : { ...eachProjectsToTemplates.globalFormData, specificData: choiceObj.data } }
                            console.log(`$updated specific data`);
                        }

                        return eachProjectsToTemplates
                    })

                } else if (choiceObj.option === "globalFormData") {
                    newSeenProject.projectsToTemplates = newSeenProject.projectsToTemplates.map(eachProjectsToTemplates => {
                        if (eachProjectsToTemplates.id === choiceObj.id) {
                            globalFormDataSchema.parse(choiceObj.data)

                            eachProjectsToTemplates = { ...eachProjectsToTemplates, globalFormData: choiceObj.data }
                            console.log(`$updated globalFormData data`);
                        }

                        return eachProjectsToTemplates
                    })

                }

                const updatedProjectsToTemplates = newSeenProject.projectsToTemplates.find(eachFindProjectsToTemplates => eachFindProjectsToTemplates.id === choiceObj.id)
                if (updatedProjectsToTemplates === undefined) {
                    console.log(`$didn't see projectsToTemplates that just got updated`);
                    return prevSeenProject
                }

                seenUpdatedProjectsToTemplates = updatedProjectsToTemplates

                return newSeenProject
            })

            //write latest changes to server
            if (syncDebounce.current) clearTimeout(syncDebounce.current)
            updateProjectsToTemplatePlus(choiceObj.id, { saveState: "saving" })

            syncDebounce.current = setTimeout(async () => {
                if (seenUpdatedProjectsToTemplates === null) {
                    console.log(`$not seeing update that just happened from set state seeing default null`);
                    return
                }

                // update projects to templates with new template data
                await updateTemplateInProject({
                    id: choiceObj.id,
                    globalFormData: seenUpdatedProjectsToTemplates.globalFormData
                })

                updateProjectsToTemplatePlus(choiceObj.id, { saveState: "saved" })
                console.log(`$saved templateData`);
                toast.success("saved")
            }, 5000);

        } catch (error) {
            console.log(`$error saving updateProjectsToTemplate`, error);
            toast.error("error saving data")
        }
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
                <h2>{seenProject.name}</h2>

                {activeProjectToTemplate !== undefined && activeProjectToTemplate.globalFormData !== null && (
                    <>
                        {/* edit shared data */}
                        <EditLinkedData seenProjectToTemplate={activeProjectToTemplate} seenLinkedData={activeProjectToTemplate.globalFormData.linkedData} updateProjectsToTemplate={updateProjectsToTemplate} />

                        {/* edit specific data switch */}
                        <SpecificDataSwitch seenProjectToTemplate={activeProjectToTemplate} seenSpecificData={activeProjectToTemplate.globalFormData.specificData} updateProjectsToTemplate={updateProjectsToTemplate} />
                    </>
                )}

                <TemplateSelector setterFunc={handleTemplateSelection} />

                {/* active template selection */}
                {projectsToTemplatesPlus.length > 0 && (
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        {projectsToTemplatesPlus.map(eachProjectToTemplatePlus => {

                            if (eachProjectToTemplatePlus.template === undefined) return null

                            return (
                                <div key={eachProjectToTemplatePlus.id} className={styles.templateOptionCont}>
                                    <div style={{ width: "1rem", aspectRatio: "1/1", backgroundColor: eachProjectToTemplatePlus.moreInfo.connected ? "green" : "#eee" }}>
                                    </div>

                                    <button style={{ backgroundColor: eachProjectToTemplatePlus.moreInfo.active ? "blue" : "" }}
                                        onClick={() => {
                                            projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                    eachSmallProjectToTemplatePlus.moreInfo.active = false

                                                    if (eachSmallProjectToTemplatePlus.id === eachProjectToTemplatePlus.id) {
                                                        eachSmallProjectToTemplatePlus.moreInfo.active = true
                                                    }

                                                    return eachProjectToTemplatePlus
                                                })

                                                return newProjectToTemplatePlus
                                            })
                                        }}
                                    >{eachProjectToTemplatePlus.template.name}</button>

                                    <button
                                        onClick={async () => {
                                            if (!eachProjectToTemplatePlus.moreInfo.confirmDelete) {
                                                // ensure user confirms deletion
                                                projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                    const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                        eachSmallProjectToTemplatePlus.moreInfo.confirmDelete = false

                                                        if (eachSmallProjectToTemplatePlus.id === eachProjectToTemplatePlus.id) {
                                                            eachSmallProjectToTemplatePlus.moreInfo.confirmDelete = true
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
                                                id: seenProject.id
                                            })

                                            toast.success("template unlinked")

                                            refreshProjectPath({ id: seenProject.id })

                                            projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                    eachSmallProjectToTemplatePlus.moreInfo.confirmDelete = false

                                                    return eachProjectToTemplatePlus
                                                })

                                                return newProjectToTemplatePlus
                                            })
                                        }}
                                    >{eachProjectToTemplatePlus.moreInfo.confirmDelete && "confirm "}remove {!eachProjectToTemplatePlus.moreInfo.confirmDelete && "template"}</button>

                                    {eachProjectToTemplatePlus.moreInfo.confirmDelete && (
                                        <button
                                            onClick={() => {
                                                projectsToTemplatesPlusSet(prevProjectToTemplatePlus => {
                                                    const newProjectToTemplatePlus = prevProjectToTemplatePlus.map(eachSmallProjectToTemplatePlus => {
                                                        eachSmallProjectToTemplatePlus.moreInfo.confirmDelete = false

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
                                                if (eachProjectToTemplatePlus.moreInfo.saveState === "saving") {
                                                    toast.error("saving in progress")
                                                    return
                                                }
                                                if (eachProjectToTemplatePlus.template === undefined) {
                                                    toast.error("no template to download")
                                                    return
                                                }

                                                const response = await fetch(`/api/downloadWebsite?githubUrl=${eachProjectToTemplatePlus.template.github}`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify(eachProjectToTemplatePlus.globalFormData),
                                                })
                                                const responseBlob = await response.blob()

                                                const url = window.URL.createObjectURL(responseBlob);

                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${eachProjectToTemplatePlus.template.name}.zip`;//change to packagejson name
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);

                                            } catch (error) {
                                                toast.error("Error downloading zip")
                                                console.error('Error downloading zip:', error);
                                            }
                                        }}
                                    >{eachProjectToTemplatePlus.moreInfo.saveState === "saving" ? (
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
                    {seenProject.projectsToTemplates !== undefined && seenProject.projectsToTemplates.length > 0 && (
                        <>
                            {seenProject.projectsToTemplates.map(eachProjectToTemplate => {
                                //only show active template
                                if (activeProjectToTemplate === undefined || activeProjectToTemplate.id !== eachProjectToTemplate.id) {
                                    return null
                                }

                                if (activeSizeOption === undefined) {
                                    return null
                                }

                                return (
                                    <InteractwithTemplates
                                        style={{ scale: fitActive ? contentScale : "", transformOrigin: "top left" }}
                                        key={eachProjectToTemplate.id}
                                        seenProjectToTemplate={eachProjectToTemplate}
                                        updateProjectsToTemplatePlus={updateProjectsToTemplatePlus}
                                        updateProjectsToTemplate={updateProjectsToTemplate}
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