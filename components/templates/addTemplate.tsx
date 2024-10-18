"use client"
import TextArea from '@/components/textArea/TextArea'
import TextInput from '@/components/textInput/TextInput'
import { addTemplate, updateTemplate } from '@/serverFunctions/handleTemplates'
import { newTemplate, newTemplatesSchema, template } from '@/types'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./style.module.css"

export default function AddTemplate({ oldTemplate }: { oldTemplate?: template }) {
    const initialFormObj: template | newTemplate = oldTemplate ? { ...oldTemplate } : {
        id: "",
        name: "",
        github: "",
        url: "",
    }
    const [formObj, formObjSet] = useState<newTemplate>({ ...initialFormObj })
    type templateKeys = keyof newTemplate

    type moreFormInfoType = {
        [key in templateKeys]: {
            label?: string,
            placeHolder?: string,
            type?: string,
            required?: boolean
            inputType?: "input" | "textarea",
        }
    }
    const [moreFormInfo,] = useState<moreFormInfoType>({
        "id": {
            label: "id",
            placeHolder: "Enter template id",
        },
        "name": {
            label: "name",
            placeHolder: "Enetr template name",
        },
        "github": {
            label: "github",
            placeHolder: "Enter github clone link",
        },
        "url": {
            label: "url",
            placeHolder: "Enter link template can be viewed",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in templateKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: newTemplate, seenName: keyof newTemplate, schema: typeof newTemplatesSchema) {
        //@ts-expect-error can check name here
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
            if (!newTemplatesSchema.safeParse(formObj).success) return toast.error("Form not valid")

            if (oldTemplate === undefined) {
                //new templae
                await addTemplate(formObj)

            } else {

                //update template
                await updateTemplate(formObj)
            }

            toast.success("Sent!")
            formObjSet({ ...initialFormObj })

        } catch (error) {
            toast.error("Couldn't send")
            console.log(`Couldn't send`, error);
        }
    }

    return (
        <div>
            <form className={styles.form} action={() => { }} >
                {Object.entries(formObj).map(eachEntry => {
                    const eachKey = eachEntry[0] as templateKeys

                    return (
                        <React.Fragment key={eachKey}>
                            {moreFormInfo[eachKey].inputType === undefined || moreFormInfo[eachKey].inputType === "input" ? (
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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newTemplatesSchema) }}
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
                                            //@ts-expect-error can write e.target.value
                                            newFormObj[eachKey] = e.target.value
                                            return newFormObj
                                        })
                                    }}
                                    onBlur={() => { checkIfValid(formObj, eachKey, newTemplatesSchema) }}
                                    errors={formErrors[eachKey]}
                                />
                            ) : null}
                        </React.Fragment>
                    )
                })}

                <button
                    onClick={handleSubmit}
                >Submit</button>
            </form>
        </div>
    )
}
