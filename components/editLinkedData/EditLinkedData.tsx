"use client"
import { globalFormDataType, linkedDataSchema, linkedDataType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState, useEffect, useMemo } from 'react'
import TextInput from '../textInput/TextInput'
import styles from "./styles.module.css"
import ShowMore from '../showMore/ShowMore'
import TextArea from '../textArea/TextArea'
import { ZodError } from "zod";

type formInputInputType = {
    label?: string,
    placeHolder?: string,
    type?: "text" | "number",
    required?: boolean,

    inputType: "input"
}

type formInputTextareaType = {
    label?: string,
    placeHolder?: string,
    required?: boolean,
    inputType: "textarea"
}

type formInputImageType = {
    label?: string,
    placeHolder?: string,
    required?: boolean,

    inputType: "image"
}

type formInputType = formInputInputType | formInputTextareaType | formInputImageType

type makeLinkedDataTypeFormInputs<Type> = {
    [key in keyof Type]: Type[key] extends (infer U)[] // Check if it's an array
    ? U extends object // If array item is an object
    ? [{ [SubKey in keyof U]: formInputType }] // Apply formInputType recursively for each object in the array
    : formInputType[] // If array items are not objects, just apply formInputType[]
    : Type[key] extends object // If it's an object
    ? makeLinkedDataTypeFormInputs<Type[key]> // Recurse into the object
    : formInputType; // Otherwise, just apply formInputType to the value
};

type moreFormInfoType = makeLinkedDataTypeFormInputs<linkedDataType>

type formErrorsType = { [key: string]: string }

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void }) {
    const [localLinkedData, localLinkedDataSet] = useState<linkedDataType>({ ...seenLinkedData })

    const [moreFormInfo,] = useState<moreFormInfoType>({
        siteInfo: {
            phone: {
                inputType: "input",
                label: "Business Phone Number",
                placeHolder: "Enter your business phone number"
            },
            address: {
                inputType: "input",
                label: "Business Address",
                placeHolder: "Enter your business address"
            },
            websiteName: {
                inputType: "input",
                label: "Website Name",
                placeHolder: "Enter the name of your website"
            },
            websiteTitle: {
                inputType: "input",
                label: "Website Title",
                placeHolder: "Enter the title for your website"
            },
            websiteDescription: {
                inputType: "input",
                label: "Website Description",
                placeHolder: "Enter a brief description of your website"
            },
            logo: {
                inputType: "input",
                label: "Logo URL",
                placeHolder: "Enter the URL for your business logo"
            },
            opengraphLogo: {
                inputType: "input",
                label: "Open Graph Logo URL",
                placeHolder: "Enter the URL for your Open Graph logo"
            },
            email: {
                inputType: "input",
                label: "Business Email",
                placeHolder: "Enter your business email"
            },
            workingHours: [{
                inputType: "input",
                label: "Working Hours",
                placeHolder: "Enter your business working hours"
            }],
            favicon: {
                inputType: "input",
                label: "Favicon URL",
                placeHolder: "Enter the URL for your favicon"
            },
            copyrightInformation: {
                inputType: "input",
                label: "Copyright Information",
                placeHolder: "Enter your copyright information"
            },
        },
        testimonials: [{
            date: {
                inputType: "input",
                label: "Testimonial Date",
                placeHolder: "Enter the date for the testimonial"
            },
            company: {
                inputType: "input",
                label: "Company Name",
                placeHolder: "Enter the company name"
            },
            //@ts-expect-error until i get recursion
            links: [{
                inputType: "input",
                label: "Testimonial Links",
                placeHolder: "Enter any relevant links"
            }],
            name: {
                inputType: "input",
                label: "Testimonial Author Name",
                placeHolder: "Enter the name of the person giving the testimonial"
            },
            photo: {
                inputType: "input",
                label: "Photo URL",
                placeHolder: "Enter a URL for the testimonial photo"
            },
            position: {
                inputType: "input",
                label: "Author's Position",
                placeHolder: "Enter the position of the person giving the testimonial"
            },
            rating: {
                inputType: "input",
                label: "Testimonial Rating",
                placeHolder: "Enter the rating (1-5)"
            },
            text: {
                inputType: "input",
                label: "Testimonial Text",
                placeHolder: "Enter the testimonial text"
            },
        }],
        team: [{
            name: {
                inputType: "input",
                label: "Team Member Name",
                placeHolder: "Enter the team member's name"
            },
            position: {
                inputType: "input",
                label: "Position",
                placeHolder: "Enter the position of the team member"
            },
            photo: {
                inputType: "input",
                label: "Team Member Photo URL",
                placeHolder: "Enter the URL for the team member's photo"
            },
            bio: {
                inputType: "input",
                label: "Team Member Bio",
                placeHolder: "Enter a brief bio for the team member"
            },
            //@ts-expect-error until i get recursion
            links: [{
                inputType: "input",
                label: "Social Links",
                placeHolder: "Enter social media links (if any)"
            }],
            email: {
                inputType: "input",
                label: "Team Member Email",
                placeHolder: "Enter the team member's email"
            },
            phone: {
                inputType: "input",
                label: "Team Member Phone",
                placeHolder: "Enter the team member's phone number"
            },
            //@ts-expect-error until i get recursion
            skills: [{
                inputType: "input",
                label: "Skills",
                placeHolder: "Enter skills (comma separated)"
            }],
            //@ts-expect-error until i get recursion
            achievements: [{
                inputType: "input",
                label: "Achievements",
                placeHolder: "Enter achievements (comma separated)"
            }],
        }],
        products: [{
            name: {
                inputType: "input",
                label: "Product Name",
                placeHolder: "Enter the product name"
            },
            description: {
                inputType: "input",
                label: "Product Description",
                placeHolder: "Enter the product description"
            },
            price: {
                inputType: "input",
                label: "Product Price",
                placeHolder: "Enter the product price"
            },
            //@ts-expect-error until i get recursion
            images: [{
                inputType: "input",
                label: "Product Image URL",
                placeHolder: "Enter the product image URL"
            }],
            sku: {
                inputType: "input",
                label: "Product SKU",
                placeHolder: "Enter the product SKU"
            },
            //@ts-expect-error until i get recursion
            categories: [{
                inputType: "input",
                label: "Product Categories",
                placeHolder: "Enter product categories (comma separated)"
            }],
            //@ts-expect-error until i get recursion
            tags: [{
                inputType: "input",
                label: "Product Tags",
                placeHolder: "Enter product tags (comma separated)"
            }],
            available: {
                inputType: "input",
                label: "Product Availability",
                placeHolder: "Enter if the product is available"
            },
            featured: {
                inputType: "input",
                label: "Featured Product",
                placeHolder: "Enter if the product is featured"
            },
            discounts: {
                inputType: "input",
                label: "Discounts",
                placeHolder: "Enter any discounts"
            },
            ratings: {
                inputType: "input",
                label: "Product Ratings",
                placeHolder: "Enter the product rating (1-5)"
            },
            //@ts-expect-error until i get recursion
            productTestimonials: [{
                date: {
                    inputType: "input",
                    label: "Testimonial Date",
                    placeHolder: "Enter the date for the product testimonial"
                },
                company: {
                    inputType: "input",
                    label: "Company Name",
                    placeHolder: "Enter the company name"
                },
                links: [{
                    inputType: "input",
                    label: "Testimonial Links",
                    placeHolder: "Enter any relevant links"
                }],
                name: {
                    inputType: "input",
                    label: "Testimonial Author Name",
                    placeHolder: "Enter the name of the person giving the testimonial"
                },
                photo: {
                    inputType: "input",
                    label: "Testimonial Photo URL",
                    placeHolder: "Enter a URL for the testimonial photo"
                },
                position: {
                    inputType: "input",
                    label: "Author's Position",
                    placeHolder: "Enter the position of the person giving the testimonial"
                },
                rating: {
                    inputType: "input",
                    label: "Testimonial Rating",
                    placeHolder: "Enter the rating (1-5)"
                },
                text: {
                    inputType: "input",
                    label: "Testimonial Text",
                    placeHolder: "Enter the testimonial text"
                },
            }],
        }],
        gallery: [{
            title: {
                inputType: "input",
                label: "Gallery Item Title",
                placeHolder: "Enter the title of the gallery item"
            },
            description: {
                inputType: "input",
                label: "Gallery Item Description",
                placeHolder: "Enter a description for the gallery item"
            },
            image: {
                inputType: "input",
                label: "Gallery Image URL",
                placeHolder: "Enter the image URL"
            },
            //@ts-expect-error until i get recursion
            categories: [{
                inputType: "input",
                label: "Gallery Categories",
                placeHolder: "Enter categories (comma separated)"
            }],
            //@ts-expect-error until i get recursion
            tags: [{
                inputType: "input",
                label: "Gallery Tags",
                placeHolder: "Enter tags (comma separated)"
            }],
            featured: {
                inputType: "input",
                label: "Featured Gallery Item",
                placeHolder: "Enter if the item is featured"
            },
            date: {
                inputType: "input",
                label: "Item Date",
                placeHolder: "Enter the date"
            },
            author: {
                inputType: "input",
                label: "Author Name",
                placeHolder: "Enter the author's name"
            },
        }],
        services: [{
            title: {
                inputType: "input",
                label: "Service Title",
                placeHolder: "Enter the title of the service"
            },
            description: {
                inputType: "input",
                label: "Service Description",
                placeHolder: "Enter a description of the service"
            },
            price: {
                inputType: "input",
                label: "Service Price",
                placeHolder: "Enter the price for this service"
            },
            icon: {
                inputType: "input",
                label: "Service Icon URL",
                placeHolder: "Enter the URL for the service icon"
            },
            duration: {
                inputType: "input",
                label: "Service Duration",
                placeHolder: "Enter the duration of the service"
            },
            //@ts-expect-error until i get recursion
            tags: [{
                inputType: "input",
                label: "Service Tags",
                placeHolder: "Enter tags (comma separated)"
            }],
            callToAction: {
                inputType: "input",
                label: "Call to Action",
                placeHolder: "Enter a call to action for the service"
            },
            availability: {
                inputType: "input",
                label: "Service Availability",
                placeHolder: "Enter the availability status"
            },
            //@ts-expect-error until i get recursion
            serviceTestimonials: [{
                date: {
                    inputType: "input",
                    label: "Testimonial Date",
                    placeHolder: "Enter the date for the testimonial"
                },
                company: {
                    inputType: "input",
                    label: "Company Name",
                    placeHolder: "Enter the company name"
                },
                links: [{
                    inputType: "input",
                    label: "Testimonial Links",
                    placeHolder: "Enter any relevant links"
                }],
                name: {
                    inputType: "input",
                    label: "Testimonial Author Name",
                    placeHolder: "Enter the name of the person giving the testimonial"
                },
                photo: {
                    inputType: "input",
                    label: "Testimonial Photo URL",
                    placeHolder: "Enter a URL for the testimonial photo"
                },
                position: {
                    inputType: "input",
                    label: "Author's Position",
                    placeHolder: "Enter the position of the person giving the testimonial"
                },
                rating: {
                    inputType: "input",
                    label: "Testimonial Rating",
                    placeHolder: "Enter the rating (1-5)"
                },
                text: {
                    inputType: "input",
                    label: "Testimonial Text",
                    placeHolder: "Enter the testimonial text"
                },
            }],
        }],
        socials: [{
            platform: {
                inputType: "input",
                label: "Social Media Platform",
                placeHolder: "Enter the platform name (e.g., Facebook, Instagram)"
            },
            url: {
                inputType: "input",
                label: "Platform URL",
                placeHolder: "Enter the URL for the social media profile"
            },
            icon: {
                inputType: "input",
                label: "Platform Icon URL",
                placeHolder: "Enter the URL for the social media platform's icon"
            },
            description: {
                inputType: "input",
                label: "Platform Description",
                placeHolder: "Enter a description for this platform"
            },
        }],
    })

    const [formErrors, formErrorsSet] = useState<formErrorsType>({})

    const formHasErrors = useMemo(() => {
        let seeingErrors = false

        if (Object.entries(formErrors).length > 0) {
            seeingErrors = true
        }

        return seeingErrors
    }, [formErrors])

    //send up to main / check for formErrors
    useEffect(() => {
        const linkedDataValidTest = linkedDataSchema.safeParse(localLinkedData)

        if (!linkedDataValidTest.success) {
            console.log(`$didnt save because `, linkedDataValidTest.error);

            //update formErrors
            const seenError = linkedDataValidTest.error as ZodError
            const allErrors = seenError.errors.map(eachError => {
                const pathAsString = eachError.path.join("/")
                return [pathAsString, eachError.message]
            })
            const allErrorsObj = Object.fromEntries(allErrors)
            formErrorsSet(allErrorsObj)
            return
        }

        //sucess
        updateProjectsToTemplate({ option: "linked", id: seenProjectToTemplate.id, data: linkedDataValidTest.data })

        //only update form errors once when its not empty
        if (Object.entries(formErrors).length > 0) {
            formErrorsSet({})
        }
    }, [localLinkedData])

    return (
        <ShowMore label='Linked data' content={(
            <div className={styles.formInputCont}>
                {/* notify */}
                {formHasErrors && (<h3>progress wont be saved until errors are resolved</h3>)}
                {/* @ts-expect-error until i get recursion */}
                <RecursiveView passedObj={localLinkedData} formSet={localLinkedDataSet} formErrors={formErrors} formErrorsSet={formErrorsSet} keys="" moreFormInfo={moreFormInfo} />
            </div>
        )} />
    )
}

function RecursiveView({ passedObj, formSet, formErrors, formErrorsSet, keys, moreFormInfo, prevValueIsArray }: { passedObj: object, formSet: React.Dispatch<React.SetStateAction<object>>, formErrors: formErrorsType, formErrorsSet: React.Dispatch<React.SetStateAction<formErrorsType>>, keys: string, moreFormInfo: moreFormInfoType, prevValueIsArray?: boolean }) {
    function updateInput(seenKeys: string, newValue: unknown) {
        formSet(prevForm => {
            const newForm = { ...prevForm }
            const keyArray = seenKeys.split("/");

            let newTempForm = newForm
            keyArray.forEach((eachKey, index) => {
                if (index === keyArray.length - 1) {
                    //assign value
                    //@ts-expect-error unkown check
                    newTempForm[eachKey] = newValue;

                } else {
                    //@ts-expect-error unkown check
                    newTempForm = newTempForm[eachKey];
                }
            });

            return newForm
        })
    };

    function deleteFromArray(seenKeys: string) {
        formSet(prevForm => {
            const newForm = JSON.parse(JSON.stringify(prevForm))
            const keyArray = seenKeys.split("/");

            const seenIndex = parseInt(keyArray[keyArray.length - 1])
            let newTempForm = newForm

            keyArray.forEach((eachKey, index) => {
                if (index === keyArray.length - 2) {//we receive the array index, -2 goes back to the base array
                    // @ts-expect-error any type
                    newTempForm[eachKey] = newTempForm[eachKey].filter((eachT, eachTIndex) => eachTIndex !== seenIndex)

                } else {
                    newTempForm = newTempForm[eachKey];
                }
            });

            return newForm
        });
    };

    function getMoreFormInfoData(seenKeys: string): formInputType {
        const newForm = { ...moreFormInfo }

        //repalce all other array indexes with 0
        const keyArray = seenKeys.split("/").map(key => key.replace(/\d+/g, '0'));

        let seenFormInfo: formInputType | undefined = undefined

        let newTempForm = newForm
        keyArray.forEach((eachKey, index) => {
            if (index === keyArray.length - 1) {
                //assign value
                //@ts-expect-error until i get recursion
                seenFormInfo = newTempForm[eachKey]

            } else {
                //@ts-expect-error until i get recursion
                newTempForm = newTempForm[eachKey];
            }
        });

        if (seenFormInfo === undefined) {
            throw new Error("must always see form info")
        }

        return seenFormInfo
    }

    return Object.entries(passedObj).map(eachObjEntry => {
        const eachObjKey = eachObjEntry[0]
        const eachObjValue = eachObjEntry[1];

        // Concatenate parent key with current key, adding '/' between them for hierarchy
        const newKeys = keys !== "" ? `${keys}/${eachObjKey}` : eachObjKey;

        // Recursively render nested object, pass down the updated key path
        if (typeof eachObjValue === "object") {
            const isArray = Array.isArray(eachObjValue)

            return (
                <ShowMore key={newKeys} label={eachObjKey} content={(
                    <div className={styles.formInputCont}>
                        <div className={`${isArray ? `${styles.scrollCont} snap` : styles.formInputCont}`}>
                            <RecursiveView passedObj={eachObjValue} formSet={formSet} formErrors={formErrors} formErrorsSet={formErrorsSet} keys={newKeys} moreFormInfo={moreFormInfo} prevValueIsArray={isArray ? true : undefined} />
                        </div>

                        {/* add */}
                        {isArray && (
                            <button className='mainButton' style={{ alignSelf: "center" }}
                                onClick={() => {
                                    if (eachObjKey === "workingHours") {
                                        const newWorkingHour: linkedDataType["siteInfo"]["workingHours"][number] = ""

                                        console.log(`$passed this eachObjValue`, JSON.stringify(eachObjValue));

                                        updateInput(newKeys, [...eachObjValue, newWorkingHour])
                                    }
                                }}
                            >add</button>
                        )}
                    </div>
                )} />
            );
        }

        const seenFormInfo = getMoreFormInfoData(newKeys)

        return (
            <div className={styles.formInputCont} key={eachObjKey}>
                {/* close */}
                {prevValueIsArray === true && (
                    <button className='secondaryButton' style={{ justifySelf: "flex-end" }}
                        onClick={() => {
                            deleteFromArray(newKeys)
                        }}
                    >close</button>
                )}

                {seenFormInfo.inputType === "input" ? (
                    <TextInput
                        name={eachObjKey}
                        value={`${eachObjValue}`}
                        type={seenFormInfo.type}
                        label={seenFormInfo.label}
                        placeHolder={seenFormInfo.placeHolder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            updateInput(newKeys, e.target.value)
                        }}
                        errors={formErrors[newKeys]}
                    />
                ) :
                    seenFormInfo.inputType === "textarea" ? (
                        <TextArea
                            name={eachObjKey}
                            value={`${eachObjValue}`}
                            label={seenFormInfo.label}
                            placeHolder={seenFormInfo.placeHolder}
                            onInput={e => {
                                //@ts-expect-error textarea not seeing e
                                updateInput(newKeys, e.target.value)
                            }}
                            errors={formErrors[newKeys]}
                        />
                    ) :
                        seenFormInfo.inputType === "image" ? (
                            <></>
                        ) : null}
            </div>
        );
    });
}