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
import HandleUserUploadedImages from './HandleUserUploadedImages'
import GithubOptions from '../githubOptions/GithubOptions'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

//sort out images and boolean, then write proper forminputs
//encrypt auth token

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

    const [showSideBar, showSideBarSet] = useState(seenProject.projectsToTemplates === undefined || seenProject.projectsToTemplates.length === 0 ? true : false)
    const [dimSideBar, dimSideBarSet] = useState(false)
    const [fitActive, fitActiveSet] = useState(false)
    const [contentScale, contentScaleSet] = useState(1)
    const [showingGithubOptions, showingGithubOptionsSet] = useState(false)

    type sizeOptionType = {
        name: string,
        width: number,
        height: number,
        active: boolean,
        icon: JSX.Element
    }
    const [sizeOptions, sizeOptionsSet] = useState<sizeOptionType[]>([])

    const activeSizeOption = useMemo(() => {
        return sizeOptions.find(eachSizeOption => eachSizeOption.active)
    }, [sizeOptions])

    const middleBarContentRef = useRef<HTMLDivElement | null>(null)
    const [middleBarContentSize, middleBarContentSizeSet] = useState({ width: 0, height: 0 })
    const canvasViewRef = useRef<HTMLDivElement | null>(null)

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
                    saveState: "saved",
                    showingMoreInfo: false
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

    //set sizeOptions
    useEffect(() => {
        sizeOptionsSet(() => {
            const newSizeOptions: sizeOptionType[] = [
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
                    width: window.innerWidth > 1200 ? window.innerWidth : 1920,
                    height: window.innerWidth > 1200 ? window.innerHeight : 1080,
                    active: true,
                    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l176 0-10.7 32L160 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-69.3 0L336 416l176 0c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0zM512 64l0 224L64 288 64 64l448 0z" /></svg>
                },
            ]


            return newSizeOptions
        })
    }, [])

    //center canvasView
    useEffect(() => {
        centerCanvas()
    }, [middleBarContentSize, fitActive, sizeOptions])

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

                globalFormDataSchema.parse(seenUpdatedProjectsToTemplates.globalFormData)

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

    function centerCanvas() {
        if (middleBarContentRef.current === null) return

        //center scroll bars
        middleBarContentRef.current.scrollLeft = middleBarContentRef.current.scrollWidth / 2 - (middleBarContentSize.width / 2)
        middleBarContentRef.current.scrollTop = 0

    }

    return (
        <div className={styles.barCont}>
            <GithubOptions activeProjectToTemplate={activeProjectToTemplate} project={seenProject} showingGithubOptionsSet={showingGithubOptionsSet} style={{ display: showingGithubOptions ? "grid" : "none" }} />

            <div className={styles.leftBar} style={{ display: showSideBar ? "" : "none", backgroundColor: dimSideBar ? "transparent" : "" }}
                onMouseEnter={() => {
                    //if on desktop have shortcut
                    if (window.innerWidth < 1024) return
                    dimSideBarSet(false)
                }}
                onMouseLeave={() => {
                    //if on desktop have shortcut
                    if (window.innerWidth < 1024) return
                    dimSideBarSet(true)
                }}
            >
                <div className={styles.leftBarHeader}>
                    <h3>{seenProject.name}</h3>

                    {/* close sidebar button */}
                    <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                        onClick={() => { dimSideBarSet(prev => !prev) }}
                    >Dim</button>

                    <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                        onClick={() => {
                            dimSideBarSet(false)
                            showSideBarSet(false)
                        }}
                    >close</button>
                </div>

                <div className={styles.leftBarContent} style={{ opacity: dimSideBar ? 0.05 : "", }}>
                    {/* select active template */}
                    {projectsToTemplatesPlus.length > 0 && (
                        <div style={{ display: "grid", gap: ".5rem" }}>
                            {projectsToTemplatesPlus.map(eachProjectsToTemplatesPlus => {
                                // ensure theres template data
                                if (eachProjectsToTemplatesPlus.template === undefined) return null

                                return (
                                    <div key={eachProjectsToTemplatesPlus.id} className={styles.templateOptionCont}>
                                        <div className={`${styles.templateOptionsContLeft} toolTip`} data-tooltip="select template" style={{ backgroundColor: eachProjectsToTemplatesPlus.moreInfo.active ? "rgb(var(--color1))" : "rgb(var(--shade1))" }}
                                            onClick={() => {
                                                projectsToTemplatesPlusSet(prevProjectsToTemplatesPlus => {
                                                    const newProjectsToTemplatesPlus = prevProjectsToTemplatesPlus.map(eachPrevProjectsToTemplatesPlus => {
                                                        eachPrevProjectsToTemplatesPlus.moreInfo.active = false

                                                        // if obj in array is the same as id clicked apply active
                                                        if (eachPrevProjectsToTemplatesPlus.id === eachProjectsToTemplatesPlus.id) {
                                                            eachPrevProjectsToTemplatesPlus.moreInfo.active = true
                                                        }

                                                        return eachPrevProjectsToTemplatesPlus
                                                    })

                                                    return newProjectsToTemplatesPlus
                                                })

                                                centerCanvas()
                                            }}
                                        >
                                        </div>

                                        <div className={styles.templateOptionsContRight}>
                                            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                                {/* show connected template */}
                                                <p>{eachProjectsToTemplatesPlus.template.name}</p>

                                                {/* connection icon */}
                                                <div className='toolTip' data-tooltip={eachProjectsToTemplatesPlus.moreInfo.connected ? "connected" : "disconnected"}>
                                                    <svg style={{ fill: eachProjectsToTemplatesPlus.moreInfo.connected ? "green" : "#eee" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path d="M257 8C120 8 9 119 9 256s111 248 248 248 248-111 248-248S394 8 257 8zm-49.5 374.8L81.8 257.1l125.7-125.7 35.2 35.4-24.2 24.2-11.1-11.1-77.2 77.2 77.2 77.2 26.6-26.6-53.1-52.9 24.4-24.4 77.2 77.2-75 75.2zm99-2.2l-35.2-35.2 24.1-24.4 11.1 11.1 77.2-77.2-77.2-77.2-26.5 26.5 53.1 52.9-24.4 24.4-77.2-77.2 75-75L432.2 255 306.5 380.6z" /></svg>
                                                </div>

                                                {activeProjectToTemplate !== undefined && activeProjectToTemplate.id === eachProjectsToTemplatesPlus.id && (
                                                    <>
                                                        {eachProjectsToTemplatesPlus.moreInfo.saveState === "saved" ? (
                                                            <>
                                                                {/* file download button */}
                                                                <button className='toolTip' data-tooltip="download website"
                                                                    onClick={async () => {
                                                                        try {
                                                                            if (eachProjectsToTemplatesPlus.moreInfo.saveState === "saving") throw new Error("saving in progress")

                                                                            if (eachProjectsToTemplatesPlus.template === undefined) throw new Error("no template to download")

                                                                            //get back file zip
                                                                            const response = await fetch(`/api/downloadWebsite?githubUrl=${eachProjectsToTemplatesPlus.template.github}&projectId=${seenProject.id}&projectsToTemplatesId=${eachProjectsToTemplatesPlus.id}`)
                                                                            const responseBlob = await response.blob()

                                                                            //download 
                                                                            const url = window.URL.createObjectURL(responseBlob);
                                                                            const a = document.createElement('a');
                                                                            a.href = url;
                                                                            a.download = `${eachProjectsToTemplatesPlus.template.name}.zip`;//change to packagejson name
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            document.body.removeChild(a);

                                                                        } catch (error) {
                                                                            consoleAndToastError(error)
                                                                        }
                                                                    }}
                                                                ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" /></svg></button>

                                                                {/* github options button */}
                                                                <button className='toolTip' data-tooltip="upload to github"
                                                                    onClick={() => {
                                                                        //show github form
                                                                        showingGithubOptionsSet(prev => !prev)
                                                                    }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" /></svg>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* more options button */}
                                            <button style={{ position: "relative", cursor: "pointer" }}
                                                onClick={() => {
                                                    projectsToTemplatesPlusSet(prevProjectsToTemplatesPlus => {
                                                        const newProjectsToTemplatesPlus = prevProjectsToTemplatesPlus.map(eachPrevProjectsToTemplatesPlus => {
                                                            eachPrevProjectsToTemplatesPlus.moreInfo.showingMoreInfo = false

                                                            // if obj in array is the same as id clicked apply showingMoreInfo
                                                            if (eachPrevProjectsToTemplatesPlus.id === eachProjectsToTemplatesPlus.id) {
                                                                eachPrevProjectsToTemplatesPlus.moreInfo.showingMoreInfo = true
                                                            }

                                                            return eachPrevProjectsToTemplatesPlus
                                                        })

                                                        return newProjectsToTemplatesPlus
                                                    })
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" /></svg>
                                            </button>

                                            {/* more options menu */}
                                            <ul className={styles.moreOptionsMenu} style={{ display: eachProjectsToTemplatesPlus.moreInfo.showingMoreInfo ? "grid" : "none" }}>
                                                <button className='secondaryButton' style={{ justifySelf: "flex-end", margin: "1rem" }}
                                                    onClick={() => {
                                                        projectsToTemplatesPlusSet(prevProjectsToTemplatesPlus => {
                                                            const newProjectsToTemplatesPlus = prevProjectsToTemplatesPlus.map(eachPrevProjectsToTemplatesPlus => {
                                                                eachPrevProjectsToTemplatesPlus.moreInfo.showingMoreInfo = false

                                                                return eachPrevProjectsToTemplatesPlus
                                                            })

                                                            return newProjectsToTemplatesPlus
                                                        })
                                                    }}
                                                >close</button>

                                                <li>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", alignItems: "center", justifyContent: "flex-end" }}>
                                                        {/* delete button */}
                                                        <button className='secondaryButton'
                                                            onClick={async () => {
                                                                if (!eachProjectsToTemplatesPlus.moreInfo.confirmDelete) {
                                                                    // ensure user confirms deletion
                                                                    projectsToTemplatesPlusSet(prevProjectsToTemplatesPlus => {
                                                                        const newProjectsToTemplatesPlus = prevProjectsToTemplatesPlus.map(eachProjectsToTemplatesPlusMap => {
                                                                            eachProjectsToTemplatesPlusMap.moreInfo.confirmDelete = false

                                                                            if (eachProjectsToTemplatesPlusMap.id === eachProjectsToTemplatesPlus.id) {
                                                                                eachProjectsToTemplatesPlusMap.moreInfo.confirmDelete = true
                                                                            }

                                                                            return eachProjectsToTemplatesPlusMap
                                                                        })

                                                                        return newProjectsToTemplatesPlus
                                                                    })

                                                                    //stop here on first delete try
                                                                    return
                                                                }

                                                                // clears template from projectsToTemplates
                                                                await deleteTemplateFromProject({
                                                                    id: eachProjectsToTemplatesPlus.id
                                                                })

                                                                console.log(`$unlinked projecttotemplate`);
                                                                toast.success("template unlinked")

                                                                refreshProjectPath({ id: seenProject.id })
                                                            }}
                                                        >{eachProjectsToTemplatesPlus.moreInfo.confirmDelete && "confirm "}remove {!eachProjectsToTemplatesPlus.moreInfo.confirmDelete && "template"}</button>

                                                        {/* cancel delete button */}
                                                        {eachProjectsToTemplatesPlus.moreInfo.confirmDelete && (
                                                            <button className='secondaryButton'
                                                                onClick={() => {
                                                                    projectsToTemplatesPlusSet(prevProjectsToTemplatesPlus => {
                                                                        const newProjectsToTemplatesPlus = prevProjectsToTemplatesPlus.map(eachProjectsToTemplatesPlusMap => {
                                                                            eachProjectsToTemplatesPlusMap.moreInfo.confirmDelete = false

                                                                            return eachProjectsToTemplatesPlusMap
                                                                        })

                                                                        return newProjectsToTemplatesPlus
                                                                    })
                                                                }}
                                                            >cancel</button>
                                                        )}
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <TemplateSelector setterFunc={handleTemplateSelection} />

                    {activeProjectToTemplate !== undefined && activeProjectToTemplate.globalFormData !== null && (
                        <React.Fragment key={activeProjectToTemplate.id}>
                            {/* edit shared data - reload on active switch*/}
                            <EditLinkedData seenProjectToTemplate={activeProjectToTemplate} seenLinkedData={activeProjectToTemplate.globalFormData.linkedData} updateProjectsToTemplate={updateProjectsToTemplate} />

                            {/* edit specific data switch */}
                            <SpecificDataSwitch seenProjectToTemplate={activeProjectToTemplate} seenSpecificData={activeProjectToTemplate.globalFormData.specificData} updateProjectsToTemplate={updateProjectsToTemplate} />
                        </React.Fragment>
                    )}

                    {/* project images */}
                    <HandleUserUploadedImages project={seenProject} seenProjectSet={seenProjectSet} />
                </div>
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
                    <button className='toolTip' data-tooltip="resize layout"
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
                        {fitActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z" /></svg>
                        )}
                    </button>
                </div>

                <div ref={middleBarContentRef} className={styles.middleBarContent}>
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
                                    <div ref={canvasViewRef} key={eachProjectToTemplate.id} className={styles.viewCanvas} style={{ height: middleBarContentSize.height, position: "relative" }}>
                                        <InteractwithTemplates
                                            style={{ scale: fitActive ? contentScale : "", transformOrigin: "top center", position: "absolute", top: 0, left: "50%", translate: "-50% 0" }}
                                            seenProjectToTemplate={eachProjectToTemplate}
                                            updateProjectsToTemplatePlus={updateProjectsToTemplatePlus}
                                            updateProjectsToTemplate={updateProjectsToTemplate}
                                            width={activeSizeOption.width}
                                            height={fitActive ? activeSizeOption.height : middleBarContentSize.height} />
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}