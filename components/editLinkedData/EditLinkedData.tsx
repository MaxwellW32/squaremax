"use client"
import { formErrorsType, formInputType, globalFormDataType, linkedDataSchema, linkedDataType, moreFormInfoType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useState, useEffect, useMemo } from 'react'
import styles from "./styles.module.css"
import ShowMore from '../showMore/ShowMore'
import { ZodError } from "zod";
import TextArea from '@/components/templateWebsiteForms/textArea/TextArea'
import TextInput from '@/components/templateWebsiteForms/textInput/TextInput'

export default function EditLinkedData({ seenLinkedData, seenProjectToTemplate, updateProjectsToTemplate }: { seenLinkedData: globalFormDataType["linkedData"], seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => Promise<boolean> }) {
    const [localLinkedData, localLinkedDataSet] = useState<linkedDataType>({ ...seenLinkedData })
    const [userInteracted, userInteractedSet] = useState(false)

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
                placeHolder: "This sets the file name of your website when downloading"
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
        if (!userInteracted) return

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
    }, [userInteracted, localLinkedData])

    return (
        <ShowMore label='Linked data' content={(
            <div className={styles.formInputCont}>
                {/* notify */}
                {formHasErrors && (<h3>progress wont be saved until errors are resolved</h3>)}

                {/* @ts-expect-error until i get recursion */}
                <RecursiveView passedObj={localLinkedData} formSet={localLinkedDataSet} formErrors={formErrors} formErrorsSet={formErrorsSet} userInteractedSet={userInteractedSet} keys="" moreFormInfo={moreFormInfo} />
            </div>
        )} />
    )
}

function RecursiveView({ passedObj, formSet, formErrors, formErrorsSet, userInteractedSet, keys, moreFormInfo, prevIterationArrayCustomKey }: { passedObj: object, formSet: React.Dispatch<React.SetStateAction<object>>, formErrors: formErrorsType, formErrorsSet: React.Dispatch<React.SetStateAction<formErrorsType>>, userInteractedSet: React.Dispatch<React.SetStateAction<boolean>>, keys: string, moreFormInfo: moreFormInfoType, prevIterationArrayCustomKey?: string }) {
    function updateInput(seenKeys: string, newValue: unknown) {
        userInteractedSet(true)

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
        userInteractedSet(true)

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
            const keyIsANumber = !isNaN(parseInt(eachObjKey))
            const dynamicLabelTop = keyIsANumber ? `${prevIterationArrayCustomKey} ${parseInt(eachObjKey) + 1}` : eachObjKey

            return (
                <ShowMore key={newKeys} label={dynamicLabelTop} content={(
                    <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem" }}>
                        <div className={`${isArray ? `${styles.scrollCont} snap` : ""}`} style={{ ...(isArray ? {} : { display: "grid", alignContent: "flex-start", gap: "1rem" }) }}>
                            <RecursiveView passedObj={eachObjValue} formSet={formSet} formErrors={formErrors} formErrorsSet={formErrorsSet} userInteractedSet={userInteractedSet} keys={newKeys} moreFormInfo={moreFormInfo} prevIterationArrayCustomKey={isArray ? dynamicLabelTop : undefined} />
                        </div>

                        {/* add */}
                        {isArray && (
                            <button className='mainButton' style={{ alignSelf: "center" }}
                                onClick={() => {
                                    const convertedKeys = newKeys.split("/").map(key => key.replace(/\d+/g, '0')).join("/")

                                    if (convertedKeys === "siteInfo/workingHours") {
                                        const newWorkingHour: linkedDataType["siteInfo"]["workingHours"][number] = ""
                                        updateInput(newKeys, [...eachObjValue, newWorkingHour])

                                    } else if (convertedKeys === "testimonials") {
                                        const newTestimonial: linkedDataType["testimonials"][number] = {
                                            name: "",
                                            position: "",
                                            photo: "",
                                            text: "",
                                            rating: 5,
                                            date: "",
                                            links: [],
                                            company: "",
                                        }

                                        updateInput(newKeys, [...eachObjValue, newTestimonial])

                                    } else if (convertedKeys === "testimonials/0/links") {
                                        const newTestimonialLink: linkedDataType["testimonials"][number]["links"][number] = ""

                                        updateInput(newKeys, [...eachObjValue, newTestimonialLink])

                                    } else if (convertedKeys === "team") {
                                        const newTeam: linkedDataType["team"][number] = {
                                            name: "",
                                            position: "",
                                            photo: "",
                                            bio: "",
                                            links: [],
                                            email: "",
                                            phone: "",
                                            skills: [],
                                            achievements: [],
                                        }

                                        updateInput(newKeys, [...eachObjValue, newTeam])

                                    } else if (convertedKeys === "team/0/links") {
                                        const newTeamLink: linkedDataType["team"][number]["links"][number] = ""

                                        updateInput(newKeys, [...eachObjValue, newTeamLink])

                                    } else if (convertedKeys === "team/0/skills") {
                                        const newTeamSkill: linkedDataType["team"][number]["skills"][number] = ""

                                        updateInput(newKeys, [...eachObjValue, newTeamSkill])

                                    } else if (convertedKeys === "team/0/achievements") {
                                        const newTeamAchievement: linkedDataType["team"][number]["achievements"][number] = ""

                                        updateInput(newKeys, [...eachObjValue, newTeamAchievement])

                                    } else if (convertedKeys === "products") {
                                        const newProduct: linkedDataType["products"][number] = {
                                            name: "",
                                            description: "",
                                            price: 0,
                                            images: [],
                                            sku: "",
                                            categories: [],
                                            tags: [],
                                            available: true,
                                            featured: false,
                                            discounts: "",
                                            ratings: 0,
                                            productTestimonials: [],
                                        }

                                        updateInput(newKeys, [...eachObjValue, newProduct])

                                    } else if (convertedKeys === "products/0/images") {
                                        const newProductImage: linkedDataType["products"][number]["images"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newProductImage]);

                                    } else if (convertedKeys === "products/0/categories") {
                                        const newProductCategory: linkedDataType["products"][number]["categories"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newProductCategory]);

                                    } else if (convertedKeys === "products/0/tags") {
                                        const newProductTag: linkedDataType["products"][number]["tags"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newProductTag]);

                                    } else if (convertedKeys === "products/0/productTestimonials") {
                                        const newProductTestimonial: linkedDataType["testimonials"][number] = {
                                            name: "",
                                            position: "",
                                            photo: "",
                                            text: "",
                                            rating: 5,
                                            date: "",
                                            links: [],
                                            company: "",
                                        };

                                        updateInput(newKeys, [...eachObjValue, newProductTestimonial]);

                                    } else if (convertedKeys === "products/0/productTestimonials/0/links") {
                                        const newProductTestimonialLinks: linkedDataType["testimonials"][number]["links"][number] = ""

                                        updateInput(newKeys, [...eachObjValue, newProductTestimonialLinks]);

                                    } else if (convertedKeys === "gallery") {
                                        const newGalleryItem: linkedDataType["gallery"][number] = {
                                            title: "",
                                            description: "",
                                            image: "",
                                            categories: [],
                                            tags: [],
                                            featured: false,
                                            date: "",
                                            author: "",
                                        };

                                        updateInput(newKeys, [...eachObjValue, newGalleryItem]);

                                    } else if (convertedKeys === "gallery/0/categories") {
                                        const newGalleryCategory: linkedDataType["gallery"][number]["categories"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newGalleryCategory]);

                                    } else if (convertedKeys === "gallery/0/tags") {
                                        const newGalleryTag: linkedDataType["gallery"][number]["tags"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newGalleryTag]);

                                    } else if (convertedKeys === "services") {
                                        const newService: linkedDataType["services"][number] = {
                                            title: "",
                                            description: "",
                                            price: 0,
                                            icon: "",
                                            duration: "",
                                            tags: [],
                                            callToAction: "",
                                            availability: "",
                                            serviceTestimonials: [],
                                        };

                                        updateInput(newKeys, [...eachObjValue, newService]);

                                    } else if (convertedKeys === "services/0/tags") {
                                        const newServiceTag: linkedDataType["services"][number]["tags"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newServiceTag]);

                                    } else if (convertedKeys === "services/0/serviceTestimonials") {
                                        const newServiceTestimonial: linkedDataType["testimonials"][number] = {
                                            name: "",
                                            position: "",
                                            photo: "",
                                            text: "",
                                            rating: 5,
                                            date: "",
                                            links: [],
                                            company: "",
                                        };

                                        updateInput(newKeys, [...eachObjValue, newServiceTestimonial]);

                                    } else if (convertedKeys === "services/0/serviceTestimonials/0/links") {
                                        const newServiceTestimonialLink: linkedDataType["testimonials"][number]["links"][number] = "";

                                        updateInput(newKeys, [...eachObjValue, newServiceTestimonialLink]);

                                    } else if (convertedKeys === "socials") {
                                        const newSocial: linkedDataType["socials"][number] = {
                                            platform: "",
                                            url: "",
                                            icon: "",
                                            description: "",
                                        };

                                        updateInput(newKeys, [...eachObjValue, newSocial]);

                                    }
                                }}
                            >add</button>
                        )}
                    </div>
                )} />
            );
        }

        const seenFormInfo = getMoreFormInfoData(newKeys)
        // const dynamicLabel = prevIterationArrayCustomKey
        const dynamicLabel = prevIterationArrayCustomKey !== undefined ? `${prevIterationArrayCustomKey} ${parseInt(eachObjKey) + 1}` : seenFormInfo.label

        return (
            <div className={styles.formInputCont} key={eachObjKey}>
                {/* close */}
                {prevIterationArrayCustomKey !== undefined && (
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
                        label={dynamicLabel}
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
                            label={dynamicLabel}
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