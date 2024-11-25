import { contactComponentType, formInputType, specificDataForAAAAType } from '@/types/templateSpecificDataTypes/aaaaTypes'
import { projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState } from 'react'
import styles from "./style.module.css"
import CustomizeColors from './CustomizeColors'

export default function EditSpecificDataForAAAA({ specificData, seenProjectToTemplate, updateProjectsToTemplate }: { specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    const [currentPage, currentPageSet] = useState("home")
    const [formTabSelection, formTabSelectionSet] = useState<keyof specificDataForAAAAType>("pages")

    return (
        <form className={styles.form} action={() => { }}>
            {/* switch form tabs */}
            <div style={{ display: "flex", overflowX: "auto", height: "5rem", alignItems: "flex-start" }}>
                {Object.entries(specificData).map(eachFormTabEntry => {
                    const eachFormTabKey = eachFormTabEntry[0] as keyof specificDataForAAAAType
                    if (eachFormTabKey === "templateId") return null

                    return (
                        <button className='mainButton' key={eachFormTabKey} style={{ flex: "0 0 auto", backgroundColor: eachFormTabKey === formTabSelection ? "rgb(var(--color1))" : "" }}
                            onClick={() => {
                                formTabSelectionSet(eachFormTabKey)
                            }}
                        >{eachFormTabKey}</button>
                    )
                })}
            </div>

            {/* edit different form fields */}
            <div>
                {Object.entries(specificData).map(eachFormTabEntry => {
                    const eachFormTabKey = eachFormTabEntry[0] as keyof specificDataForAAAAType

                    return (
                        <div key={eachFormTabKey} style={{ display: eachFormTabKey === formTabSelection ? "grid" : "none" }}>
                            {eachFormTabKey === "colors" ? (
                                <CustomizeColors specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />
                            ) : eachFormTabKey === "pages" ? (
                                <>
                                    {/* form page selection */}
                                    <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
                                        {Object.entries(specificData.pages).map(eachPageEntry => {
                                            const eachPageName = eachPageEntry[0]

                                            return (
                                                <button className='secondaryButton' key={eachPageName} style={{ backgroundColor: eachPageName === currentPage ? "rgb(var(--color1))" : "" }}
                                                    onClick={() => {
                                                        currentPageSet(eachPageName)
                                                    }}
                                                >{eachPageName}</button>
                                            )
                                        })}
                                    </div>

                                    {/* form page inputs */}
                                    {Object.entries(specificData.pages).map(eachPageEntry => {
                                        const eachPageKey = eachPageEntry[0] //e.g Home
                                        const eachPageSections = eachPageEntry[1]

                                        return (
                                            // each section 
                                            <div key={eachPageKey} className={styles.formSectionCont}>
                                                {Object.entries(eachPageSections).map(eachSectionEntry => {
                                                    const eachSectionKey = eachSectionEntry[0] //e.g section 1
                                                    const eachSectionObj = eachSectionEntry[1]

                                                    return (
                                                        <div key={eachSectionKey} style={{ display: currentPage === eachPageKey ? "grid" : "none", border: "1px solid rgb(var(--shade1))", padding: "1rem" }}>
                                                            <button className='mainButton'
                                                                onClick={() => {
                                                                    if (specificData.pages[eachPageKey][eachSectionKey].using === undefined) {
                                                                        specificData.pages[eachPageKey][eachSectionKey].using = false

                                                                    } else {
                                                                        specificData.pages[eachPageKey][eachSectionKey].using = !specificData.pages[eachPageKey][eachSectionKey].using
                                                                    }

                                                                    updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                }}
                                                            >{eachSectionObj.using === true ? `Using ${eachSectionObj.label} ` : `not Using ${eachSectionObj.label} `}
                                                            </button>

                                                            {eachSectionObj.fieldType === undefined || eachSectionObj.fieldType === "section" ? (
                                                                <>
                                                                    {Object.entries(eachSectionObj.inputs).map(eachInputEntry => {
                                                                        const inputKey = eachInputEntry[0] //each input id/name
                                                                        const inputObj = eachInputEntry[1]

                                                                        return (
                                                                            <DisplayFormInfo key={inputKey} inputObj={inputObj} inputKey={inputKey} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />
                                                                        )
                                                                    })}
                                                                </>
                                                            ) : eachSectionObj.fieldType === "contactComponent" ? (
                                                                <div className={`${styles.componentCont} snap`}>
                                                                    {eachSectionObj.component.map((eachContactObj, eachContactObjIndex) => {
                                                                        return (
                                                                            <div key={eachContactObjIndex} className={styles.component}>
                                                                                <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                                                                    onClick={() => {
                                                                                        const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                                                                        if (seenSectionObj.fieldType === "contactComponent") {
                                                                                            seenSectionObj.component = seenSectionObj.component.filter((eachCompSeen, eachCompSeenIndex) => eachCompSeenIndex === eachContactObjIndex)
                                                                                        }

                                                                                        updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                                    }}
                                                                                >Close</button>

                                                                                {Object.entries(eachContactObj).map(eachContactObjEntry => {
                                                                                    const eachContactObjKey = eachContactObjEntry[0] as keyof contactComponentType["component"][number]
                                                                                    const eachContactObjval = eachContactObjEntry[1]

                                                                                    if (eachContactObjKey === "texts") return null

                                                                                    return (
                                                                                        // @ts-expect-error not seeing the input is correct type
                                                                                        <DisplayFormInfo key={eachContactObjKey} inputObj={eachContactObjval} seenIndex={eachContactObjIndex} inputKey={eachContactObjKey} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />
                                                                                    )
                                                                                })}

                                                                                {/* texts */}
                                                                                <>
                                                                                    {(eachContactObj.texts).map((eachTextObj, eachTextObjIndex) => {

                                                                                        return (
                                                                                            <DisplayFormInfo key={eachTextObjIndex} inputObj={eachTextObj} inputKey={"texts"} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} seenIndex={eachContactObjIndex} seenIndex2={eachTextObjIndex} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} updateProjectsToTemplate={updateProjectsToTemplate} />
                                                                                        )
                                                                                    })}

                                                                                    <button className="mainButton" style={{ justifySelf: "center" }}
                                                                                        onClick={() => {
                                                                                            const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                                                                            const newTextObj: formInputType = {
                                                                                                fieldType: "input",
                                                                                                value: ""
                                                                                            }

                                                                                            if (seenSectionObj.fieldType === "contactComponent") {
                                                                                                seenSectionObj.component[eachContactObjIndex].texts = [...seenSectionObj.component[eachContactObjIndex].texts, newTextObj]
                                                                                            }

                                                                                            updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                                        }}
                                                                                    >Add text</button>
                                                                                </>
                                                                            </div>
                                                                        )
                                                                    })}

                                                                    <button className="mainButton" style={{ justifySelf: "flex-start", alignSelf: "center" }}
                                                                        onClick={() => {
                                                                            const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                                                            if (seenSectionObj.fieldType === "contactComponent") {
                                                                                const newComponent: contactComponentType["component"][number] = {
                                                                                    svg: {
                                                                                        fieldType: "svg",
                                                                                        value: '<></>'
                                                                                    },
                                                                                    texts: [{
                                                                                        fieldType: "textarea",
                                                                                        value: ""
                                                                                    }],
                                                                                    title: {
                                                                                        fieldType: "input",
                                                                                        value: ""
                                                                                    },
                                                                                }

                                                                                seenSectionObj.component = [...seenSectionObj.component, newComponent]
                                                                            }

                                                                            updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                        }}
                                                                    >Add Contact</button>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </>
                            ) : eachFormTabKey === "navLinks" ? (
                                <>
                                    {/* form nav links */}
                                    {Object.entries(specificData.navLinks).map(eachNavOptionEntry => {
                                        const eachNavOptionName = eachNavOptionEntry[0] as keyof specificDataForAAAAType["navLinks"]
                                        const eachNavOptionData = eachNavOptionEntry[1]

                                        return (
                                            <div key={eachNavOptionName}>
                                                <h3>customize {eachNavOptionName} nav</h3>

                                                {eachNavOptionData.map(eachNav => {
                                                    return (
                                                        <div key={eachNav.link}>{eachNav.title}</div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </form>
    )
}


function DisplayFormInfo({ inputObj, inputKey, eachPageKey, eachSectionKey, seenIndex, seenIndex2, specificData, seenProjectToTemplate, updateProjectsToTemplate }: { inputObj: formInputType, inputKey: string, eachPageKey: string, eachSectionKey: string, seenIndex?: number, seenIndex2?: number, specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {

    return (
        <div className={styles.formInputCont}>
            {inputObj.label !== undefined && <label htmlFor={inputKey}>{inputObj.label}</label>}

            {inputObj.fieldType === "input" ? (
                <input id={inputKey} type={"text"} name={inputKey} value={inputObj.value} placeholder={inputObj.placeHolder ?? "type your text here"}
                    onChange={(e) => {
                        const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                        if (seenSectionObj.fieldType === undefined || seenSectionObj.fieldType === "section") {
                            seenSectionObj.inputs[inputKey].value = e.target.value

                        } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
                            const seenInputKey = inputKey as keyof contactComponentType["component"][number]

                            // set all but text
                            if (seenInputKey !== "texts") {
                                seenSectionObj.component[seenIndex][seenInputKey].value = e.target.value
                            }

                            //set text
                            if (seenIndex2 !== undefined) {
                                seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = e.target.value
                            }
                        }

                        updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                    }}
                />
            ) : inputObj.fieldType === "number" ? (
                <input id={inputKey} type={"text"} name={inputKey} value={`${inputObj.value}`} placeholder={inputObj.placeHolder ?? "type numbers here"} onChange={(e) => {
                    let parsedNum = parseFloat(e.target.value)
                    if (isNaN(parsedNum)) parsedNum = 0

                    const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                    if (seenSectionObj.fieldType === undefined || seenSectionObj.fieldType === "section") {
                        seenSectionObj.inputs[inputKey].value = parsedNum

                    } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
                        const seenInputKey = inputKey as keyof contactComponentType["component"][number]

                        // set all but text
                        if (seenInputKey !== "texts") {
                            seenSectionObj.component[seenIndex][seenInputKey].value = parsedNum
                        }

                        if (seenIndex2 !== undefined) {
                            //set text
                            seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = parsedNum
                        }
                    }

                    updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })

                }} />

            ) : inputObj.fieldType === "textarea" ? (
                <textarea rows={5} id={inputKey} name={inputKey} value={inputObj.value} placeholder={inputObj.placeHolder ?? "type your text here"} onInput={(e) => {
                    const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                    //@ts-expect-error value exits on text area
                    const seenText = e.target.value

                    if (seenSectionObj.fieldType === undefined || seenSectionObj.fieldType === "section") {
                        seenSectionObj.inputs[inputKey].value = seenText

                    } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
                        const seenInputKey = inputKey as keyof contactComponentType["component"][number]

                        // set all but text
                        if (seenInputKey !== "texts") {
                            seenSectionObj.component[seenIndex][seenInputKey].value = seenText
                        }

                        if (seenIndex2 !== undefined) {
                            //set text
                            seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = seenText
                        }
                    }

                    updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                }} ></textarea>

            ) : inputObj.fieldType === "image" ? (
                <p>image</p>

            ) : inputObj.fieldType === "video" ? (
                <p>video</p>

            ) : inputObj.fieldType === "link" ? (
                <p>link</p>
            ) : inputObj.fieldType === "svg" ? (
                <p>svg</p>
            ) : null}

            {/* will implement soon */}
            {/* {errors !== undefined && <p style={{ color: "red", fontSize: "var(--smallFontSize)" }}>{errors}</p>} */}
        </div>
    )
}