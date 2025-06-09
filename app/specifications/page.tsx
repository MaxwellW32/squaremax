"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from "./page.module.css"
import { toast } from 'react-hot-toast'
import { sendNodeEmail } from '@/serverFunctions/handleNodeEmails'
import { clientSpecificationKeys, moreFormInfoType, pagesType, specificationsFormSchema, specificationsObjType } from '@/types'
import Image from 'next/image'
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/saveToStorage'
import TextInput from '@/components/textInput/TextInput'
import TextArea from '@/components/textArea/TextArea'
import { consoleAndToastError } from '@/useful/consoleErrorWithToast'

export default function Page() {
    const [initialSpecificationsObj,] = useState<specificationsObjType>({
        "aa": "",
        "ab": "",
        "ac": "",
        "ad": "",
        "ae": "",
        "af": "",
        "ag": "",
        "ah": "",
        "ai": "",
        "aj": "",
        "ak": "",
        "al": "",
        "am": "",
        "an": "",
        "ao": "",
        "ap": "",
        "aq": "",
        "ar": "",
        "as": "",
        "at": "",
        "au": ""
    })
    const [specificationsObj, specificationsObjSet] = useState<specificationsObjType>({ ...initialSpecificationsObj })

    const [moreFormInfo,] = useState<moreFormInfoType>({
        "aa": {
            label: "What is your business/organization's name?",
            placeHolder: "Enter your business or organization's name",
            required: true
        },
        "ab": {
            label: "Can you describe your business and the products or services you offer?",
            placeHolder: "Provide a brief description of your business and offerings (e.g., products, services)",
            inputType: "textarea",
            required: true
        },
        "ac": {
            label: "Who is your target audience?",
            placeHolder: "Describe your target audience (e.g., demographics, interests)",
            inputType: "textarea",
            required: true
        },
        "ad": {
            label: "What are your core goals for this website? (e.g., increase sales, raise awareness)",
            placeHolder: "List the main goals for your website (e.g., boost sales, engage visitors)",
            inputType: "textarea",
            required: true
        },
        "ae": {
            label: "What sets your business apart from competitors?",
            placeHolder: "Explain what makes your business unique",
            inputType: "textarea"
        },
        "af": {
            label: "Do you already have a website? If so, what do you like or dislike about it?",
            placeHolder: "Share your thoughts on your current website, if any (likes/dislikes)",
            inputType: "textarea"
        },
        "ag": {
            label: "What is the main action you want visitors to take on your site? (e.g., make a purchase, sign up, contact you)",
            placeHolder: "Specify the key actions you'd like visitors to take (e.g., buy, sign up)",
            inputType: "textarea",
            required: true
        },
        "ah": {
            label: "What features do you need? (e.g., e-commerce, booking system, blog, galleries, forms)",
            placeHolder: "List any features you'd like to include (e.g., online store, blog, forms)",
            inputType: "textarea",
            required: true
        },
        "ai": {
            label: "Do you need integration with third-party services or software (e.g., payment gateways, CRM)?",
            placeHolder: "Mention any third-party integrations required (e.g., payment systems)",
            inputType: "textarea"
        },
        "aj": {
            label: "Do you have branding guidelines (logo, colors, typography) to follow?",
            placeHolder: "Include any branding details (e.g., logo, colors, fonts)",
            inputType: "textarea",
            required: true
        },
        "ak": {
            label: "Are there websites you admire? What do you like about them?",
            placeHolder: "Feel free to provide links to websites you admire and explain why",
            inputType: "textarea"
        },
        "al": {
            label: "What look and feel are you aiming for? (e.g., professional, playful)",
            placeHolder: "Describe the style you're looking for (e.g., clean, modern, playful)",
            inputType: "textarea",
            required: true
        },
        "am": {
            label: "Do you need a mobile-first or responsive design?",
            placeHolder: "Indicate if you prefer a mobile-first or responsive layout",
            inputType: "textarea"
        },
        "an": {
            label: "Will you provide the content (text, images, videos) or need assistance?",
            placeHolder: "Let us know if you'll supply content or need help creating it",
            inputType: "textarea",
            required: true
        },
        "ao": {
            label: "How many pages will the site have?",
            placeHolder: "Estimate the number of pages (e.g., Home, About, Services)",
            inputType: "textarea"
        },
        "ap": {
            label: "Do you need any custom forms (e.g., contact form, surveys)?",
            placeHolder: "Specify any custom forms needed (e.g., contact, sign-up forms)",
            inputType: "textarea"
        },
        "aq": {
            label: "Will there be user accounts/logins?",
            placeHolder: "State if your website will include user account functionality",
            inputType: "textarea"
        },
        "ar": {
            label: "What is your ideal launch date for the website?",
            placeHolder: "Provide your preferred launch date (e.g., June 2024)",
            inputType: "textarea",
            required: true
        },
        "as": {
            label: "Are there any deadlines the website must meet?",
            placeHolder: "Mention any specific deadlines or timelines",
            inputType: "textarea"
        },
        "at": {
            label: "What is your budget range for this project?",
            placeHolder: "Please provide your budget range for this project",
            required: true
        },
        "au": {
            label: "What is your Email?",
            placeHolder: "Enter your preferred contact email",
            required: true
        }
    });

    const [formErrors, formErrorsSet] = useState<Partial<{
        [key in clientSpecificationKeys]: string
    }>>({})

    const [currentPageIndex, currentPageIndexSet] = useState(0)
    const [pages,] = useState<pagesType>({
        0: {
            questions: ["aa", "au"],
            hideQuestions: true
        },
        1: {
            title: "Business Overview",
            questions: ["ab", "ac", "ad", "ae"],
        },
        2: {
            title: "Project Scope & Goals",
            questions: ["af", "ag", "ah", "ai"],
        },
        3: {
            title: "Design Preferences",
            questions: ["aj", "ak", "al", "am"],
        },
        4: {
            title: "Content & Functionality",
            questions: ["an", "ao", "ap", "aq"],
        },
        5: {
            title: "Timeline & Budget",
            questions: ["ar", "as", "at"],
        }
    })

    const formContRef = useRef<HTMLDivElement | null>(null)
    const [checkedForSave, checkedForSaveSet] = useState(false)

    //read save from storage
    useEffect(() => {
        checkedForSaveSet(true)
        const seenSpecifications: specificationsObjType | null = retreiveFromLocalStorage("specifications")
        if (seenSpecifications === null) return

        specificationsObjSet({ ...seenSpecifications })
    }, [])

    //save form to storage
    useEffect(() => {
        if (!checkedForSave) return

        saveToLocalStorage("specifications", specificationsObj)

    }, [checkedForSave, specificationsObj])

    function checkIfValid(seenFormObj: specificationsObjType, seenName: keyof specificationsObjType, schema: typeof specificationsFormSchema) {
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

    function returnInput(id: clientSpecificationKeys) {
        //inputs
        if (moreFormInfo[id].inputType === undefined || moreFormInfo[id].inputType === "input") {
            return (
                <TextInput
                    name={id}
                    value={`${specificationsObj[id]}`}
                    type={moreFormInfo[id].type}
                    label={moreFormInfo[id].label}
                    placeHolder={moreFormInfo[id].placeHolder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        specificationsObjSet(prevSpecifications => {
                            const newSpecifications = { ...prevSpecifications }
                            if (moreFormInfo[id].type === undefined || moreFormInfo[id].type === "text") {
                                newSpecifications[id] = e.target.value

                            } else if (moreFormInfo[id].type === "number") {
                                const parsedNum = parseFloat(e.target.value)

                                //@ts-expect-error type
                                newSpecifications[id] = isNaN(parsedNum) ? 0 : parsedNum
                            }

                            return newSpecifications
                        })
                    }}
                    onBlur={() => { checkIfValid(specificationsObj, id, specificationsFormSchema) }}
                    errors={formErrors[id]}
                />
            )
        } else if (moreFormInfo[id].inputType === "textarea") {
            return (
                <TextArea
                    name={id}
                    value={`${specificationsObj[id]}`}
                    label={moreFormInfo[id].label}
                    placeHolder={moreFormInfo[id].placeHolder}
                    onChange={(e) => {
                        specificationsObjSet(prevSpecifications => {
                            const newSpecifications = { ...prevSpecifications }
                            const seenStr = (e as React.ChangeEvent<HTMLTextAreaElement>).target.value

                            if (moreFormInfo[id].type === undefined || moreFormInfo[id].type === "text") {
                                newSpecifications[id] = seenStr

                            } else if (moreFormInfo[id].type === "number") {
                                const parsedNum = parseFloat(seenStr)

                                //@ts-expect-error type
                                newSpecifications[id] = isNaN(parsedNum) ? 0 : parsedNum
                            }

                            return newSpecifications
                        })
                    }}
                    onBlur={() => { checkIfValid(specificationsObj, id, specificationsFormSchema) }}
                    errors={formErrors[id]}
                />
            )
        }
    }

    async function handleSubmit(readyToSubmit?: boolean) {
        if (readyToSubmit === undefined || readyToSubmit === false) return

        try {
            if (!specificationsFormSchema.safeParse(specificationsObj).success) return toast.error("Form not valid")

            await sendNodeEmail({
                sendTo: "squaremaxtech@gmail.com",
                replyTo: specificationsObj["au"],
                subject: `Customer Specifications for ${specificationsObj["aa"]}`,
                text: (`
${Object.entries(pages).map(([, value]) => {

                    return (`
${value.title !== undefined ? value.title : ""}\n

${value.questions.map(eachQuestionId => {
                        return (`
${moreFormInfo[eachQuestionId].label}
${specificationsObj[eachQuestionId]}
        `)
                    }).join("\n\n\n")}
    `)
                }).join("\n")}
`)
            })

            toast.success("Sent!")
            specificationsObjSet({ ...initialSpecificationsObj })

        } catch (error) {
            consoleAndToastError(error)
        }
    }

    function filterQuestions(questions: clientSpecificationKeys[]) {
        const requiredQuestions: clientSpecificationKeys[] = []
        const optionalQuestions: clientSpecificationKeys[] = []

        questions.filter(eachId => {
            if (moreFormInfo[eachId].required) {
                requiredQuestions.push(eachId)
            } else {
                optionalQuestions.push(eachId)
            }
        })

        return (
            <>
                {/* required inputs */}
                {requiredQuestions.length > 0 && (
                    <div className={`${styles.formPage} ${styles.requiredInputsCont}`}>
                        {requiredQuestions.map((eachId, eachIdIndex) => {
                            return (
                                <React.Fragment key={eachIdIndex}>{returnInput(eachId)}</React.Fragment>
                            )
                        })}
                    </div>
                )}

                {/* optional inputs */}
                {optionalQuestions.map((eachId, eachIdIndex) => {
                    return (
                        <React.Fragment key={eachIdIndex}>{returnInput(eachId)}</React.Fragment>
                    )
                })}
            </>
        )
    }

    function scrollToForm() {
        if (formContRef.current === null) return

        const offset = formContRef.current.offsetTop
        window.scrollTo({ top: offset })
    }

    return (
        <main className={styles.main}>
            <div ref={formContRef} className={styles.formCont}>
                {/* form navigation buttons */}
                <div className='noScrollBar' style={{ display: "flex", overflowX: "auto", gap: "var(--spacingR)" }}>
                    {Object.entries(pages).map(([key,], pageButtonIndex) => {
                        return (
                            <button key={key} className={styles.formPageButton} style={{ backgroundColor: "", color: pageButtonIndex === currentPageIndex ? "#fff" : "#aaa", width: "8rem", paddingBlock: ".5rem", flexShrink: 0 }}
                                onClick={() => {
                                    currentPageIndexSet(pageButtonIndex)
                                }}
                            >{pageButtonIndex === 0 ? (
                                <span style={{ rotate: "90deg" }} className="material-symbols-outlined">
                                    drag_indicator
                                </span>
                            ) : (
                                <div style={{ position: "relative" }}>
                                    <div style={{ width: ".5rem", height: ".5rem", backgroundColor: "var(--color1)", borderRadius: "50%", display: pageButtonIndex !== currentPageIndex ? "none" : "", position: "absolute", top: "50%", left: "50%", translate: "-300% -50%" }}></div>

                                    {pageButtonIndex}
                                </div>
                            )}</button>
                        )
                    })}
                </div>

                <form className={styles.form} action={() => { handleSubmit() }}>
                    {Object.entries(pages).map(([key, value], eachPageIndex) => {

                        return (
                            <div key={key} className={styles.formPage} style={{ display: eachPageIndex !== currentPageIndex ? "none" : "" }}>
                                {value.title !== undefined && (
                                    <h2>{value.title}</h2>
                                )}

                                {key === "0" && (
                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "var(--spacingR)" }}>
                                        <div style={{ flex: "1 1 400px", position: "relative", height: "300px" }}>
                                            <Image alt='formArtDesign' src={"/cyberLady.png"} fill={true} style={{ objectFit: "cover" }} sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' />
                                        </div>

                                        <div style={{ flex: "1 1 400px", display: "grid", gap: "var(--spacingR)" }}>
                                            <div style={{ textAlign: "center" }}>
                                                <h2>Customize Your Website</h2>
                                                <p style={{ color: "", fontSize: "var(--fontSizeS)" }}>Required Inputs are outlined by a golden line</p>
                                            </div>

                                            {filterQuestions(value.questions)}

                                            <button style={{ justifySelf: "center" }} className='button2'
                                                onClick={() => {
                                                    scrollToForm()

                                                    currentPageIndexSet(prev => prev + 1)
                                                }}
                                            >Get Started</button>
                                        </div>
                                    </div>
                                )}

                                {value.hideQuestions !== true && filterQuestions(value.questions)}
                            </div>
                        )
                    })}

                    {/* submit button */}
                    {currentPageIndex !== 0 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: ".5rem" }}>
                            <button className='button2'
                                onClick={() => {
                                    scrollToForm()

                                    currentPageIndexSet(prev => {
                                        let newIndex = prev - 1

                                        if (newIndex < 0) {
                                            newIndex = Object.entries(pages).length - 1
                                        }

                                        return newIndex
                                    })
                                }}
                            >prev</button>

                            <button className='button1' disabled={!specificationsFormSchema.safeParse(specificationsObj).success} style={{ justifySelf: "center", paddingInline: "4rem" }}
                                onClick={() => {
                                    handleSubmit(true)
                                }}
                            >Submit</button>

                            <button className='button2'
                                onClick={() => {
                                    scrollToForm()

                                    currentPageIndexSet(prev => {
                                        let newIndex = prev + 1

                                        if (newIndex > Object.entries(pages).length - 1) {
                                            newIndex = 0
                                        }

                                        return newIndex
                                    })
                                }}
                            >next</button>
                        </div>
                    )}
                </form>
            </div>
        </main>
    )
}
