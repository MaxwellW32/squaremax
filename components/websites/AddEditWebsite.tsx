"use client"
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./style.module.css"
import { newWebsite, newWebsiteSchema, updateWebsiteSchema, website, websiteSchema } from '@/types'
import { addWebsite, refreshWebsitePath, updateTheWebsite } from '@/serverFunctions/handleWebsites'
import { useRouter } from 'next/navigation'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'
import { deepClone } from '@/utility/utility'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

export default function AddEditWebsite({ sentWebsite }: { sentWebsite?: website }) {
    const router = useRouter()

    const initialFormObj: newWebsite = {
        name: "",
    }

    const [formObj, formObjSet] = useState<Partial<website>>(deepClone(sentWebsite === undefined ? initialFormObj : updateWebsiteSchema.parse(sentWebsite)))
    type websiteKeys = keyof Partial<website>

    type moreFormInfoType = Partial<{
        [key in websiteKeys]: {
            label?: string,
            placeHolder?: string,
            type?: string,
            required?: boolean
            inputType: "input" | "textarea",
        }
    }>

    const [moreFormInfo,] = useState<moreFormInfoType>({
        "name": {
            label: "name",
            inputType: "input",
            placeHolder: "Enter website name",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in websiteKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: Partial<website>, seenName: keyof Partial<website>, schema: typeof websiteSchema) {
        //@ts-expect-error type
        const testSchema = schema.pick({ [seenName]: true }).safeParse(seenFormObj);

        if (testSchema.success) {//worked
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }
                delete newObj[seenName]

                return newObj
            })

        } else {
            formErrorsSet(prevObj => {
                const newObj = { ...prevObj }

                let errorMessage = ""

                JSON.parse(testSchema.error.message).forEach((eachErrorObj: Error) => {
                    errorMessage += ` ${eachErrorObj.message}`
                })

                newObj[seenName] = errorMessage

                return newObj
            })
        }
    }

    async function handleSubmit() {
        try {
            if (sentWebsite === undefined) {
                //new website
                const validatedNewWebsite = newWebsiteSchema.parse(formObj)

                const addedWebsite = await addWebsite(validatedNewWebsite)

                toast.success(`Created Website ${formObj.name}!`)
                formObjSet(deepClone(initialFormObj))

                setTimeout(() => {
                    router.push(`/websites/${addedWebsite.id}`)
                }, 2000);

            } else {
                //update website
                const validatedUpdateWebsite = updateWebsiteSchema.parse(formObj)
                await updateTheWebsite(sentWebsite.id, validatedUpdateWebsite)

                //refresh
                refreshWebsitePath({ id: sentWebsite.id })

                toast.success("updated website!")
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    //respond to changes above
    useEffect(() => {
        if (sentWebsite === undefined) return

        formObjSet(updateWebsiteSchema.parse(sentWebsite))
    }, [sentWebsite])

    return (
        <form className={styles.form} action={() => { }}>
            {Object.entries(formObj).map(eachEntry => {
                const eachKey = eachEntry[0] as websiteKeys

                if (eachKey === "fonts" || eachKey === "fromUser" || eachKey === "userUploadedImages" || eachKey === "pages" || eachKey === "usedComponents") return null

                if (moreFormInfo[eachKey] === undefined) return null

                return (
                    <React.Fragment key={eachKey}>
                        {moreFormInfo[eachKey].inputType === "input" ? (
                            <TextInput
                                name={eachKey}
                                value={`${formObj[eachKey]}`}
                                type={moreFormInfo[eachKey].type}
                                label={moreFormInfo[eachKey].label}
                                placeHolder={moreFormInfo[eachKey].placeHolder}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formObjSet(prevFormObj => {
                                        const newFormObj = { ...prevFormObj }
                                        newFormObj[eachKey] = e.target.value
                                        return newFormObj
                                    })
                                }}
                                onBlur={() => { checkIfValid(formObj, eachKey, websiteSchema) }}
                                errors={formErrors[eachKey]}
                            />
                        ) : moreFormInfo[eachKey].inputType === "textarea" ? (
                            <TextArea
                                name={eachKey}
                                value={`${formObj[eachKey]}`}
                                label={moreFormInfo[eachKey].label}
                                placeHolder={moreFormInfo[eachKey].placeHolder}
                                onInput={(e) => {
                                    formObjSet(prevFormObj => {
                                        const newFormObj = { ...prevFormObj }
                                        //@ts-expect-error type
                                        newFormObj[eachKey] = e.target.value
                                        return newFormObj
                                    })
                                }}
                                onBlur={() => { checkIfValid(formObj, eachKey, websiteSchema) }}
                                errors={formErrors[eachKey]}
                            />
                        ) : null}
                    </React.Fragment>
                )
            })}

            <button className='mainButton' style={{ justifySelf: "center" }}
                onClick={handleSubmit}
            >Submit</button>
        </form>
    )
}
