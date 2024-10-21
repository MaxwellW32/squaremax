"use client"
import { refreshProjectPath, updateProject } from '@/serverFunctions/handleProjects'
import { postMessageTemplateInfoSchema, postMessageTemplateInfoType, project } from '@/types'
import React, { useRef, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function InteractwithTemplates({ seenProject, savedSet }: { seenProject: project, savedSet: React.Dispatch<React.SetStateAction<boolean | "in progress">> }) {
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

            iframeRef.current.contentWindow.postMessage({
                sentGlobalFormData: seenProject.templateData
            }, "*")
        }, 1000)

        return () => {
            if (loopInterval.current) clearInterval(loopInterval.current)
        }

    }, [heardBackFromTemplate])

    //receive data from template and set templateInfoPostMessage
    useEffect(() => {
        function handleMessage(message: MessageEvent<unknown>) {
            try {
                //ensure data in correct format
                const seenResponse = message.data
                const postMessageTemplateInfoCheck = postMessageTemplateInfoSchema.safeParse(seenResponse)
                if (!postMessageTemplateInfoCheck.success || seenProject.template === null || seenProject.template === undefined || postMessageTemplateInfoCheck.data.fromTemplate !== seenProject.template.id) return

                if (!heardBackFromTemplate) {
                    heardBackFromTemplateSet(true)
                    console.log(`$main heard from template`);
                    return
                }

                //set the latest template data to server
                saveTemplateDataToServer(postMessageTemplateInfoCheck.data)

            } catch (error) {
                console.log(`$error reading template`, error);
            }
        }

        window.addEventListener("message", handleMessage)
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [heardBackFromTemplate])

    if (seenProject.template === null || seenProject.template === undefined) return null

    function saveTemplateDataToServer(postMessageTemplateInfo: postMessageTemplateInfoType) {
        try {
            if (syncDebounce.current) clearTimeout(syncDebounce.current)
            savedSet("in progress")

            syncDebounce.current = setTimeout(async () => {
                // update project with new template id

                //ensure project name is in correct format 
                postMessageTemplateInfo.globalFormData.siteInfo.name = postMessageTemplateInfo.globalFormData.siteInfo.name.replace(/\s+/g, '-')

                await updateProject({
                    id: seenProject.id,
                    templateData: postMessageTemplateInfo.globalFormData
                })

                savedSet(true)

                console.log(`$saved templateData`);

                await refreshProjectPath({ name: seenProject.name })
            }, 5000);

        } catch (error) {
            toast.error("error saving")
            console.log(`$error`, error);
        }
    }

    return (
        <iframe ref={iframeRef} style={{ height: "100vh", width: "90vw", margin: "0 auto" }} src={process.env.NEXT_PUBLIC_IN_DEVELOPMENT === "TRUE" ? "http://localhost:3001" : seenProject.template.url} />
    )
}


