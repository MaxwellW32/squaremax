"use client"
import { template, templateInfoPostMessageSchema, templateInfoPostMessageType, websiteCustomizationsType } from '@/types'
import React, { useRef, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function InteractwithTemplates({ seenTemplate }: { seenTemplate: template }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const [websiteCustomizations, websiteCustomizationsSet] = useState<websiteCustomizationsType | null>(null)

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

    useEffect(() => {
        function handleMessage(message: MessageEvent<unknown>) {
            try {
                const seenResponse = message.data
                const templateInfoPostMessageCheck = templateInfoPostMessageSchema.safeParse(seenResponse)

                if (!templateInfoPostMessageCheck.success) return

                const templateInfoPostMessage: templateInfoPostMessageType = templateInfoPostMessageCheck.data

                if (templateInfoPostMessage.fromTemplate !== seenTemplate.id) return

                const newWebsiteCustomizations: websiteCustomizationsType = {
                    projectName: `myPerfectWebsite`,
                    customerGlobalFormData: templateInfoPostMessage.data
                }

                websiteCustomizationsSet(newWebsiteCustomizations)

            } catch (error) {
                console.log(`$error reading template`, error);
            }
        }

        window.addEventListener("message", handleMessage)
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [])

    return (
        <div style={{ display: seenTemplate === null ? "none" : "grid", gap: "1rem" }}>
            <iframe ref={iframeRef} style={{ height: "100vh", width: "90vw", margin: "0 auto" }} src={seenTemplate.url} />

            <button className='smallButton'
                onClick={async () => {
                    try {
                        if (websiteCustomizations === null) return

                        const response = await fetch(`/api/downloadWebsite?githubUrl=${seenTemplate.github}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(websiteCustomizations),
                        })
                        const responseBlob = await response.blob()

                        const url = window.URL.createObjectURL(responseBlob);

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${seenTemplate.name}.zip`;
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


