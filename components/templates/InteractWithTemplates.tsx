"use client"
import { updateProjectsToTemplates } from '@/serverFunctions/handleProjectsToTemplates'
import { dataFromTemplateSchema, dataFromTemplateType, dataToTemplateType, project, projectsToTemplate } from '@/types'
import React, { useRef, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'


export default function InteractwithTemplates({ seenProject, seenProjectToTemplate, savedSet }: { seenProject: project, seenProjectToTemplate: projectsToTemplate, savedSet: React.Dispatch<React.SetStateAction<boolean | "in progress">> }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const syncDebounce = useRef<NodeJS.Timeout>()

    const [heardBackFromTemplate, heardBackFromTemplateSet] = useState(false)
    const loopInterval = useRef<NodeJS.Timeout>()

    //send saved data from database
    useEffect(() => {
        // stop loop when heard back from template
        if (heardBackFromTemplate) {
            if (loopInterval.current) clearInterval(loopInterval.current)
            return
        }

        //loop to send data to template
        loopInterval.current = setInterval(() => {
            if (iframeRef.current === null || iframeRef.current.contentWindow === null) return

            const newDataToTemplate: dataToTemplateType = {
                sharedData: seenProject.sharedData,
                specificData: seenProjectToTemplate.specificData
            }

            iframeRef.current.contentWindow.postMessage(newDataToTemplate, "*")
        }, 1000)

        return () => {
            if (loopInterval.current) clearInterval(loopInterval.current)
        }

    }, [heardBackFromTemplate])

    //receive data from template and set templateInfoPostMessage
    useEffect(() => {
        function handleMessage(message: MessageEvent<unknown>) {
            try {
                //ensure the template is here
                if (seenProjectToTemplate.template === undefined) return

                //ensure data in correct format
                const seenResponse = message.data
                const dataFromTemplateCheck = dataFromTemplateSchema.safeParse(seenResponse)

                if (!dataFromTemplateCheck.success || dataFromTemplateCheck.data.fromTemplate !== seenProjectToTemplate.template.id) return

                if (!heardBackFromTemplate) {
                    heardBackFromTemplateSet(true)
                    console.log(`$main heard from template`);
                    return
                }

                //set the latest template data to server
                saveTemplateDataToServer(dataFromTemplateCheck.data)

            } catch (error) {
                console.log(`$error reading template`, error);
            }
        }

        window.addEventListener("message", handleMessage)
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [heardBackFromTemplate])

    function saveTemplateDataToServer(dataFromTemplate: dataFromTemplateType) {
        try {
            if (syncDebounce.current) clearTimeout(syncDebounce.current)
            savedSet("in progress")

            syncDebounce.current = setTimeout(async () => {
                // update projects to templates with new template data
                await updateProjectsToTemplates({
                    id: seenProjectToTemplate.id,
                    specificData: dataFromTemplate.specificData
                })

                savedSet(true)

                console.log(`$saved templateData`);
            }, 5000);

        } catch (error) {
            toast.error("error saving")
            console.log(`$error`, error);
        }
    }

    if (seenProjectToTemplate.template === undefined) return null

    return (
        <iframe ref={iframeRef} style={{ height: "100vh", width: "90vw", margin: "0 auto" }} src={process.env.NEXT_PUBLIC_IN_DEVELOPMENT === "TRUE" ? "http://localhost:3001" : seenProjectToTemplate.template.url} />
    )
}


