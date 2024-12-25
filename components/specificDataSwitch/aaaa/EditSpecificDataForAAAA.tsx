import { contactType, specificDataForAAAAType } from '@/types/templateSpecificDataTypes/aaaaTypes'
import { projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState } from 'react'
import styles from "./style.module.css"
import CustomizeColors from './CustomizeColors'
// import { toast } from 'react-hot-toast'
// import { maxBodyToServerSize, maxImageUploadSize, uploadedUserImagesStarterUrl } from '@/types/userUploadedTypes'
// import { convertBtyes } from '@/usefulFunctions/usefulFunctions'
// import { getSpecificProject, refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
// import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

export default function EditSpecificDataForAAAA({ specificData, seenProjectToTemplate, updateProjectsToTemplate }: { specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    const pageOptions = ["home"]
    type pageOptionsType = typeof pageOptions[number]

    const [currentPage, currentPageSet] = useState<pageOptionsType>("home")
    const [formTabSelection, formTabSelectionSet] = useState<keyof specificDataForAAAAType>("components")

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
                            ) : eachFormTabKey === "components" ? (
                                <>
                                    {/* form page selection */}
                                    <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
                                        {pageOptions.map(eachPage => {

                                            return (
                                                <button className='secondaryButton' key={eachPage} style={{ backgroundColor: eachPage === currentPage ? "rgb(var(--color1))" : "" }}
                                                    onClick={() => {
                                                        currentPageSet(eachPage)
                                                    }}
                                                >{eachPage}</button>
                                            )
                                        })}
                                    </div>

                                    <div style={{ display: currentPage !== "home" ? "none" : "grid" }}>
                                        {/* intro */}

                                        {/* contacts */}
                                        <div className={`${styles.componentCont} snap`}>
                                            {specificData.components.contact.contacts.map((eachContactObj, eachContactObjIndex) => {
                                                return (
                                                    <div key={eachContactObjIndex} className={styles.component}>
                                                        <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                                            onClick={() => {
                                                                specificData.components.contact.contacts = specificData.components.contact.contacts.filter((eachCompSeen, eachCompSeenIndex) => eachCompSeenIndex === eachContactObjIndex)

                                                                updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                            }}
                                                        >Close</button>

                                                        {/* do title */}
                                                        <input type={"text"} name={"title"} value={eachContactObj.title} placeholder={"type your text here"}
                                                            onChange={(e) => {
                                                                specificData.components.contact.contacts[eachContactObjIndex].title = e.target.value

                                                                updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                            }}
                                                        />

                                                        <input type={"text"} name={"svg"} value={eachContactObj.svg} placeholder={"type your svg here"}
                                                            onChange={(e) => {
                                                                specificData.components.contact.contacts[eachContactObjIndex].svg = e.target.value

                                                                updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                            }}
                                                        />

                                                        {/* do texts */}
                                                        <>
                                                            {(eachContactObj.texts).map((eachText, eachTextIndex) => {

                                                                return (
                                                                    <input key={eachTextIndex} type={"text"} name={"texts" + eachTextIndex} value={eachText} placeholder={"type your text here"}
                                                                        onChange={(e) => {
                                                                            specificData.components.contact.contacts[eachContactObjIndex].texts[eachTextIndex] = e.target.value

                                                                            updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                        }}
                                                                    />
                                                                )
                                                            })}

                                                            <button className="mainButton" style={{ justifySelf: "center" }}
                                                                onClick={() => {
                                                                    specificData.components.contact.contacts[eachContactObjIndex].texts = [...specificData.components.contact.contacts[eachContactObjIndex].texts, ""]

                                                                    updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                                }}
                                                            >Add text</button>
                                                        </>
                                                    </div>
                                                )
                                            })}

                                            <button className="mainButton" style={{ justifySelf: "flex-start", alignSelf: "center" }}
                                                onClick={() => {
                                                    const newComponent: contactType["contacts"][number] = {
                                                        svg: "",
                                                        texts: [""],
                                                        title: "",
                                                    }

                                                    specificData.components.contact.contacts = [...specificData.components.contact.contacts, newComponent]

                                                    updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
                                                }}
                                            >Add Contact</button>
                                        </div>
                                    </div>
                                </>
                            ) : eachFormTabKey === "nav" ? (
                                <>
                                    {/* form nav links */}
                                    {Object.entries(specificData.nav).map(eachNavOptionEntry => {
                                        const eachNavOptionName = eachNavOptionEntry[0] as keyof specificDataForAAAAType["nav"]
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


// function DisplayFormInfo({ inputKey, inputObj, eachPageKey, eachSectionKey, seenIndex, seenIndex2, specificData, seenProjectToTemplate, updateProjectsToTemplate }: { inputKey: string, inputObj: formInputType, eachPageKey: string, eachSectionKey: string, seenIndex?: number, seenIndex2?: number, specificData: specificDataForAAAAType, seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {

//     return (
//         <div className={styles.formInputCont}>
//             {inputObj.label !== undefined && <label htmlFor={inputKey}>{inputObj.label}</label>}

//             {inputObj.fieldType === "input" ? (
//                 <input id={inputKey} type={"text"} name={inputKey} value={inputObj.value} placeholder={inputObj.placeHolder ?? "type your text here"}
//                     onChange={(e) => {
//                         const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

//                         if (seenSectionObj.fieldType === "section") {
//                             seenSectionObj.inputs[inputKey].value = e.target.value

//                         } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
//                             const seenInputKey = inputKey as keyof contactComponentType["component"][number]

//                             // set all but text
//                             if (seenInputKey !== "texts") {
//                                 seenSectionObj.component[seenIndex][seenInputKey].value = e.target.value
//                             }

//                             //set text
//                             if (seenIndex2 !== undefined) {
//                                 seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = e.target.value
//                             }
//                         }

//                         updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
//                     }}
//                 />
//             ) : inputObj.fieldType === "number" ? (
//                 <input id={inputKey} type={"text"} name={inputKey} value={`${inputObj.value}`} placeholder={inputObj.placeHolder ?? "type numbers here"} onChange={(e) => {
//                     let parsedNum = parseFloat(e.target.value)
//                     if (isNaN(parsedNum)) parsedNum = 0

//                     const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

//                     if (seenSectionObj.fieldType === "section") {
//                         seenSectionObj.inputs[inputKey].value = parsedNum

//                     } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
//                         const seenInputKey = inputKey as keyof contactComponentType["component"][number]

//                         // set all but text
//                         if (seenInputKey !== "texts") {
//                             seenSectionObj.component[seenIndex][seenInputKey].value = parsedNum
//                         }

//                         if (seenIndex2 !== undefined) {
//                             //set text
//                             seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = parsedNum
//                         }
//                     }

//                     updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })

//                 }} />

//             ) : inputObj.fieldType === "textarea" ? (
//                 <textarea rows={5} id={inputKey} name={inputKey} value={inputObj.value} placeholder={inputObj.placeHolder ?? "type your text here"} onInput={(e) => {
//                     const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

//                     //@ts-expect-error value exits on text area
//                     const seenText = e.target.value

//                     if (seenSectionObj.fieldType === "section") {
//                         seenSectionObj.inputs[inputKey].value = seenText

//                     } else if (seenSectionObj.fieldType === "contactComponent" && seenIndex !== undefined) {
//                         const seenInputKey = inputKey as keyof contactComponentType["component"][number]

//                         // set all but text
//                         if (seenInputKey !== "texts") {
//                             seenSectionObj.component[seenIndex][seenInputKey].value = seenText
//                         }

//                         if (seenIndex2 !== undefined) {
//                             //set text
//                             seenSectionObj.component[seenIndex]["texts"][seenIndex2].value = seenText
//                         }
//                     }

//                     updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
//                 }} ></textarea>

//             ) : inputObj.fieldType === "image" ? (
//                 <div style={{ display: "grid", alignContent: "flex-start" }}>
//                     {/* upload image */}
//                     <input id={inputKey} type={"text"} name={inputKey} value={inputObj.value} placeholder={"type your image url here"}
//                         onChange={(e) => {
//                             const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

//                             if (seenSectionObj.fieldType === "section") {
//                                 seenSectionObj.inputs[inputKey].value = e.target.value
//                             }

//                             updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })
//                         }}
//                     />

//                     <button className='mainButton'>
//                         <label htmlFor='fileUpload' style={{ cursor: "pointer" }}>
//                             upload
//                         </label>
//                     </button>

//                     <input id='fileUpload' type="file" placeholder='Upload images' accept="image/*" style={{ display: "none" }}
//                         onChange={async (e) => {
//                             try {
//                                 if (!e.target.files) throw new Error("no files seen")

//                                 let totalUploadSize = 0
//                                 const uploadedFiles = e.target.files
//                                 const formData = new FormData();

//                                 for (let index = 0; index < uploadedFiles.length; index++) {
//                                     const file = uploadedFiles[index];

//                                     // Check if file is an image (this will be redundant because of the 'accept' attribute, but can be good for double-checking)
//                                     if (!file.type.startsWith("image/")) {
//                                         toast.error(`File ${file.name} is not an image.`);
//                                         continue;
//                                     }

//                                     // Check the file size
//                                     if (file.size > maxImageUploadSize) {
//                                         toast.error(`File ${file.name} is too large. Maximum size is ${convertBtyes(maxImageUploadSize, "mb")} MB`);
//                                         continue;
//                                     }

//                                     //add file size to totalUploadSize
//                                     totalUploadSize += file.size

//                                     formData.append(`file${index}`, file);
//                                 }

//                                 if (totalUploadSize > maxBodyToServerSize) throw new Error(`Please upload less than ${convertBtyes(maxBodyToServerSize, "mb")} MB at a time`)

//                                 const response = await fetch(`/api/userImages/add`, {
//                                     method: 'POST',
//                                     body: formData,
//                                 })

//                                 //array of image names
//                                 const seenData = await response.json();
//                                 console.log(`$seenData.imageNames`, seenData.imageNames);

//                                 //get the latest project images and upload project
//                                 const latestProject = await getSpecificProject({ option: "id", data: { id: seenProjectToTemplate.projectId } })
//                                 if (latestProject === undefined) throw new Error("trouble updating, not seeing latest project")

//                                 let latestImagesSeen: project["userUploadedImages"] = latestProject.userUploadedImages

//                                 if (latestImagesSeen === null) {
//                                     latestImagesSeen = [...seenData.imageNames]
//                                 } else {
//                                     latestImagesSeen = [...latestImagesSeen, ...seenData.imageNames]
//                                 }

//                                 //update the server
//                                 await updateProject({
//                                     id: seenProjectToTemplate.projectId,
//                                     userUploadedImages: latestImagesSeen
//                                 })

//                                 toast.success("image uploaded")

//                                 //update the local input
//                                 const seenSectionObj = specificData.pages[eachPageKey][eachSectionKey]

//                                 if (seenSectionObj.fieldType === "section") {
//                                     const newImageUrl = `${uploadedUserImagesStarterUrl}${seenData.imageNames[0]}`

//                                     seenSectionObj.inputs[inputKey].value = newImageUrl
//                                 }

//                                 updateProjectsToTemplate({ option: "specific", id: seenProjectToTemplate.id, data: specificData })

//                                 await refreshProjectPath({ id: seenProjectToTemplate.projectId })

//                             } catch (error) {
//                                 consoleAndToastError(error)
//                             }
//                         }}
//                     />
//                 </div>

//             ) : inputObj.fieldType === "video" ? (
//                 <p>video</p>

//             ) : inputObj.fieldType === "link" ? (
//                 <p>link</p>
//             ) : inputObj.fieldType === "svg" ? (
//                 <p>svg</p>
//             ) : null}
//         </div>
//     )
// }