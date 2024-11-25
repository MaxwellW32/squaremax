"use client"
import { globalFormDataType, linkedDataSchema, linkedDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState, useEffect, useMemo } from 'react'
import TextInput from '../textInput/TextInput'
import styles from "./styles.module.css"
import ShowMore from '../showMore/ShowMore'
import TextArea from '../textArea/TextArea'

//edit and send data up
//if data not valid dont send up

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

type formErrorsType = { [key in linkedDataTypeKeys]: { [key: string]: string } }

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    const [localLinkedData, localLinkedDataSet] = useState<linkedDataType>({ ...seenLinkedData })

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
                label: "Name",
                placeHolder: "Enter the person's full name",
                inputType: "input"
            },
            position: {
                label: "Position",
                placeHolder: "Enter the person's position or job title",
                inputType: "input"
            },
            photo: {
                label: "Photo",
                placeHolder: "Upload a photo of the person (optional)",
                inputType: "input"
            },
            text: {
                label: "Testimonial",
                placeHolder: "Enter the testimonial or review text",
                inputType: "input"
            },
            rating: {
                label: "Rating",
                placeHolder: "Rate from 1 to 5",
                type: "number",
                inputType: "input"
            },
            date: {
                label: "Date",
                placeHolder: "Select the date of the testimonial",
                inputType: "input"
            },
            links: {
                label: "Links",
                placeHolder: "Provide any relevant links (e.g., LinkedIn, Website)",
                inputType: "input"
            },
            company: {
                label: "Company",
                placeHolder: "Enter the name of the company (if applicable)",
                inputType: "input"
            }
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

    const [formErrors, formErrorsSet] = useState<formErrorsType>({
        siteInfo: {},
        testimonials: {},
        team: {},
        products: {},
        gallery: {},
        services: {},
        socials: {},
    })

    const formHasErrors = useMemo(() => {
        let seeingErrors = false

        Object.entries(formErrors).forEach(eachFormErrorsEntry => {
            const seenFormErrorsValue = eachFormErrorsEntry[1]

            if (Object.entries(seenFormErrorsValue).length > 0) {
                seeingErrors = true
            }
        })
        return seeingErrors
    }, [formErrors])

    //send up to main
    useEffect(() => {
        const linkedDataValidTest = linkedDataSchema.safeParse(localLinkedData)

        if (!linkedDataValidTest.success) return

        updateProjectsToTemplate({ option: "linked", id: seenProjectToTemplate.id, data: linkedDataValidTest.data })
    }, [localLinkedData])

    function checkIfInputValid(seenObj: { seenMainKey: linkedDataTypeKeys, seenValue: unknown, seenName: string, for: "object" } | { seenMainKey: linkedDataTypeKeys, seenName: string, seenValue: unknown, for: "array" }): boolean {
        if (seenObj.for === "array") {
            //check array values
            const testSchema = linkedDataSchema.shape[seenObj.seenMainKey].safeParse(seenObj.seenValue);

            if (testSchema.success) {//worked
                formErrorsSet(prevObj => {
                    const newObj = { ...prevObj }

                    delete newObj[seenObj.seenMainKey][seenObj.seenName]

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

                    newObj[seenObj.seenMainKey][seenObj.seenName] = errorMessage

                    return newObj
                })

                return false
            }
        } else {
            //check object values
            // @ts-expect-error ts not 
            const testSchema = linkedDataSchema.shape[seenObj.seenMainKey].pick({ [seenObj.seenName]: true }).safeParse({ [seenObj.seenName]: seenObj.seenValue });

            if (testSchema.success) {//worked
                formErrorsSet(prevObj => {
                    const newObj = { ...prevObj }

                    delete newObj[seenObj.seenMainKey][seenObj.seenName]

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

                    newObj[seenObj.seenMainKey][seenObj.seenName] = errorMessage

                    return newObj
                })

                return false
            }
        }
    }

    return (
        <ShowMore label='Linked data' content={(
            <div style={{ display: "grid", alignContent: "flex-start" }}>
                {/* notify */}
                {formHasErrors && (<h3>progress wont be saved until errors are resolved</h3>)}

                {/* specific info */}
                <ShowMore label='website info' content={(
                    <div className={styles.formInputCont}>
                        {Object.entries(localLinkedData["siteInfo"]).map(eachSiteInfoEntry => {
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
                                        <div className={`${styles.scrollCont} snap`}>
                                            {workingHoursArr.map((eachWorkHour, eachWorkHourIndex) => {

                                                return (
                                                    <div key={eachWorkHourIndex} className={styles.formInputCont}>
                                                        <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                                            onClick={() => {
                                                                localLinkedDataSet(prevLinkedData => {
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
                                                                localLinkedDataSet(prevLinkedData => {
                                                                    const newLinkedData = { ...prevLinkedData }

                                                                    newLinkedData.siteInfo.workingHours[eachWorkHourIndex] = e.target.value

                                                                    return newLinkedData
                                                                })
                                                            }}
                                                            onBlur={() => {
                                                                checkIfInputValid({ for: "object", seenMainKey: "siteInfo", seenName: eachSiteInfoKey, seenValue: workingHoursArr })
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
                                                localLinkedDataSet(prevLinkedData => {
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
                                                localLinkedDataSet(prevLinkedData => {
                                                    const newLinkedData = { ...prevLinkedData }

                                                    const newSiteInfo = newLinkedData["siteInfo"]

                                                    if (seenMoreFormInfo.type === undefined || seenMoreFormInfo.type === "text") {
                                                        newSiteInfo[eachSiteInfoKey] = e.target.value

                                                    } else if (seenMoreFormInfo.type === "number") {
                                                        const parsedNum = parseFloat(e.target.value)

                                                        //@ts-expect-error can make the field type a number in this case
                                                        newSiteInfo[eachSiteInfoKey] = isNaN(parsedNum) ? 0 : parsedNum
                                                    }

                                                    //ensure we always set the local to update with use input
                                                    return newLinkedData
                                                })
                                            }}
                                            onBlur={() => {
                                                checkIfInputValid({ for: "object", seenMainKey: "siteInfo", seenName: eachSiteInfoKey, seenValue: eachSiteInfoValue })
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
                                                    localLinkedDataSet(prevLinkedData => {
                                                        const newLinkedData = { ...prevLinkedData }
                                                        //@ts-expect-error ts not seeing type
                                                        const seenText = e.target.value

                                                        const newSiteInfo = newLinkedData["siteInfo"]

                                                        newSiteInfo[eachSiteInfoKey] = seenText

                                                        return newLinkedData
                                                    })
                                                }}
                                                onBlur={() => {
                                                    checkIfInputValid({ for: "object", seenMainKey: "siteInfo", seenName: eachSiteInfoKey, seenValue: eachSiteInfoValue })
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
                )} />

                {/* testimonials map */}
                <ShowMore label='testimonials' content={(
                    <div style={{ display: "grid", alignContent: "flex-start" }}>
                        <div className={`${styles.scrollCont} snap`}>
                            {localLinkedData["testimonials"].map((eachTestimonial, eachTestimonialIndex) => {
                                const wantedKeyName: linkedDataTypeKeys = "testimonials"

                                return (
                                    <div key={eachTestimonialIndex} className={styles.formInputCont}>
                                        <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                                            onClick={() => {
                                                localLinkedDataSet(prevLinkedData => {
                                                    const newLinkedData = JSON.parse(JSON.stringify(prevLinkedData)) as linkedDataType

                                                    newLinkedData.testimonials = newLinkedData.testimonials.filter((eachTestimonialFilter, eachTestimonialFilterIndex) => eachTestimonialFilterIndex !== eachTestimonialIndex)

                                                    return newLinkedData
                                                })
                                            }}
                                        >close</button>

                                        {Object.entries(eachTestimonial).map(eachTestimonialEntry => {
                                            const eachTestimonialObjKey = eachTestimonialEntry[0] as linkedDataTestimonialsKeys
                                            const eachTestimonialObjValue = eachTestimonialEntry[1]

                                            const seenMoreFormInfo = moreFormInfo["testimonials"][eachTestimonialObjKey]

                                            if (eachTestimonialObjKey === "rating") return null
                                            if (eachTestimonialObjKey === "links") return null

                                            return (
                                                <React.Fragment key={eachTestimonialObjKey}>
                                                    {seenMoreFormInfo.inputType === "input" ? (
                                                        <TextInput
                                                            name={eachTestimonialObjKey}
                                                            value={`${eachTestimonialObjValue}`}
                                                            type={seenMoreFormInfo.type}
                                                            label={seenMoreFormInfo.label}
                                                            placeHolder={seenMoreFormInfo.placeHolder}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                localLinkedDataSet(prevLinkedData => {
                                                                    const newLinkedData = { ...prevLinkedData }

                                                                    if (seenMoreFormInfo.type === undefined || seenMoreFormInfo.type === "text") {
                                                                        newLinkedData[wantedKeyName][eachTestimonialIndex][eachTestimonialObjKey] = e.target.value

                                                                    } else if (seenMoreFormInfo.type === "number") {
                                                                        const parsedNum = parseFloat(e.target.value)

                                                                        //@ts-expect-error can make the field type a number in this case
                                                                        newLinkedData[wantedKeyName][eachTestimonialIndex][eachTestimonialObjKey] = isNaN(parsedNum) ? 0 : parsedNum
                                                                    }

                                                                    //ensure we always set the local to update with use input
                                                                    return newLinkedData
                                                                })
                                                            }}
                                                            onBlur={() => {
                                                                checkIfInputValid({ for: "array", seenMainKey: wantedKeyName, seenName: eachTestimonialObjKey, seenValue: localLinkedData["testimonials"] })
                                                            }}
                                                            errors={formErrors[wantedKeyName][eachTestimonialObjKey]}
                                                        />
                                                    ) :
                                                        seenMoreFormInfo.inputType === "textarea" ? (
                                                            <TextArea
                                                                name={eachTestimonialObjKey}
                                                                value={`${eachTestimonialObjValue}`}
                                                                label={seenMoreFormInfo.label}
                                                                placeHolder={seenMoreFormInfo.placeHolder}
                                                                onInput={e => {
                                                                    localLinkedDataSet(prevLinkedData => {
                                                                        const newLinkedData = { ...prevLinkedData }
                                                                        //@ts-expect-error ts not seeing type
                                                                        const seenText = e.target.value

                                                                        newLinkedData[wantedKeyName][eachTestimonialIndex][eachTestimonialObjKey] = seenText

                                                                        return newLinkedData
                                                                    })
                                                                }}
                                                                onBlur={() => {
                                                                    checkIfInputValid({ for: "array", seenMainKey: wantedKeyName, seenName: eachTestimonialObjKey, seenValue: localLinkedData["testimonials"] })
                                                                }}
                                                                errors={formErrors[wantedKeyName][eachTestimonialObjKey]}
                                                            />
                                                        ) :
                                                            seenMoreFormInfo.inputType === "image" ? (
                                                                <></>
                                                            ) : null}
                                                </React.Fragment>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>

                        {/* add button  */}
                        <button className='mainButton'
                            onClick={() => {
                                localLinkedDataSet(prevLinkedData => {
                                    const newLinkedData = JSON.parse(JSON.stringify(prevLinkedData))
                                    const newTestimonial: linkedDataType["testimonials"][number] = {
                                        name: "",
                                        position: "",
                                        photo: "",
                                        text: "",
                                        rating: 0,
                                        date: "",
                                        links: [],
                                        company: "",
                                    }

                                    newLinkedData.testimonials = [...newLinkedData.testimonials, newTestimonial]

                                    return newLinkedData
                                })
                            }}
                        >add</button>
                    </div>
                )} />
            </div>
        )} />
    )
}