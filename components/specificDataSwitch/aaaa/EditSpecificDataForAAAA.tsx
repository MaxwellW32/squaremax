import { contactUsComponentType, propsObjType, specificDataForAAAAType } from '@/types/templateSpecificDataTypes/aaaaTypes'
import { project, projectsToTemplate, specificDataSwitchType } from '@/types'
import React, { useState } from 'react'
import styles from "./style.module.css"
import CustomizeColors from './CustomizeColors'
import { toast } from 'react-hot-toast'
import { maxBodyToServerSize, maxImageUploadSize, uploadedUserImagesStarterUrl } from '@/types/userUploadedTypes'
import { convertBtyes } from '@/usefulFunctions/usefulFunctions'
import { getSpecificProject, refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

export default function EditSpecificDataForAAAA({ specificData, seenProjectToTemplate, handleLocalSpecificData }: { specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, handleLocalSpecificData: (sentSpecificData: specificDataSwitchType) => Promise<boolean> }) {
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
                                <CustomizeColors specificData={specificData} handleLocalSpecificData={handleLocalSpecificData} />
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
                                                                    specificData.pages[eachPageKey][eachSectionKey].using = !specificData.pages[eachPageKey][eachSectionKey].using

                                                                    handleLocalSpecificData(specificData)
                                                                }}
                                                            >{eachSectionObj.using === true ? `Using section` : `not Using section`}
                                                            </button>

                                                            {eachSectionObj.fieldType === "section" ? (
                                                                <>
                                                                    {Object.entries(eachSectionObj.inputs).map(eachInputEntry => {
                                                                        const inputKey = eachInputEntry[0] //each input id/name
                                                                        const inputObj = eachInputEntry[1]

                                                                        return (
                                                                            <DisplayFormInfo key={inputKey} keyPath={`inputs/${inputKey}`} inputObj={inputObj} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} handleLocalSpecificData={handleLocalSpecificData} />
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

                                                                                        handleLocalSpecificData(specificData)
                                                                                    }}
                                                                                >Close</button>

                                                                                {Object.entries(eachContactObj).map(eachContactObjEntry => {
                                                                                    const eachContactObjKey = eachContactObjEntry[0] as keyof contactUsComponentType["component"][number]
                                                                                    const eachContactObjval = eachContactObjEntry[1]

                                                                                    if (eachContactObjKey === "texts") return null

                                                                                    return (
                                                                                        <DisplayFormInfo key={eachContactObjKey} keyPath={`component/${eachContactObjIndex}/${eachContactObjKey}`} inputObj={eachContactObjval as propsObjType} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} handleLocalSpecificData={handleLocalSpecificData} />
                                                                                    )
                                                                                })}

                                                                                {/* texts */}
                                                                                <>
                                                                                    {(eachContactObj.texts).map((eachTextObj, eachTextObjIndex) => {

                                                                                        return (
                                                                                            <DisplayFormInfo key={eachTextObjIndex} keyPath={`component/${eachContactObjIndex}/texts/${eachTextObjIndex}`} inputObj={eachTextObj} eachPageKey={eachPageKey} eachSectionKey={eachSectionKey} specificData={specificData} seenProjectToTemplate={seenProjectToTemplate} handleLocalSpecificData={handleLocalSpecificData} />
                                                                                        )
                                                                                    })}

                                                                                    <button className="mainButton" style={{ justifySelf: "center" }}
                                                                                        onClick={() => {
                                                                                            const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                                                                            const newTextObj: contactUsComponentType["component"][number]["texts"][number] = {
                                                                                                type: "html",
                                                                                                props: {},
                                                                                                value: "",
                                                                                            }

                                                                                            if (seenSectionObj.fieldType === "contactComponent") {
                                                                                                seenSectionObj.component[eachContactObjIndex].texts = [...seenSectionObj.component[eachContactObjIndex].texts, newTextObj]
                                                                                            }

                                                                                            handleLocalSpecificData(specificData)
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
                                                                                const newComponent: contactUsComponentType["component"][number] = {
                                                                                    svg: {
                                                                                        type: "html",
                                                                                        value: "",
                                                                                        props: {}
                                                                                    },
                                                                                    title: {
                                                                                        type: "html",
                                                                                        value: "",
                                                                                        props: {}
                                                                                    },
                                                                                    texts: [],
                                                                                }

                                                                                seenSectionObj.component = [...seenSectionObj.component, newComponent]
                                                                            }

                                                                            handleLocalSpecificData(specificData)
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

function DisplayFormInfo({ keyPath, inputObj, eachPageKey, eachSectionKey, specificData, seenProjectToTemplate, handleLocalSpecificData, }: { keyPath: string, inputObj: propsObjType, eachPageKey: string, eachSectionKey: string, specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, handleLocalSpecificData: (sentSpecificData: specificDataSwitchType) => Promise<boolean> }) {
    const keys = keyPath.split("/")
    const inputKey = keys[keys.length - 1]
    const uniqueId = `${eachPageKey}/${eachSectionKey}/${keyPath}`

    return (
        <div className={styles.formInputCont}>
            {inputObj.type === "html" ? (
                <>
                    {inputObj.inputType === undefined ? (
                        <input id={uniqueId} type={"text"} name={inputKey} value={inputObj.value} placeholder={"type your text here"}
                            onChange={async (e) => {
                                const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                let newTempSection = seenSectionObj

                                keys.forEach((eachKey, index) => {
                                    if (index === keys.length - 1) {
                                        //assign value
                                        //@ts-expect-error unkown check
                                        newTempSection[eachKey].value = e.target.value;

                                    } else {
                                        //@ts-expect-error unkown check
                                        newTempSection = newTempSection[eachKey];
                                    }
                                });

                                handleLocalSpecificData(specificData)
                            }}
                        />
                    ) : inputObj.inputType === "textarea" ? (
                        <textarea rows={5} id={uniqueId} name={inputKey} value={inputObj.value} placeholder={"type your text here"}
                            onChange={async (e) => {
                                const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                                let newTempSection = seenSectionObj

                                keys.forEach((eachKey, index) => {
                                    if (index === keys.length - 1) {
                                        //assign value
                                        //@ts-expect-error unkown check
                                        newTempSection[eachKey].value = e.target.value;

                                    } else {
                                        //@ts-expect-error unkown check
                                        newTempSection = newTempSection[eachKey];
                                    }
                                });

                                handleLocalSpecificData(specificData)
                            }}
                        ></textarea>
                    ) : null}
                </>
            ) : inputObj.type === "img" ? (
                <div style={{ display: "grid", alignContent: "flex-start" }}>
                    {/* upload image */}
                    <input type={"text"} value={inputObj.props.src} placeholder={"type your image url here"}
                        onChange={async (e) => {
                            const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

                            let newTempSection = seenSectionObj

                            keys.forEach((eachKey, index) => {
                                if (index === keys.length - 1) {
                                    //assign value
                                    //@ts-expect-error unkown check
                                    if (newTempSection[eachKey].type === "img") {
                                        //@ts-expect-error unkown check
                                        newTempSection[eachKey].props.src = e.target.value
                                    }

                                } else {
                                    //@ts-expect-error unkown check
                                    newTempSection = newTempSection[eachKey];
                                }
                            });

                            handleLocalSpecificData(specificData)
                        }}
                    />

                    <button className='mainButton'>
                        <label htmlFor={uniqueId} style={{ cursor: "pointer" }}>
                            upload
                        </label>
                    </button>

                    <input id={uniqueId} type="file" placeholder='Upload images' accept="image/*" style={{ display: "none" }}
                        onChange={async (e) => {
                            try {
                                if (!e.target.files) throw new Error("no files seen")

                                let totalUploadSize = 0
                                const uploadedFiles = e.target.files
                                const formData = new FormData();

                                for (let index = 0; index < uploadedFiles.length; index++) {
                                    const file = uploadedFiles[index];

                                    // Check if file is an image (this will be redundant because of the 'accept' attribute, but can be good for double-checking)
                                    if (!file.type.startsWith("image/")) {
                                        toast.error(`File ${file.name} is not an image.`);
                                        continue;
                                    }

                                    // Check the file size
                                    if (file.size > maxImageUploadSize) {
                                        toast.error(`File ${file.name} is too large. Maximum size is ${convertBtyes(maxImageUploadSize, "mb")} MB`);
                                        continue;
                                    }

                                    //add file size to totalUploadSize
                                    totalUploadSize += file.size

                                    formData.append(`file${index}`, file);
                                }

                                if (totalUploadSize > maxBodyToServerSize) throw new Error(`Please upload less than ${convertBtyes(maxBodyToServerSize, "mb")} MB at a time`)

                                const response = await fetch(`/api/userImages/add`, {
                                    method: 'POST',
                                    body: formData,
                                })

                                //array of image names
                                const seenData = await response.json();

                                //get the latest project images and upload project
                                const latestProject = await getSpecificProject({ option: "id", data: { id: seenProjectToTemplate.projectId } })
                                if (latestProject === undefined) throw new Error("trouble updating, not seeing latest project")

                                let latestImagesSeen: project["userUploadedImages"] = latestProject.userUploadedImages

                                if (latestImagesSeen === null) {
                                    latestImagesSeen = []
                                }

                                latestImagesSeen = [...latestImagesSeen, ...seenData.imageNames]

                                //update the server with images
                                await updateProject({
                                    id: seenProjectToTemplate.projectId,
                                    userUploadedImages: latestImagesSeen
                                })

                                toast.success("image uploaded")

                                //update the local input
                                const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]
                                const newImageUrl = `${uploadedUserImagesStarterUrl}${seenData.imageNames[0]}`

                                let newTempSection = seenSectionObj

                                keys.forEach((eachKey, index) => {
                                    if (index === keys.length - 1) {
                                        //assign value
                                        //@ts-expect-error unkown check
                                        if (newTempSection[eachKey].type === "img") {
                                            //@ts-expect-error unkown check
                                            newTempSection[eachKey].props.src = newImageUrl
                                        }

                                    } else {
                                        //@ts-expect-error unkown check
                                        newTempSection = newTempSection[eachKey];
                                    }
                                });

                                await handleLocalSpecificData(specificData)

                                await refreshProjectPath({ id: seenProjectToTemplate.projectId })

                            } catch (error) {
                                consoleAndToastError(error)
                            }
                        }}
                    />
                </div>
            ) : null}
        </div>
    )
}