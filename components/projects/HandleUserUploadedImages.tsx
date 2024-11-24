"use client"
import { project } from '@/types'
import React, { useState } from 'react'
import ShowMore from '@/components/showMore/ShowMore'
import styles from "./style.module.css"
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { getSpecificProject, updateProject } from '@/serverFunctions/handleProjects'

export default function HandleUserUploadedImages({ project, seenProjectSet }: { project: project, seenProjectSet: React.Dispatch<React.SetStateAction<project>> }) {
    const [uploadedImages, uploadedImagesSet] = useState<FormData | null>(null)
    const imageStarterUrl = `https://squaremaxtech.com/api/userImages/view?imageName=`

    return (
        <div>
            <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem" }}>
                <button className='mainButton' style={{ justifySelf: "flex-start" }}>
                    <label htmlFor='fileUpload' style={{ cursor: "pointer" }}>
                        upload images
                    </label>
                </button>

                <input id='fileUpload' type="file" placeholder='Upload images' multiple={true} accept="image/*" style={{ display: "none" }}
                    onChange={(e) => {
                        if (!e.target.files) return

                        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
                        const uploadedFiles = e.target.files

                        const formData = new FormData();

                        for (let index = 0; index < uploadedFiles.length; index++) {
                            const file = uploadedFiles[index];

                            // Check if file is an image (this will be redundant because of the 'accept' attribute, but can be good for double-checking)
                            if (!file.type.startsWith("image/")) {
                                toast.error(`File ${file.name} is not an image.`);
                                continue;
                            }

                            // Check the file size
                            if (file.size > maxSizeInBytes) {
                                toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
                                continue;
                            }

                            formData.append(`file${index}`, uploadedFiles[index]);
                        }

                        uploadedImagesSet(formData)
                    }}
                />

                {uploadedImages !== null && (
                    <button className='mainButton'
                        onClick={async () => {
                            try {
                                if (uploadedImages === null) {
                                    throw new Error("need to upload an image")
                                }

                                const response = await fetch(`/api/userImages/add`, {
                                    method: 'POST',
                                    body: uploadedImages,
                                })

                                //array of image names
                                const seenData = await response.json();

                                //get the latest project images and upload project
                                const latestProject = await getSpecificProject({ option: "id", data: { id: project.id } })
                                if (latestProject === undefined) {
                                    throw new Error("trouble updating, not seeing latest project")
                                }

                                let latestImagesSeen: project["userUploadedImages"] = latestProject.userUploadedImages

                                if (latestImagesSeen === null) {
                                    latestImagesSeen = [...seenData.imageNames]
                                } else {
                                    latestImagesSeen = [...latestImagesSeen, ...seenData.imageNames]
                                }

                                //update the server
                                await updateProject({
                                    id: project.id,
                                    userUploadedImages: latestImagesSeen
                                })

                                //update local
                                seenProjectSet(prevSeenProject => {
                                    const newSeenProject = { ...prevSeenProject }

                                    newSeenProject.userUploadedImages = latestImagesSeen

                                    return newSeenProject
                                })

                                toast.success("images uploaded")

                                uploadedImagesSet(null)

                            } catch (error) {
                                toast.error("Error adding image")
                                console.error('Error adding image:', error);
                            }
                        }}
                    >Add</button>
                )}
            </div>

            {project.userUploadedImages !== null && (
                <ShowMore
                    label='View Uploaded Images'
                    content={(
                        <div className={styles.imagesCont}>
                            {project.userUploadedImages.map(eachImage => {
                                return (
                                    <div key={eachImage} className={styles.imageCont}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${imageStarterUrl}${eachImage}`);
                                            toast.success("id copied")
                                        }}
                                    >
                                        <Image alt='gallery image' src={`${imageStarterUrl}${eachImage}`} width={300} height={300} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                />
            )}
        </div>
    )
}
