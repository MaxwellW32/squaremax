"use client"
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./style.module.css"
import { newWebsite, newWebsiteSchema } from '@/types'
import { addWebsite } from '@/serverFunctions/handleWebsites'
import { useRouter } from 'next/navigation'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'
import { deepClone } from '@/utility/utility'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'

export default function AddWebsite() {
    const router = useRouter()

    const initialFormObj: newWebsite = {
        name: "",
    }

    const [formObj, formObjSet] = useState<newWebsite>(deepClone(initialFormObj))
    type websiteKeys = keyof newWebsite

    type moreFormInfoType = {
        [key in websiteKeys]: {
            label?: string,
            placeHolder?: string,
            type?: string,
            required?: boolean
            inputType: "input" | "textarea",
        }
    }
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

    function checkIfValid(seenFormObj: newWebsite, seenName: keyof newWebsite, schema: typeof newWebsiteSchema) {
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
            if (!newWebsiteSchema.safeParse(formObj).success) return toast.error("Form not valid")

            const addedWebsite = await addWebsite(formObj)

            toast.success(`Created Website ${formObj.name}!`)
            formObjSet(deepClone(initialFormObj))

            setTimeout(() => {
                router.push(`/websites/${addedWebsite.id}`)
            }, 2000);

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <div>
            <form className={styles.form} action={() => { }}>
                {Object.entries(formObj).map(eachEntry => {
                    const eachKey = eachEntry[0] as websiteKeys

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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newWebsiteSchema) }}
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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newWebsiteSchema) }}
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
        </div>
    )
}
