"use client"
import React, { useEffect, useMemo, useState } from 'react'
import path from "path"
import styles from "./addUserComponent.module.css"
import { toast } from 'react-hot-toast'
import ShowMore from '@/components/showMore/ShowMore';
import { category, collection, component, componentSchema, newComponent, newComponentSchema } from '@/types'
import { deepClone } from '@/utility/utility'
import { getAllCategories } from '@/serverFunctions/handleCategories'
import { addComponent, updateComponent } from '@/serverFunctions/handleComponents'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import { getPageComponentsFromComponentId, removePageComponentsFromComponent } from '@/serverFunctions/handlePagesToComponents'
import { deleteDirectory } from '@/serverFunctions/handleServerFiles'
import { userWebsiteComponentsDir } from '@/lib/userWebsiteComponents'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'

export default function AddEditWebsiteComponent({ oldWebsiteComponent }: { oldWebsiteComponent?: component }) {

    const [initialForm,] = useState<Partial<newComponent>>({
        name: "",
        categoryId: "",
        defaultCss: "",
        defaultData: undefined,
    })

    const [formObj, formObjSet] = useState<Partial<newComponent> | component>(oldWebsiteComponent !== undefined ? deepClone(oldWebsiteComponent) : deepClone(initialForm))
    const [userWantsToDelete, userWantsToDeleteSet] = useState(false)
    const [categories, categoriesSet] = useState<category[]>([])
    const [selectedCategory, selectedCategorySet] = useState<category | null>(null)
    const [seenCollection, seenCollectionSet] = useState<collection[]>([])

    //get categories
    useEffect(() => {
        handleGetCategories()
    }, [])


    type componentKeys = keyof Partial<newComponent>

    type moreFormInfoType = {
        [key in componentKeys]: {
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
        "categoryId": {
            label: "name",
            inputType: "input",
            placeHolder: "Enter component category",
        },
        "defaultCss": {
            label: "name",
            inputType: "textarea",
            placeHolder: "Enter default css",
        },
        "defaultData": {
            label: "name",
            inputType: "textarea",
            placeHolder: "Enter default data",
        },
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in componentKeys]: string
    }>>({})

    function checkIfValid(seenFormObj: Partial<newComponent>, seenName: keyof Partial<newComponent>, schema: typeof newComponentSchema) {
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

        console.log(`$files`, files);

        const newCollection: collection[] = []

        await Promise.all(
            new Array(files.length).fill("").map(async (each, eachIndex) => {
                const file = files[eachIndex];

                const fileContent = await file.text()

                newCollection[eachIndex] = { ...newCollection[eachIndex], content: fileContent, relativePath: file.webkitRelativePath }

                return fileContent
            })
        )

        seenCollectionSet(newCollection)
    };

    async function handleSubmit(wantsToSubmit = false) {
        if (!wantsToSubmit) return

        try {
            if (oldWebsiteComponent === undefined) {
                if (seenCollection.length === 0) throw new Error("upload some files")

                //new component
                const validatedComponent = newComponentSchema.parse(formObj)

                await addComponent(validatedComponent, seenCollection)

                formObjSet(deepClone(initialForm))

                toast.success("new component submitted")

            } else {
                //edit component

                componentSchema.parse(formObj)

                await updateComponent(formObj, seenCollection)

                toast.success("updated component!")
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    };

    async function handleDelete() {
        try {
            toast.success("deleting...")

            //delete any tables with relations to the component
            const validatedFullComponent = componentSchema.parse(formObj)

            const linkedPagesToComponents = await getPageComponentsFromComponentId(validatedFullComponent.id)

            await removePageComponentsFromComponent(linkedPagesToComponents, validatedFullComponent.id)

            //delete the website component dir
            await deleteDirectory(path.join(userWebsiteComponentsDir, validatedFullComponent.id))

            toast.success("deleted component")

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    const handleGetCategories = async () => {
        categoriesSet(await getAllCategories())
    }

    return (
        <main style={{ display: "grid" }}>
            <section>
                <h1>{oldWebsiteComponent ? "Edit component" : "Upload a component"}</h1>

                {oldWebsiteComponent && (
                    <>
                        {!userWantsToDelete ? (
                            <button className='smallButton' onClick={() => {
                                userWantsToDeleteSet(true)
                            }}>Delete Component</button>
                        ) : (
                            <div>
                                <p>Confirm Deletion</p>

                                <div style={{ display: "flex", alignItems: 'center', gap: ".5rem", marginTop: ".5rem" }}>
                                    <button className='mainButton' style={{ backgroundColor: "var(--color5)" }} onClick={() => (userWantsToDeleteSet(false))}>CANCEL</button>
                                    <button className='smallButton' onClick={handleDelete}>CONFIRM</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            <section>
                <ul>
                    {categories.map(eachCategory => {
                        return (
                            <li key={eachCategory.name} className='tag' style={{ backgroundColor: selectedCategory !== null && eachCategory.name === selectedCategory.name ? "rgb(var(--color1))" : "" }}
                                onClick={() => {
                                    selectedCategorySet(eachCategory)

                                    //update form with selection
                                    formObjSet(prevFormObj => {
                                        const newFormObj = { ...prevFormObj }
                                        newFormObj.categoryId = eachCategory.name
                                        return newFormObj
                                    })
                                }}
                            >{eachCategory.name}</li>
                        )
                    })}
                </ul>

                <button
                    onClick={handleGetCategories}
                >refresh</button>
            </section>

            <form action={() => { }} className={styles.form}>
                {Object.entries(formObj).map(eachEntry => {
                    const eachKey = eachEntry[0] as componentKeys
                    if (eachKey === "defaultData" || eachKey === "categoryId") return null

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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newComponentSchema) }}
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
                                    onBlur={() => { checkIfValid(formObj, eachKey, newComponentSchema) }}
                                    errors={formErrors[eachKey]}
                                />
                            ) : null}
                        </React.Fragment>
                    )
                })}

                <button className='mainButton' style={{ justifySelf: "center" }}
                    onClick={() => { handleSubmit(true) }}
                >Submit</button>
            </form>

            <section>
                <h3>Upload component folder</h3>

                <input type='file' accept=''
                    onChange={handleFileChange}
                />
            </section>
        </main>
    )
}
