"use client"
import { template, postMessageSchemaTemplateInfo, postMessageSchemaTemplateInfoType, project } from '@/types'
import React, { useRef, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function InteractwithTemplates({ seenProject }: { seenProject: project }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const [templateInfoPostMessage, templateInfoPostMessageSet] = useState<postMessageSchemaTemplateInfoType | null>(null)

    //will use this for sending save data
    //send of data to iframe template
    // useEffect(() => {
    //     if (iframeRef.current === null || iframeRef.current.contentWindow === null || templateSpecificFormObj === null) return

    //     const masterObj = {
    //         forTemplate: params.templateName,
    //         info: {
    //             sharedFormObj,
    //             templateSpecificFormObj
    //         }
    //     }

    //     iframeRef.current.contentWindow.postMessage(masterObj, "*")

    // }, [sharedFormObj, templateSpecificFormObj])

    //receive websiteCustomizations from template

    //receive data from template and set templateInfoPostMessage
    useEffect(() => {
        function handleMessage(message: MessageEvent<unknown>) {
            try {
                //ensure data in correct format
                const seenResponse = message.data
                const templateInfoPostMessageCheck = postMessageSchemaTemplateInfo.safeParse(seenResponse)
                if (!templateInfoPostMessageCheck.success || seenProject.template === null || seenProject.template === undefined || templateInfoPostMessageCheck.data.fromTemplate !== seenProject.template.id) return

                //set latest template data
                templateInfoPostMessageSet(templateInfoPostMessageCheck.data)

            } catch (error) {
                console.log(`$error reading template`, error);
            }
        }

        window.addEventListener("message", handleMessage)
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [])

    if (seenProject.template === null || seenProject.template === undefined) return null

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            <iframe ref={iframeRef} style={{ height: "100vh", width: "90vw", margin: "0 auto" }} src={seenProject.template!.url} />

            <button className='smallButton'
                onClick={async () => {
                    try {
                        if (templateInfoPostMessage === null || seenProject.template === null || seenProject.template === undefined) return

                        const response = await fetch(`/api/downloadWebsite?githubUrl=${seenProject.template.github}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(templateInfoPostMessage),
                        })
                        const responseBlob = await response.blob()

                        const url = window.URL.createObjectURL(responseBlob);

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${seenProject.template.name}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                    } catch (error) {
                        toast.error("Error downloading zip")
                        console.error('Error downloading zip:', error);
                    }
                }}
            >
                Download Website
            </button>
        </div>
    )
}


