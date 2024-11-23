"use client"
import { project } from '@/types'
import React, { useState } from 'react'
import ShowMore from '@/components/showMore/ShowMore'
import styles from "./style.module.css"
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { getSpecificProject, updateProject } from '@/serverFunctions/handleProjects'

export default function HandleUserUploadedImages({ project, seenProjectSet }: { project: project, seenProjectSet: React.Dispatch<React.SetStateAction<project>> }) {
    const [uploadedImage, uploadedImageSet] = useState<FormData | null>(null)
    const imageStarterUrl = `https://squaremaxtech.com/api/userImages/view?imageName=`

    return (
        <div>
            <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem" }}>
                <input type="file" placeholder='Upload image'
                    onChange={(e) => {
                        if (!e.target.files) return

                        const uploadedFile = e.target.files[0]

                        console.log(`$uploadedFile`, uploadedFile);


                        const formData = new FormData();

                        formData.append("file", uploadedFile);

                        uploadedImageSet(formData)
                    }}
                />

                <button className='mainButton'
                    onClick={async () => {
                        try {
                            if (uploadedImage === null) {
                                throw new Error("need to upload an image")
                            }

                            const response = await fetch(`/api/userImages/add`, {
                                method: 'POST',
                                body: uploadedImage,
                            })

                            const seenData = await response.json();
                            //make multi upload

                            //get the latest project images and upload project
                            const latestProject = await getSpecificProject({ option: "id", data: { id: project.id } })
                            if (latestProject === undefined) {
                                throw new Error("trouble updating, not seeing latest project")
                            }

                            let latestImagesSeen: project["userUploadedImages"] = latestProject.userUploadedImages

                            if (latestImagesSeen === null) {
                                latestImagesSeen = [seenData.name]
                            } else {
                                latestImagesSeen = [...latestImagesSeen, seenData.name]
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

                            toast.success("image uploaded")

                        } catch (error) {
                            toast.error("Error adding image")
                            console.error('Error adding image:', error);
                        }
                    }}
                >Add</button>
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
