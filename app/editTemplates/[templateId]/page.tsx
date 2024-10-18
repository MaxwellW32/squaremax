"use client"
import { templatesInfo } from '@/types'
import React, { useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function Page({ params }: { params: { templateId: string } }) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)

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

    useEffect(() => {
        function handleMessage(message: MessageEvent<unknown>) {
            const seenResponse = message.data
            console.log(`$main seeing response`, seenResponse);
        }

        window.addEventListener("message", handleMessage)
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [])

    if (templatesInfo[params.templateId] === undefined) return <p>not seeing that template</p>

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            {/* <iframe ref={iframeRef} style={{ height: "100vh", width: "90vw", margin: "0 auto" }} src={`${window.location.protocol}//${window.location.hostname}:${templatesInfo[params.templateId].port}`} /> */}

            <button className='smallButton'
                onClick={async () => {
                    try {
                        const response = await fetch(`/api/downloadWebsite?id=${params.templateId}`)
                        const responseBlob = await response.blob()

                        const url = window.URL.createObjectURL(responseBlob);

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${params.templateId}.zip`;
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


