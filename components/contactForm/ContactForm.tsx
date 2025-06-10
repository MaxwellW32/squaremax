"use client"
import React, { useState, useEffect } from 'react'
import styles from "./styles.module.css"
import { toast } from 'react-hot-toast'
import { sendNodeEmail } from '@/serverFunctions/handleNodeEmails'
import { userForm, userFormSchema } from '@/types'
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/saveToStorage'
import TextInput from '../textInput/TextInput'
import TextArea from '../textArea/TextArea'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast'

export default function ContactForm() {

    const initialForm: userForm = {
        name: "",
        email: "",
        company: "",
        message: "",
    }
    const [formObj, formObjSet] = useState<userForm>({ ...initialForm })

    type userFormKey = keyof userForm

    // type moreFormInfo = Partial<{
    //     [key in userFormKey]: {
    //         label?: string,
    //         placeHolder?: string,
    //         type?: "input" | "textArea",
    //         required?: boolean
    //     }
    // }>

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in userFormKey]: string
    }>>({})

    const [checkedForSave, checkedForSaveSet] = useState(false)

    //read save from storage
    useEffect(() => {
        checkedForSaveSet(true)

        const seenContactForm: userForm | null = retreiveFromLocalStorage("contact")
        if (seenContactForm === null) return

        formObjSet({ ...seenContactForm })
    }, [])

    //save form to storage
    useEffect(() => {
        if (!checkedForSave) return

        saveToLocalStorage("contact", formObj)

    }, [checkedForSave, formObj])


    function checkIfValid(seenFormObj: userForm, seenName: keyof userForm, schema: typeof userFormSchema) {
        // @ts-expect-error type
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

    const handleSubmit = async () => {
        try {
            if (!userFormSchema.safeParse(formObj).success) return toast.error("Form not valid")

            toast.success("Sending!")

            await sendNodeEmail({
                sendTo: "info@squaremaxtech.com",
                replyTo: formObj.email,
                subject: `Customer Contact from ${formObj.name}`,
                text: `
name: ${formObj.name}
company: ${formObj.company}

message: 
${formObj.message}
`
            })

            toast.success("Sent!")

            formObjSet({ ...initialForm })

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    return (
        <form action={() => { }} className={styles.formDiv} style={{ display: "grid", alignContent: "flex-start" }}>
            <div style={{ textAlign: "center", display: "grid", gap: "var(--spacingR)", marginBottom: "2rem" }}>
                <h1>Request Free Consultation</h1>

                <p>Get in touch and discover how we can help. We will be in touch with you as soon as possible.</p>
            </div>

            <div className={styles.formColCont} style={{ display: "grid", gap: "var(--spacingR)" }}>
                <TextInput
                    name={"name"}
                    value={formObj.name}
                    placeHolder='Your Name'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formObjSet(prevObj => {
                            prevObj.name = e.target.value

                            return { ...prevObj }
                        })
                    }}
                    onBlur={() => {
                        checkIfValid(formObj, "name", userFormSchema)
                    }}
                    errors={formErrors["name"]}
                />

                <TextInput
                    name='email'
                    value={formObj.email}
                    placeHolder='Your Email'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formObjSet(prevObj => {
                            prevObj.email = e.target.value

                            return { ...prevObj }
                        })
                    }}
                    onBlur={() => {
                        checkIfValid(formObj, "email", userFormSchema)
                    }}
                    errors={formErrors["email"]}
                />

                <TextInput
                    name={"company"}
                    value={formObj.company ?? ""}
                    placeHolder={"Your Company Name"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formObjSet(prevObj => {
                            prevObj.company = e.target.value

                            return { ...prevObj }
                        })
                    }}
                    onBlur={() => { checkIfValid(formObj, "company", userFormSchema) }}
                    errors={formErrors["company"]}
                />

                <TextArea
                    name={`message`}
                    value={formObj.message}
                    label={"message"}
                    placeHolder={"Your Message"}
                    onChange={(e) => {
                        formObjSet(prevObj => {
                            prevObj.message = (e as React.ChangeEvent<HTMLTextAreaElement>).target.value

                            return { ...prevObj }
                        })
                    }}
                    onBlur={() => { checkIfValid(formObj, "message", userFormSchema) }}
                    errors={formErrors["message"]}
                />
            </div>

            <button className='button1' disabled={!userFormSchema.safeParse(formObj).success} type='submit' style={{ justifySelf: "flex-end", marginTop: '1rem' }}
                onClick={() => {
                    handleSubmit()
                }}
            >Send Message</button>
        </form>
    )
}
