"use client"

import { templatesInfo } from "@/types"

export default function Page({ params }: { params: { templateId: string } }) {

    const iframeUrl = `${window.location.protocol}//${window.location.hostname}:${templatesInfo[params.templateId].port}`

    return (
        <iframe src={iframeUrl} />
    )
}


