"use client"

import { templatesInfo } from "@/types"

export default function Page({ params }: { params: { templateId: string } }) {

    return (
        <iframe src={templatesInfo[params.templateId].domain} />
    )
}


