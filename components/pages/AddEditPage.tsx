"use client"
import React, { HTMLAttributes, useState } from 'react'
import styles from "./style.module.css"
import { newPage, newPageSchema, page, pageSchema, updatePageSchema, website } from '@/types'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'
import { deepClone } from '@/utility/utility'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { addWebsitePage, refreshWebsitePath, updateWebsitePage } from '@/serverFunctions/handleWebsites'
import toast from 'react-hot-toast'

export default function AddEditPage({ seenWebsite, sentPage, sentPageId, ...elProps }: { seenWebsite: website, sentPage?: page, sentPageId?: string } & HTMLAttributes<HTMLFormElement>) {
    const initialFormObj: newPage = {
        name: "",
    }

    //form object hold page partial values
    //form obj can be set from newPage or update page requirements

    //assign either a new form, or the safe values on an update form
    const [formObj, formObjSet] = useState<Partial<page>>(deepClone(sentPage !== undefined ? updatePageSchema.parse(sentPage) : initialFormObj))
    type pageKeys = keyof Partial<page>

    type moreFormInfoType = Partial<{
        [key in Partial<pageKeys>]: {
            label?: string,
            placeHolder?: string,
            type?: string,
            required?: boolean
            inputType: "input" | "textarea",
        } }>
    const [moreFormInfo,] = useState<moreFormInfoType>({
        "name": {
            label: "name",
            inputType: "input",
            placeHolder: "Enter page name",
        },
        pageComponents: {
            label: "page components",
            inputType: "input",
            placeHolder: "Enter page name",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{ [key in pageKeys]: string }>>({})

    function checkIfValid(seenFormObj: Partial<page>, seenName: keyof Partial<page>, schema: typeof pageSchema) {
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
            if (sentPage === undefined) {
                //add new
                const validatedNewPage = newPageSchema.parse(formObj)

                await addWebsitePage(seenWebsite.id, validatedNewPage)
                await refreshWebsitePath({ id: seenWebsite.id })

                toast.success("page added")
                formObjSet(deepClone(initialFormObj))

            } else {
                if (sentPageId === undefined) throw new Error("need page id")

                //update
                const validatedUpdatedPage = updatePageSchema.parse(formObj)

                await updateWebsitePage(seenWebsite.id, sentPageId, validatedUpdatedPage)
                await refreshWebsitePath({ id: seenWebsite.id })
                toast.success("page updated")
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <form {...elProps} className={styles.form} action={() => { }}>
            {Object.entries(formObj).map(eachEntry => {
                const eachKey = eachEntry[0] as pageKeys

                if (eachKey === "pageComponents") return null

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
                                onBlur={() => { checkIfValid(formObj, eachKey, pageSchema) }}
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
                                onBlur={() => { checkIfValid(formObj, eachKey, pageSchema) }}
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
