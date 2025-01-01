"use client"
// import { globalFormDataSchema, linkedDataSchema, projectToTemplatePlusType, projectsToTemplate, specificDataSwitchSchema, template, updateProjectsToTemplateFunctionType } from '@/types'
import { project } from '@/types'
import React, { useState, useEffect, useRef, useMemo } from 'react'
// import InteractwithTemplates from '../templates/InteractWithTemplates'
// import TemplateSelector from '../templates/templateSelector'
// import { toast } from 'react-hot-toast'
// import { refreshProjectPath } from '@/serverFunctions/handleProjects'
// import { addTemplateToProject, deleteTemplateFromProject, updateTemplateInProject } from '@/serverFunctions/handleProjectsToTemplates'
import styles from "./style.module.css"
// import EditLinkedData from '../editLinkedData/EditLinkedData'
// import SpecificDataSwitch from '../specificDataSwitch/SpecificDataSwitch'
// import HandleUserUploadedImages from './HandleUserUploadedImages'
// import GithubOptions from '../githubOptions/GithubOptions'
// import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

type sizeOptionType = {
    name: string,
    width: number,
    height: number,
    active: boolean,
    icon: JSX.Element
}

// type elementType = {
//     id: string,
//     props: HTMLAttributes<HTMLElement>,
//     children?: React.JSX.Element
// }

// type websitePageType = {
//     elements: elementType[],
// }

// type websiteType = {
//     name: string,
//     fonts: string,
//     globalStyles: string,
//     pages: {
//         [key: string]: websitePageType
//     },
//     navs: {
//         header: React.JSX.Element,
//         footer: React.JSX.Element,
//     }
// }

export default function ViewProject({ projectFromServer }: { projectFromServer: project }) {
    const [showingSideBar, showingSideBarSet] = useState(true)

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

    const [canvasScale, canvasScaleSet] = useState(1)
    const [fit, fitSet] = useState(true)

    const spacerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const middleBarContentContRef = useRef<HTMLDivElement | null>(null)

    //business logic
    // const [website,] = useState<websiteType>({
    //     fonts: "",
    //     name: "first website",
    //     globalStyles: "",
    //     pages: {
    //         "home": {
    //             elements: [
    //                 {
    //                     id: "1",
    //                     props: {},
    //                     children: undefined
    //                 }
    //             ]
    //         }
    //     },
    //     navs: {
    //         header: <></>,
    //         footer: <></>,
    //     }
    // })
    //reproducting the html structure
    //the event listeners, styles, classnames all props


    //calculate fit on device size change
    useEffect(() => {
        if (middleBarContentContRef.current === null || activeSizeOption === undefined) return

        const widthDiff = middleBarContentContRef.current.clientWidth / activeSizeOption.width
        const heightDiff = middleBarContentContRef.current.clientHeight / activeSizeOption.height

        const newScale = widthDiff < heightDiff ? widthDiff : heightDiff

        canvasScaleSet(newScale)

        console.log(`$ran scale`);

    }, [activeSizeOption, middleBarContentContRef])

    //center canvasView
    useEffect(() => {
        centerCanvas()
    }, [activeSizeOption, fit])

    function centerCanvas() {
        if (middleBarContentContRef.current === null || spacerRef.current == null || activeSizeOption === undefined || canvasRef.current === null) return

        //center scroll bars
        middleBarContentContRef.current.scrollLeft = (middleBarContentContRef.current.scrollWidth / 2) - (middleBarContentContRef.current.clientWidth / 2)
        middleBarContentContRef.current.scrollTop = 0

        canvasRef.current.style.left = `${spacerRef.current.clientWidth / 2 - (fit ? middleBarContentContRef.current.clientWidth : activeSizeOption.width) / 2}px`
    }

    console.log(`$projectfromserver`, projectFromServer);
    // function handleElementsChange(elements: elementType[]) {

    //     if (canvasRef === null) return

    //     elements.forEach(eachElement => {

    //     })
    // }

    return (
        <main className={styles.main}>
            <div className={styles.middleBar}>
                <div className={styles.middleBarSettingsCont}>
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

                                        fitSet(false)
                                    }}
                                >
                                    {eachSizeOption.icon}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => {
                                fitSet(prev => !prev)
                            }}
                        >
                            {fit ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 320c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div ref={middleBarContentContRef} className={styles.middleBarContentCont}>
                    {activeSizeOption !== undefined && (
                        <div ref={canvasRef} className={styles.canvas} style={{ width: fit ? middleBarContentContRef.current?.clientWidth : activeSizeOption.width, height: fit ? middleBarContentContRef.current?.clientHeight : activeSizeOption.height, scale: fit ? 1 : canvasScale }}>
                            <div style={{ width: ".5rem", height: ".5rem", backgroundColor: "red" }}></div>
                        </div>
                    )}

                    <div ref={spacerRef} className={styles.spacer}></div>
                </div>
            </div>

            <div className={styles.sideBar} style={{ display: showingSideBar ? "" : "none" }}>

            </div>

            <button className='secondaryButton' style={{ position: "absolute", zIndex: 1, top: 0, right: 0 }}
                onClick={() => {
                    showingSideBarSet(prev => !prev)
                }}
            >{showingSideBar ? "close" : "open sidebar"}</button>
        </main>
    )
}
