"use client"
import { dataFromTemplateSchema, globalFormDataType, projectToTemplatePlusType, projectsToTemplate, updateProjectsToTemplateFunctionType } from '@/types'
import React, { useRef, useEffect, useState } from 'react'

export default function InteractwithTemplates({ seenProjectToTemplate, updateProjectsToTemplate, updateProjectsToTemplatePlus, width, height, ...elProps }: { seenProjectToTemplate: projectsToTemplate, updateProjectsToTemplate: (choiceObj: updateProjectsToTemplateFunctionType) => void, updateProjectsToTemplatePlus: (id: string, data: Partial<projectToTemplatePlusType["moreInfo"]>) => void, width: number, height: number } & React.HtmlHTMLAttributes<HTMLDivElement>) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const [heardBackFromTemplate, heardBackFromTemplateSet] = useState(false)

    //listen to template signals and set connected
    useEffect(() => {
        //stop listening on heard back
        if (heardBackFromTemplate) {
            window.removeEventListener("message", handleMessage)
            return
        }

        function handleMessage(message: MessageEvent<unknown>) {
            try {
                //ensure the template is here
                if (seenProjectToTemplate.template === undefined) {
                    return
                }

                //ensure data in correct format
                const seenResponse = message.data
                const dataFromTemplate = dataFromTemplateSchema.parse(seenResponse)

                // ensure tempalte data valid and meant for this template
                if (dataFromTemplate.fromTemplate !== seenProjectToTemplate.template.id) {
                    console.log(`$missmatched template id`);
                    return
                }

                // set heard back from template once
                heardBackFromTemplateSet(true)

                //set connected
                console.log(`$main heard from template`);
                updateProjectsToTemplatePlus(seenProjectToTemplate.id, { connected: true })

                //update project projectsToTemplates data with one from template only if null
                if (seenProjectToTemplate.globalFormData === null) {
                    updateProjectsToTemplate({ option: "globalFormData", id: seenProjectToTemplate.id, data: dataFromTemplate.globalFormData })
                }

            } catch (error) {
                console.log(`$error reading from template`, error);
            }
        }

        window.addEventListener("message", handleMessage)

        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [heardBackFromTemplate])

    //send saved data from database on first load
    useEffect(() => {
        if (!heardBackFromTemplate) return

        //send data to template on every change
        sendGlobalFormData()

    }, [heardBackFromTemplate, seenProjectToTemplate])

    //send globalForm data from database
    function sendGlobalFormData() {
        if (iframeRef.current === null || iframeRef.current.contentWindow === null || seenProjectToTemplate.globalFormData === null) return

        const newGlobalFormDataToTemplate: globalFormDataType = seenProjectToTemplate.globalFormData

        iframeRef.current.contentWindow.postMessage(newGlobalFormDataToTemplate, "*")
    }

    // ensure there is a template
    if (seenProjectToTemplate.template === undefined) return null

    return (
        <iframe {...elProps} ref={iframeRef} width={width} height={height} src={process.env.NEXT_PUBLIC_IN_DEVELOPMENT === "TRUE" ? "http://localhost:3001" : seenProjectToTemplate.template.url} />
    )
}


