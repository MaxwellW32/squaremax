"use client"
import { globalFormDataType, linkedDataSchema, linkedDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState } from 'react'
import TextInput from '../textInput/TextInput'
import styles from "./styles.module.css"
import ShowMore from '../showMore/ShowMore'
import TextArea from '../textArea/TextArea'

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    const [linkedData, linkedDataSet] = useState<linkedDataType>({ ...seenLinkedData })

    type linkedDataTypeKeys = keyof linkedDataType

    type formInputInputType = {
        label?: string,
        placeHolder?: string,
        type?: "text" | "number",
        required?: boolean,

        inputType: "input"
    }

    type formInputTextareaType = {
        label?: string,
        placeHolder?: string,
        required?: boolean,
        inputType: "textarea"
    }

    type formInputImageType = {
        label?: string,
        placeHolder?: string,
        required?: boolean,

        inputType: "image"
    }

    type formInputType = formInputInputType | formInputTextareaType | formInputImageType

    type linkedDataSiteInfoKeys = keyof linkedDataType["siteInfo"]
    type linkedDataTestimonialsKeys = keyof linkedDataType["testimonials"][number]
    type linkedDataTeamKeys = keyof linkedDataType["team"][number]
    type linkedDataProductsKeys = keyof linkedDataType["products"][number]
    type linkedDataGalleryKeys = keyof linkedDataType["gallery"][number]
    type linkedDataServicesKeys = keyof linkedDataType["services"][number]
    type linkedDataSocialsKeys = keyof linkedDataType["socials"][number]

    // copy structure down to errors oject
    type moreFormInfoType = {
        "siteInfo": {
            [key in linkedDataSiteInfoKeys]: formInputType
        },
        "testimonials": {
            [key in linkedDataTestimonialsKeys]: formInputType
        },
        "team": {
            [key in linkedDataTeamKeys]: formInputType
        },
        "products": {
            [key in linkedDataProductsKeys]: formInputType
        },
        "gallery": {
            [key in linkedDataGalleryKeys]: formInputType
        },
        "services": {
            [key in linkedDataServicesKeys]: formInputType
        },
        "socials": {
            [key in linkedDataSocialsKeys]: formInputType
        },
    }

    const [moreFormInfo,] = useState<moreFormInfoType>({
        "siteInfo": {
            "phone": {
                label: "Phone Number",
                placeHolder: "Enter your phone number",
                inputType: "input",
            },
            "address": {
                label: "Website Address",
                placeHolder: "Enter the physical address of your business",
                inputType: "input"
            },
            "websiteName": {
                label: "Website Name",
                placeHolder: "Enter your website's name",
                inputType: "input"
            },
            "websiteTitle": {
                label: "Website Title",
                placeHolder: "Enter the title of your website (appears in browser tab)",
                inputType: "input"
            },
            "websiteDescription": {
                label: "Website Description",
                placeHolder: "Enter a brief description of your website or business",
                inputType: "textarea"
            },
            "logo": {
                label: "Website Logo",
                placeHolder: "Upload your website's logo image",
                inputType: "image"
            },
            "opengraphLogo": {
                label: "Open Graph Logo",
                placeHolder: "Upload a logo for social media previews",
                inputType: "image"
            },
            "email": {
                label: "Email Address",
                placeHolder: "Enter your contact email address",
                inputType: "input"
            },
            "workingHours": {
                label: "Working Hours",
                placeHolder: "Enter your business's working hours",
                inputType: "input"
            },
            "favicon": {
                label: "Favicon",
                placeHolder: "Upload a favicon image for your website",
                inputType: "image"
            },
            "copyrightInformation": {
                label: "Copyright Information",
                placeHolder: "Enter copyright information (e.g., © 2024 Your Company)",
                inputType: "input"
            }
        },
        "testimonials": {
            name: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            position: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            photo: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            text: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            rating: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            date: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            links: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            company: {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
        },
        "team": {
            "name": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "position": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "photo": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "bio": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "links": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "email": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "phone": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "skills": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "achievements": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
        },
        "products": {
            "name": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "description": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "price": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "images": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "sku": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "categories": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "tags": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "available": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "featured": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "discounts": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "ratings": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "productTestimonials": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
        },
        "gallery": {
            "title": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "description": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "image": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "categories": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "tags": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "featured": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "date": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "author": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
        },
        "services": {
            "title": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "description": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "price": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "icon": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "duration": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "tags": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "callToAction": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "availability": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "serviceTestimonials": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
        },
        "socials": {
            "platform": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "url": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "icon": {
                label: "",
                placeHolder: "",
                inputType: "input"
            },
            "description": {
                label: "",
                placeHolder: "",
                inputType: "input"
            }
        }
    })

    type formErrorsType = { [key in linkedDataTypeKeys]: { [key: string]: string } }
    const [formErrors, formErrorsSet] = useState<formErrorsType>({
        siteInfo: {},
        testimonials: {},
        team: {},
        products: {},
        gallery: {},
        services: {},
        socials: {},
    })

    function checkIfValid(seenMainKey: linkedDataTypeKeys, seenName: string, seenValue: unknown) {
        //@ts-expect-error ts not seeing type
        const testSchema = linkedDataSchema.shape[seenMainKey].pick({ [seenName]: true }).safeParse({ [seenName]: seenValue });

        if (testSchema.success) {//worked
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }

                delete newObj[seenMainKey][seenName]

                return newObj
            })

            return true

        } else {
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }

                let errorMessage = ""

                JSON.parse(testSchema.error.message).forEach((eachErrorObj: Error) => {
                    errorMessage += ` ${eachErrorObj.message}`
                })

                newObj[seenMainKey][seenName] = errorMessage

                return newObj
            })

            return false
        }
    }

    function formHasErrorCheck(seenErrorsObj: formErrorsType): boolean {
        let errorsFound = false

        Object.entries(seenErrorsObj).forEach(eachErrorsObjEntry => {
            const errorsObjValue = eachErrorsObjEntry[1]

            if (Object.entries(errorsObjValue).length > 0) {
                errorsFound = true
            }
        })

        return errorsFound;
    }

    function canSaveDataToMain() {
        //make sure no issues in the form overall
        if (formHasErrorCheck(formErrors)) {
            console.log(`$form had errors`);
            return
        }

        console.log(`$success, went to update global linkedData`);
        updateProjectsToTemplate({ option: "linked", id: seenProjectToTemplate.id, data: linkedData })
    }

    return (
        <ShowMore label='Linked data' content={(
            <div style={{ display: "grid", alignContent: "flex-start" }}>
                {/* notify */}
                {formHasErrorCheck(formErrors) && (<h3>progress wont be saved until errors are resolved</h3>)}

                {/* specific info */}
                <div className={styles.formInputCont}>
                    {Object.entries(linkedData["siteInfo"]).map(eachSiteInfoEntry => {
                        const eachSiteInfoKey = eachSiteInfoEntry[0] as linkedDataSiteInfoKeys
                        const eachSiteInfoValue = eachSiteInfoEntry[1]

                        const seenMoreFormInfo = moreFormInfo["siteInfo"][eachSiteInfoKey]

                        // special display for work hours array
                        if (eachSiteInfoKey === "workingHours") {
                            const workingHoursArr = eachSiteInfoValue as linkedDataType["siteInfo"]["workingHours"]

                            return (
                                <React.Fragment key={eachSiteInfoKey}>
                                    <label>{eachSiteInfoKey}</label>

                                    {/* working hours map */}
                                    <div className='snap' style={{ display: "grid", gridAutoColumns: "min(300px, 90%)", overflow: "auto", gridAutoFlow: "column", gap: "2rem" }}>
                                        {workingHoursArr.map((eachWorkHour, eachWorkHourIndex) => {

                                            return (
                                                <div key={eachWorkHourIndex} className={styles.formInputCont}>
                                                    <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                                        onClick={() => {
                                                            linkedDataSet(prevLinkedData => {
                                                                const newLinkedData = JSON.parse(JSON.stringify(prevLinkedData)) as linkedDataType

                                                                newLinkedData.siteInfo.workingHours = newLinkedData.siteInfo.workingHours.filter((eachWorkingHoursFilter, eachWorkingHoursFilterIndex) => eachWorkingHoursFilterIndex !== eachWorkHourIndex)

                                                                return newLinkedData
                                                            })
                                                        }}
                                                    >close</button>

                                                    <TextInput
                                                        name={`${eachSiteInfoKey}${eachWorkHourIndex}`}//
                                                        value={`${eachWorkHour}`}
                                                        label={`${eachWorkHourIndex}`}
                                                        placeHolder={`${seenMoreFormInfo.placeHolder} ${eachWorkHourIndex}`}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            //possible change to allow valid updates to template immediately
                                                            linkedDataSet(prevLinkedData => {
                                                                const newLinkedData = { ...prevLinkedData }

                                                                newLinkedData.siteInfo.workingHours[eachWorkHourIndex] = e.target.value

                                                                return newLinkedData
                                                            })
                                                        }}
                                                        onBlur={() => {
                                                            const inputValid = checkIfValid("siteInfo", eachSiteInfoKey, workingHoursArr)

                                                            if (inputValid) canSaveDataToMain()
                                                        }}
                                                        errors={formErrors["siteInfo"][eachSiteInfoKey]}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* add to work hours button  */}
                                    <button className='mainButton'
                                        onClick={() => {
                                            linkedDataSet(prevLinkedData => {
                                                const newLinkedData = JSON.parse(JSON.stringify(prevLinkedData))

                                                const newWorkHour: linkedDataType["siteInfo"]["workingHours"][number] = ""

                                                newLinkedData.siteInfo.workingHours = [...newLinkedData.siteInfo.workingHours, newWorkHour]

                                                return newLinkedData
                                            })
                                        }}
                                    >add</button>
                                </React.Fragment>
                            )
                        }

                        return (
                            <React.Fragment key={eachSiteInfoKey}>
                                {seenMoreFormInfo.inputType === "input" ? (
                                    <TextInput
                                        name={eachSiteInfoKey}
                                        value={`${eachSiteInfoValue}`}
                                        type={seenMoreFormInfo.type}
                                        label={seenMoreFormInfo.label}
                                        placeHolder={seenMoreFormInfo.placeHolder}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            linkedDataSet(prevLinkedData => {
                                                const newLinkedData = { ...prevLinkedData }

                                                const newSiteInfo = newLinkedData["siteInfo"]

                                                if (seenMoreFormInfo.type === undefined || seenMoreFormInfo.type === "text") {
                                                    newSiteInfo[eachSiteInfoKey] = e.target.value

                                                } else if (seenMoreFormInfo.type === "number") {
                                                    const parsedNum = parseFloat(e.target.value)

                                                    //@ts-expect-error can make the field type a number in this case
                                                    newSiteInfo[eachSiteInfoKey] = isNaN(parsedNum) ? 0 : parsedNum
                                                }

                                                return newLinkedData
                                            })
                                        }}
                                        onBlur={() => {
                                            const inputValid = checkIfValid("siteInfo", eachSiteInfoKey, eachSiteInfoValue)

                                            if (inputValid) canSaveDataToMain()
                                        }}
                                        errors={formErrors["siteInfo"][eachSiteInfoKey]}
                                    />
                                ) :
                                    seenMoreFormInfo.inputType === "textarea" ? (
                                        <TextArea
                                            name={eachSiteInfoKey}
                                            value={`${eachSiteInfoValue}`}
                                            label={seenMoreFormInfo.label}
                                            placeHolder={seenMoreFormInfo.placeHolder}
                                            onInput={e => {
                                                linkedDataSet(prevLinkedData => {
                                                    const newLinkedData = { ...prevLinkedData }
                                                    //@ts-expect-error ts not seeing type
                                                    const seenText = e.target.value

                                                    const newSiteInfo = newLinkedData["siteInfo"]

                                                    newSiteInfo[eachSiteInfoKey] = seenText

                                                    return newLinkedData
                                                })
                                            }}
                                            onBlur={() => {
                                                const inputValid = checkIfValid("siteInfo", eachSiteInfoKey, eachSiteInfoValue)

                                                if (inputValid) canSaveDataToMain()
                                            }}
                                            errors={formErrors["siteInfo"][eachSiteInfoKey]}
                                        />
                                    ) :
                                        seenMoreFormInfo.inputType === "image" ? (
                                            <></>
                                        ) : null}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        )} />
    )
}