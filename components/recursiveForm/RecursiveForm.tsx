"use client"
import { recursiveFormArrayStarterItems, recursiveFormMoreInfo, recursiveFormMoreFormInfoElementType } from '@/types'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'

//fix the add function
//better labels
//placeholder when array blank

export default function RecursiveForm({ seenForm, seenMoreFormInfo, seenArrayStarterItems, seenSchema, updater }: { seenForm: { [key: string]: unknown }, seenMoreFormInfo: recursiveFormMoreInfo, seenArrayStarterItems: recursiveFormArrayStarterItems, seenSchema: z.Schema, updater: (newObject: unknown) => void }) {
    const [form, formSet] = useState<{ [key: string]: unknown }>(seenForm)
    const [formErrors, formErrorsSet] = useState<{ [key: string]: string }>({})
    const changeFromAbove = useRef(false)

    //update form if parent changes
    useEffect(() => {
        changeFromAbove.current = true
        formSet(seenForm)

    }, [seenForm])

    //send changes in form upwards
    useEffect(() => {
        //dont send changes if this component changed the form
        if (changeFromAbove.current) {
            changeFromAbove.current = false
            return
        }

        //reset
        formErrorsSet({})

        const seenSchemaResults = seenSchema.safeParse(form)

        if (seenSchemaResults.success) {
            updater(seenSchemaResults.data)

        } else if (seenSchemaResults.error !== undefined) {
            formErrorsSet(prevFormErrors => {
                const newFormErrors = { ...prevFormErrors }

                seenSchemaResults.error.errors.forEach(eachError => {
                    const errorKey = eachError.path.join('/')
                    newFormErrors[errorKey] = eachError.message
                })

                return newFormErrors
            })
        }

    }, [form])

    return (
        <RenderForm seenForm={form} seenFormSet={formSet} seenMoreFormInfo={seenMoreFormInfo} seenArrayStarterItems={seenArrayStarterItems} sentKeys={""} seenFormErrors={formErrors} />
    )
}

function RenderForm({ seenForm, seenFormSet, seenMoreFormInfo, seenArrayStarterItems, sentKeys, parentIsArray, seenFormErrors, ...elProps }: { seenForm: {}, seenFormSet: React.Dispatch<React.SetStateAction<{ [key: string]: unknown; }>>, seenMoreFormInfo: recursiveFormMoreInfo, seenArrayStarterItems: recursiveFormArrayStarterItems, sentKeys: string, parentIsArray?: boolean, seenFormErrors: { [key: string]: string } } & React.HTMLAttributes<HTMLDivElement>) {

    return (
        <div {...elProps} style={{ display: "grid", ...(parentIsArray ? { gap: "1rem", gridAutoColumns: "90%", gridAutoFlow: "column" } : { alignContent: "flex-start" }), overflow: "auto", ...elProps?.style }} className={`${parentIsArray ? "snap" : ""} ${elProps?.className ?? ""}`}>
            {Object.entries(seenForm).map(eachEntry => {
                const eachKey = eachEntry[0]
                const eachValue = eachEntry[1]
                const seenKeys = sentKeys === "" ? eachKey : `${sentKeys}/${eachKey}`
                const seenKeysForFormInfo = seenKeys.replace(/\d+/g, '0')

                const arrayRemoveButton = (
                    <button className='mainButton' style={{ alignSelf: "flex-start" }}
                        onClick={() => {
                            seenFormSet(prevForm => {
                                const newForm = { ...prevForm }
                                const keyArray = seenKeys.split('/')

                                console.log(`$keyArray`, keyArray);

                                let tempForm = newForm
                                const indexToDelete = parseInt(keyArray[keyArray.length - 1])

                                for (let i = 0; i < keyArray.length; i++) {
                                    const subKey = keyArray[i]

                                    if (i === keyArray.length - 2) {
                                        // @ts-ignore type
                                        tempForm[subKey] = tempForm[subKey].filter((each, eachIndex) => eachIndex !== indexToDelete)

                                    } else {
                                        // @ts-ignore type
                                        tempForm = tempForm[subKey]
                                    }
                                }

                                return newForm
                            })
                        }}
                    >remove</button>
                )

                if (typeof eachValue === 'object' && eachValue !== null) {
                    const isArray = Array.isArray(eachValue)
                    return (
                        <div key={eachKey} style={{ display: "grid", alignContent: "flex-start", }}>
                            <label>{eachKey}</label>

                            {eachValue instanceof Date && (
                                <>
                                    <input type="date" value={eachValue.toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            seenFormSet(prevForm => {
                                                const newForm = { ...prevForm }
                                                const keyArray = seenKeys.split('/')

                                                let tempForm = newForm

                                                for (let i = 0; i < keyArray.length; i++) {
                                                    const subKey = keyArray[i]

                                                    if (i === keyArray.length - 1) {
                                                        tempForm[subKey] = new Date(e.target.value)
                                                        console.log(`$keyArray`, keyArray);

                                                    } else {
                                                        // @ts-ignore type
                                                        tempForm = tempForm[subKey]
                                                    }
                                                }

                                                return newForm
                                            })
                                        }}
                                    />
                                </>
                            )}

                            {parentIsArray && (
                                arrayRemoveButton
                            )}

                            {isArray && (
                                <>
                                    <button className='mainButton' style={{ alignSelf: "flex-start" }}
                                        onClick={() => {
                                            if (seenArrayStarterItems[seenKeysForFormInfo] === undefined) {
                                                toast.error('Array starter for this item not found')
                                                return
                                            }

                                            seenFormSet(prevForm => {
                                                const newForm = { ...prevForm }
                                                const keyArray = seenKeys.split('/')

                                                let tempForm = newForm

                                                for (let i = 0; i < keyArray.length; i++) {
                                                    const subKey = keyArray[i]

                                                    if (i === keyArray.length - 1) {
                                                        // @ts-ignore type
                                                        tempForm[subKey] = [...tempForm[subKey], seenArrayStarterItems[seenKeysForFormInfo]]
                                                    } else {
                                                        // @ts-ignore type
                                                        tempForm = tempForm[subKey]
                                                    }
                                                }

                                                return newForm
                                            })
                                        }}
                                    >add</button>
                                </>
                            )}

                            <RenderForm seenForm={eachValue} seenFormSet={seenFormSet} seenMoreFormInfo={seenMoreFormInfo} seenArrayStarterItems={seenArrayStarterItems} sentKeys={seenKeys} style={{ marginLeft: "1rem" }} parentIsArray={isArray ? true : undefined} seenFormErrors={seenFormErrors} />
                        </div>
                    )

                } else {
                    //replace camelcase key names with spaces and capitalize first letter
                    const niceKeyName = eachKey.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); })
                    let label = niceKeyName
                    let placeHolder = `please enter a value for ${eachKey}`
                    let element: recursiveFormMoreFormInfoElementType = { type: 'input' }

                    if (seenMoreFormInfo[seenKeysForFormInfo] !== undefined) {
                        if (seenMoreFormInfo[seenKeysForFormInfo].label !== undefined) {
                            label = seenMoreFormInfo[seenKeysForFormInfo].label
                        }
                        if (seenMoreFormInfo[seenKeysForFormInfo].placeholder !== undefined) {
                            placeHolder = seenMoreFormInfo[seenKeysForFormInfo].placeholder
                        }
                        if (seenMoreFormInfo[seenKeysForFormInfo].element !== undefined) {
                            element = seenMoreFormInfo[seenKeysForFormInfo].element
                        }
                    }

                    return (
                        <div key={seenKeys} style={{ display: "grid", alignContent: "flex-start", gap: "1rem", width: "100%" }}>
                            {parentIsArray && arrayRemoveButton}

                            <label htmlFor={seenKeys}>{label}</label>

                            {(typeof eachValue === 'string' || typeof eachValue === 'number') && (
                                <>
                                    {element.type === "input" && (
                                        <>
                                            <input id={seenKeys} type={element.isNumeric ? "number" : "text"} value={eachValue} placeholder={placeHolder}
                                                onChange={(e) => {
                                                    seenFormSet(prevForm => {
                                                        const newForm = { ...prevForm }
                                                        const keyArray = seenKeys.split('/')

                                                        let tempForm = newForm

                                                        for (let i = 0; i < keyArray.length; i++) {
                                                            const subKey = keyArray[i]

                                                            if (i === keyArray.length - 1) {
                                                                let inputVal: string | number = e.target.value

                                                                if (element.isNumeric) {
                                                                    inputVal = parseInt(e.target.value)

                                                                    if (element.isFloat !== undefined) {
                                                                        inputVal = parseFloat(e.target.value)
                                                                    }

                                                                    if (isNaN(inputVal)) {
                                                                        inputVal = 0
                                                                    }
                                                                }

                                                                tempForm[subKey] = inputVal

                                                            } else {
                                                                // @ts-ignore type
                                                                tempForm = tempForm[subKey]
                                                            }
                                                        }

                                                        return newForm
                                                    })
                                                }}
                                            />
                                        </>
                                    )}

                                    {element.type === "textarea" && (
                                        <>
                                            <textarea id={seenKeys} rows={5} value={eachValue} placeholder={placeHolder}
                                                onChange={(e) => {
                                                    seenFormSet(prevForm => {
                                                        const newForm = { ...prevForm }
                                                        const keyArray = seenKeys.split('/')

                                                        let tempForm = newForm

                                                        for (let i = 0; i < keyArray.length; i++) {
                                                            const subKey = keyArray[i]

                                                            if (i === keyArray.length - 1) {
                                                                let inputVal: string = e.target.value

                                                                tempForm[subKey] = inputVal

                                                            } else {
                                                                // @ts-ignore type
                                                                tempForm = tempForm[subKey]
                                                            }
                                                        }

                                                        return newForm
                                                    })
                                                }}
                                            />
                                        </>
                                    )}

                                    {element.type === "image" && typeof eachValue === 'string' && (
                                        <div style={{ display: "grid", alignContent: "flex-start" }}>
                                            {eachValue !== "" && <Image alt={`${seenKeys} image`} src={eachValue} width={50} height={50} />}

                                            <input id={seenKeys} type={"text"} value={eachValue} placeholder={placeHolder}
                                                onChange={(e) => {
                                                    seenFormSet(prevForm => {
                                                        const newForm = { ...prevForm }
                                                        const keyArray = seenKeys.split('/')

                                                        let tempForm = newForm

                                                        for (let i = 0; i < keyArray.length; i++) {
                                                            const subKey = keyArray[i]

                                                            if (i === keyArray.length - 1) {
                                                                let inputVal: string | number = e.target.value
                                                                tempForm[subKey] = inputVal

                                                            } else {
                                                                // @ts-ignore type
                                                                tempForm = tempForm[subKey]
                                                            }
                                                        }

                                                        return newForm
                                                    })
                                                }}
                                            />

                                            <button className='mainButton' style={{ justifySelf: "flex-start" }}
                                                onClick={() => {

                                                }}
                                            >upload</button>
                                        </div>
                                    )}

                                    {element.type === "color" && typeof eachValue === 'string' && (
                                        <>
                                            <input id={seenKeys} type={"color"} value={eachValue} style={{ width: "50px", height: "50px" }}
                                                onChange={(e) => {
                                                    seenFormSet(prevForm => {
                                                        const newForm = { ...prevForm }
                                                        const keyArray = seenKeys.split('/')

                                                        let tempForm = newForm

                                                        for (let i = 0; i < keyArray.length; i++) {
                                                            const subKey = keyArray[i]

                                                            if (i === keyArray.length - 1) {
                                                                let inputVal: string | number = e.target.value
                                                                tempForm[subKey] = inputVal

                                                            } else {
                                                                // @ts-ignore type
                                                                tempForm = tempForm[subKey]
                                                            }
                                                        }

                                                        return newForm
                                                    })
                                                }}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {typeof eachValue === 'boolean' && (
                                <>
                                    <button className='mainButton' style={{ backgroundColor: eachValue ? "rgb(var(--color1))" : "" }}
                                        onClick={() => {
                                            seenFormSet(prevForm => {
                                                const newForm = { ...prevForm }
                                                const keyArray = seenKeys.split('/')

                                                let tempForm = newForm

                                                for (let i = 0; i < keyArray.length; i++) {
                                                    const subKey = keyArray[i]

                                                    if (i === keyArray.length - 1) {
                                                        tempForm[subKey] = !tempForm[subKey]

                                                    } else {
                                                        // @ts-ignore type
                                                        tempForm = tempForm[subKey]
                                                    }
                                                }

                                                return newForm
                                            })
                                        }}
                                    >{eachValue.toString()}</button>
                                </>
                            )}

                            {typeof eachValue === 'object' && eachValue === null && (
                                <>
                                    <p>null</p>
                                </>
                            )}

                            {typeof eachValue === 'undefined' && (
                                <>
                                    <p>undefined</p>
                                </>
                            )}

                            {seenFormErrors[seenKeys] !== undefined && (
                                <p style={{ color: "red" }}>{seenFormErrors[seenKeys]}</p>
                            )}
                        </div>
                    )
                }
            })}
        </div>
    )
}
