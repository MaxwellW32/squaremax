"use client"
import React, { HTMLAttributes, useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./style.module.css"
import { newPage, newPageSchema, website } from '@/types'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'
import { deepClone } from '@/utility/utility'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { addWebsitePage, refreshWebsitePath } from '@/serverFunctions/handleWebsites'

export default function AddPage({ seenWebsite, handleWebsiteUpdate, ...elProps }: { seenWebsite: website, handleWebsiteUpdate(newWebsite: website): Promise<void> } & HTMLAttributes<HTMLFormElement>) {
    const initialFormObj: newPage = {
        name: "",
    }

    const [formObj, formObjSet] = useState<newPage>(deepClone(initialFormObj))
    type pageKeys = keyof newPage

    type moreFormInfoType = {
        [key in pageKeys]: {
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
            placeHolder: "Enter page name",
        }
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in pageKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: newPage, seenName: keyof newPage, schema: typeof newPageSchema) {
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
            if (!newPageSchema.safeParse(formObj).success) return toast.error("Form not valid")

            await addWebsitePage(seenWebsite.id, formObj)

            await refreshWebsitePath({ id: seenWebsite.id })

            formObjSet(deepClone(initialFormObj))

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <form {...elProps} className={styles.form} action={() => { }}>
            {Object.entries(formObj).map(eachEntry => {
                const eachKey = eachEntry[0] as pageKeys

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
                                onBlur={() => { checkIfValid(formObj, eachKey, newPageSchema) }}
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
                                onBlur={() => { checkIfValid(formObj, eachKey, newPageSchema) }}
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
