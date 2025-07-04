"use client"
import React, { useEffect, useState } from 'react'
import path from "path"
import styles from "./addTemplate.module.css"
import { toast } from 'react-hot-toast'
import { category, collection, template, templatesSchema, newTemplate, newTemplateSchema } from '@/types'
import { deepClone } from '@/utility/utility'
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { addTemplate, deleteTemplate, removeEntryFromGlobalTemplatesFile, updateTemplate } from '@/serverFunctions/handleTemplates'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast'
import { deleteDirectory } from '@/serverFunctions/handleServerFiles'
import { websiteTemplatesDir } from '@/lib/websiteTemplateLib'
import TextInput from '@/components/textInput/TextInput'
import TextArea from '@/components/textArea/TextArea'
import ConfirmationBox from '@/components/confirmationBox/ConfirmationBox'
import { templateDataSchema } from '@/types/templateDataTypes'

export default function AddEditTemplate({ oldTemplate }: { oldTemplate?: template }) {
    const [initialForm,] = useState<Partial<newTemplate>>({
        name: "",
        categoryId: "",
        defaultCss: "",
        defaultData: undefined,
    })

    const [formObj, formObjSet] = useState<Partial<newTemplate> | template>(oldTemplate !== undefined ? deepClone(oldTemplate) : deepClone(initialForm))
    const [categories, categoriesSet] = useState<category[]>([])
    const [selectedCategory, selectedCategorySet] = useState<category | null>(null)
    const [seenCollection, seenCollectionSet] = useState<collection[]>([])

    //get categories
    useEffect(() => {
        handleGetCategories()

        if (oldTemplate !== undefined && oldTemplate.category !== undefined) {
            //assign category seen
            selectedCategorySet(oldTemplate.category)
        }
    }, [])

    type templateKeys = keyof Partial<newTemplate>

    type moreFormInfoType = {
        [key in templateKeys]: {
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
            placeHolder: "Enter template name",
        },
        "categoryId": {
            label: "category id",
            inputType: "input",
            placeHolder: "Enter template category",
        },
        "defaultCss": {
            label: "default css",
            inputType: "textarea",
            placeHolder: "Enter default css",
        },
        "defaultData": {
            label: "data",
            inputType: "textarea",
            placeHolder: "Enter default data",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in templateKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: Partial<newTemplate>, seenName: keyof Partial<newTemplate>, schema: typeof newTemplateSchema) {
        // @ts-expect-error types
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

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files === null || files.length < 1) return

        const newCollection: collection[] = []

        await Promise.all(
            new Array(files.length).fill("").map(async (each, eachIndex) => {
                const file = files[eachIndex];

                const fileContent = await file.text()

                newCollection[eachIndex] = { ...newCollection[eachIndex], content: fileContent, relativePath: `${file.webkitRelativePath}/${file.name}` }

                return fileContent
            })
        )

        seenCollectionSet(newCollection)
    };

    async function handleSubmit(wantsToSubmit = false) {
        if (!wantsToSubmit) return

        try {
            if (oldTemplate === undefined) {
                if (seenCollection.length === 0) throw new Error("upload some files")

                //new template
                const validatedTemplate = newTemplateSchema.parse(formObj)

                await addTemplate(validatedTemplate, seenCollection)

                formObjSet(deepClone(initialForm))

                selectedCategorySet(null)

                toast.success("new template submitted")

            } else {
                //edit template

                templatesSchema.parse(formObj)

                await updateTemplate(formObj, seenCollection)

                toast.success("updated template!")
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    };

    async function handleDelete() {
        try {
            if (oldTemplate === undefined) return

            toast.success("deleting...")

            //delete any tables with relations to the template
            templatesSchema.shape.id.parse(oldTemplate.id)

            //remove template
            await deleteTemplate(oldTemplate.id)

            //delete the website template dir
            await deleteDirectory(path.join(websiteTemplatesDir, oldTemplate.id))

            //delete from global templates file
            await removeEntryFromGlobalTemplatesFile(oldTemplate.id)

            toast.success("deleted template")
        } catch (error) {
            consoleAndToastError(error)
        }
    }

    const handleGetCategories = async () => {
        categoriesSet(await getAllCategories())
    }

    return (
        <main className={styles.main}>
            <section>
                <h1>{oldTemplate ? "Edit template" : "Upload a template"}</h1>

                {oldTemplate && (
                    <>
                        <ConfirmationBox text='delete template' confirmationText='are you sure you want to delete this template?' successMessage='template deleted!'
                            runAction={handleDelete}
                        />
                    </>
                )}
            </section>

            <section>
                <ul style={{ display: "flex", gap: "var(--spacingS)" }}>
                    {categories.map(eachCategory => {
                        return (
                            <button key={eachCategory.name} className='button1' style={{ backgroundColor: eachCategory.name === selectedCategory?.name ? "var(--color1)" : "" }}
                                onClick={() => {
                                    selectedCategorySet(eachCategory)

                                    //update form with selection
                                    formObjSet(prevFormObj => {
                                        const newFormObj = { ...prevFormObj }
                                        newFormObj.categoryId = eachCategory.name
                                        return newFormObj
                                    })
                                }}
                            >{eachCategory.name}</button>
                        )
                    })}
                </ul>

                <button className='button2' style={{ justifySelf: "flex-start" }}
                    onClick={handleGetCategories}
                >refresh</button>
            </section>

            <section>
                <h3>Upload template folder</h3>

                <input type='file' multiple={true}
                    onChange={handleFileChange}
                />

                <h3>Upload data</h3>

                <textarea rows={5} value={formObj.defaultData !== undefined ? JSON.stringify(formObj.defaultData, null, 2) : ""} style={{ whiteSpace: "pre" }}
                    onChange={(e) => {
                        const input = e.target.value;
                        formObjSet((prevFormObj) => {
                            const newFormObj = { ...prevFormObj };

                            try {
                                // Use eval to parse the input
                                const parsedObj = eval(`(${input})`); // Wrap in parentheses to treat it as an expression

                                //validate
                                const validatedCompData = templateDataSchema.parse(parsedObj);

                                newFormObj.defaultData = validatedCompData;

                            } catch (error) {
                                consoleAndToastError(error)
                                return prevFormObj;
                            }

                            return newFormObj;
                        });
                    }}
                />

            </section>

            <form action={() => { }} className={styles.form}>
                {Object.entries(formObj).map(eachEntry => {
                    const eachKey = eachEntry[0] as templateKeys
                    if (eachKey === "defaultData" || eachKey === "categoryId") return null

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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newTemplateSchema) }}
                                    errors={formErrors[eachKey]}
                                />
                            ) : moreFormInfo[eachKey].inputType === "textarea" ? (
                                <TextArea
                                    name={eachKey}
                                    value={`${formObj[eachKey]}`}
                                    label={moreFormInfo[eachKey].label}
                                    placeHolder={moreFormInfo[eachKey].placeHolder}
                                    onChange={(e) => {
                                        formObjSet(prevFormObj => {
                                            const newFormObj = { ...prevFormObj }

                                            newFormObj[eachKey] = (e as React.ChangeEvent<HTMLTextAreaElement>).target.value

                                            return newFormObj
                                        })
                                    }}
                                    onBlur={() => { checkIfValid(formObj, eachKey, newTemplateSchema) }}
                                    errors={formErrors[eachKey]}
                                />
                            ) : null}
                        </React.Fragment>
                    )
                })}

                <button className='button1' style={{ justifySelf: "center" }}
                    onClick={() => { handleSubmit(true) }}
                >Submit</button>
            </form>
        </main>
    )
}
