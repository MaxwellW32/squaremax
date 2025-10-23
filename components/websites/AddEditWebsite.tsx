"use client"
import React, { useEffect, useState } from 'react'
import styles from "./style.module.css"
import { deepClone, makeValidVariableName } from '@/utility/utility'
import toast from 'react-hot-toast'
import { newWebsiteSchema, websiteSchema, websiteType } from '@/types'
import { addWebsite, updateWebsite } from '@/serverFunctions/handleWebsites'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast'
import UseFormErrors from '../useFormErrors/UseFormErrors'
import TextInput from '../inputs/textInput/TextInput'
import { initialNewWebsiteObj } from '@/lib/initialFormData'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AddEditWebsite({ sentWebsite, submissionAction }: { sentWebsite?: websiteType, submissionAction?: () => void }) {
    const { data: session } = useSession()
    const router = useRouter()

    const [formObj, formObjSet] = useState<Partial<websiteType>>(deepClone(sentWebsite === undefined ? initialNewWebsiteObj : websiteSchema.partial().parse(sentWebsite)))

    const { formErrors, checkIfValid } = UseFormErrors<websiteType>({ schema: websiteSchema.partial() })

    //handle changes from above
    useEffect(() => {
        if (sentWebsite === undefined) return

        formObjSet(deepClone(websiteSchema.partial().parse(sentWebsite)))

    }, [sentWebsite])

    async function handleSubmit() {
        try {
            if (session === null) return

            toast.success("submittting")

            //new website
            if (sentWebsite === undefined) {
                //assign user id
                formObj.userId = session.user.id

                const validatedNewWebsite = newWebsiteSchema.parse(formObj)

                //send up to server
                const addedWebsite = await addWebsite(validatedNewWebsite)

                toast.success("created website")

                setTimeout(() => {
                    router.push(`/websites/edit/${addedWebsite.id}`)
                }, 2000);

                //reset
                formObjSet(deepClone(initialNewWebsiteObj))

            } else {
                //validate
                const validatedWebsite = websiteSchema.partial().parse(formObj)

                //update
                const updatedWebsite = await updateWebsite(sentWebsite.id, validatedWebsite)

                toast.success("website updated")

                //set to updated
                formObjSet(updatedWebsite)
            }

            if (submissionAction !== undefined) {
                submissionAction()
            }

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <form className={styles.form} action={() => { }}>
            {formObj.id !== undefined && (
                <>
                    <TextInput
                        name={"id"}
                        value={`${formObj.id}`}
                        type={"text"}
                        label={"website id"}
                        placeHolder={"enter website id"}
                        onChange={(e) => {
                            formObjSet(prevFormObj => {
                                const newFormObj = { ...prevFormObj }
                                if (newFormObj.id === undefined) return prevFormObj

                                newFormObj.id = e.target.value

                                return newFormObj
                            })
                        }}
                        onBlur={() => { checkIfValid(formObj, "id") }}
                        errors={formErrors["id"]}
                    />
                </>
            )}

            {formObj.name !== undefined && (
                <>
                    <TextInput
                        name={"name"}
                        value={formObj.name ?? ""}
                        type={"text"}
                        label={"name"}
                        placeHolder={"enter full name"}
                        onChange={(e) => {
                            formObjSet(prevFormObj => {
                                const newFormObj = { ...prevFormObj }
                                if (newFormObj.name === undefined) return prevFormObj

                                newFormObj.name = e.target.value

                                return newFormObj
                            })
                        }}
                        onBlur={() => { checkIfValid(formObj, "name") }}
                        errors={formErrors["name"]}
                    />
                </>
            )}

            {formObj.fonts !== undefined && (
                <>
                    <label>Fonts</label>

                    {formErrors["fonts"] !== undefined && (
                        <p>{formErrors["fonts"]}</p>
                    )}

                    <div className={`${styles.fontsCont} snap`}>
                        {formObj.fonts.map((eachFont, eachFontIndex) => {
                            return (
                                <div className={styles.fontCont} key={eachFontIndex} >
                                    <button className='button2'
                                        onClick={() => {
                                            formObjSet(prevFormObj => {
                                                const newFormObj = { ...prevFormObj }
                                                if (newFormObj.fonts === undefined) return prevFormObj

                                                newFormObj.fonts = newFormObj.fonts.filter((ef, efIndex) => {
                                                    return efIndex !== eachFontIndex
                                                })

                                                return newFormObj
                                            })
                                        }}
                                    >delete</button>

                                    <TextInput
                                        name={"fontImportName"}
                                        value={eachFont.importName}
                                        type={"text"}
                                        label={"Website font name"}
                                        placeHolder={"Enter website font - case sensitive"}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            formObjSet(prevFormObj => {
                                                const newFormObj = { ...prevFormObj }
                                                if (newFormObj.fonts === undefined) return prevFormObj

                                                newFormObj.fonts[eachFontIndex].importName = e.target.value
                                                return newFormObj
                                            })
                                        }}
                                        onBlur={() => { checkIfValid(formObj, "fonts") }}
                                    />

                                    {formObj.fonts !== undefined && formObj.fonts[eachFontIndex].importName !== "" && (
                                        <p>css: var(--font-{makeValidVariableName(eachFont.importName)})</p>
                                    )}

                                    <TextInput
                                        name={"fontSubset"}
                                        value={eachFont.subsets.join(",")}
                                        type={"text"}
                                        label={"Website font subset"}
                                        placeHolder={"enter font subsets - e.g latin"}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            formObjSet(prevFormObj => {
                                                const newFormObj = { ...prevFormObj }
                                                if (newFormObj.fonts === undefined) return prevFormObj

                                                newFormObj.fonts[eachFontIndex].subsets = e.target.value.split(",")
                                                return newFormObj
                                            })

                                        }}
                                        onBlur={() => { checkIfValid(formObj, "fonts") }}
                                    />

                                    <TextInput
                                        name={"fontWeight"}
                                        value={eachFont.weights !== null ? eachFont.weights.join(",") : ""}
                                        type={"text"}
                                        label={"enter font weight"}
                                        placeHolder={"blank for variable fonts or 300,400...etc"}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            formObjSet(prevFormObj => {
                                                const newFormObj = { ...prevFormObj }
                                                if (newFormObj.fonts === undefined) return prevFormObj

                                                newFormObj.fonts[eachFontIndex].weights = e.target.value.split(",")

                                                if (e.target.value === "") {
                                                    newFormObj.fonts[eachFontIndex].weights = null
                                                }
                                                return newFormObj
                                            })
                                        }}
                                        onBlur={() => { checkIfValid(formObj, "fonts") }}
                                    />
                                </div>
                            )
                        })}

                        <button className='button1' style={{ alignSelf: "center" }}
                            onClick={() => {
                                formObjSet(prevFormObj => {
                                    const newFormObj = { ...prevFormObj }
                                    if (newFormObj.fonts === undefined) return prevFormObj

                                    newFormObj.fonts = [...newFormObj.fonts, {
                                        importName: "",
                                        subsets: [],
                                        weights: null
                                    }]
                                    return newFormObj
                                })
                            }}
                        >add</button>
                    </div>
                </>
            )}

            <button className='button1' style={{ justifySelf: "center" }}
                onClick={handleSubmit}
            >{sentWebsite !== undefined ? "update" : "submit"}</button>
        </form>
    )
}