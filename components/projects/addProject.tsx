"use client"
import TextArea from '@/components/textArea/TextArea'
import TextInput from '@/components/textInput/TextInput'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import styles from "./style.module.css"
import { newProject, newProjectsSchema, project } from '@/types'
import { addProject, getProjectsFromUser } from '@/serverFunctions/handleProjects'
import { useRouter } from 'next/navigation'

export default function AddProject() {
    const router = useRouter()

    const initialFormObj: newProject = {
        name: "",
    }

    const [formObj, formObjSet] = useState<newProject>({ ...initialFormObj })
    type templateKeys = keyof newProject

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
        "name": {
            label: "name",
            placeHolder: "Enter project name",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in templateKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: newProject, seenName: keyof newProject, schema: typeof newProjectsSchema) {
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
            if (!newProjectsSchema.safeParse(formObj).success) return toast.error("Form not valid")

            const projectName = formObj.name

            // ensure project names are unique
            const seenProjects = await getProjectsFromUser()
            if (seenProjects.findIndex(eachProject => eachProject.name === projectName) !== -1) {
                toast.error("project names must be unique")

                return
            }

            await addProject(formObj)

            toast.success(`Created Project ${formObj.name}!`)
            formObjSet({ ...initialFormObj })

            setTimeout(() => {
                router.push(`/projects/${projectName}`)
            }, 2000);

        } catch (error) {
            toast.error("Couldn't send")
            console.log(`Couldn't send`, error);
        }
    }

    return (
        <div>
            <form className={styles.form} action={() => { }}>
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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newProjectsSchema) }}
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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newProjectsSchema) }}
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
