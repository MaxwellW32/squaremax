import InteractwithTemplates from '@/components/interactWithTemplates/InteractWithTemplates'
import { getSpecificTemplate } from '@/serverFunctions/handleTemplates'
import React from 'react'

export default async function Page({ params }: { params: { templateId: string } }) {
    const seenTemplate = await getSpecificTemplate({ id: params.templateId })
    if (seenTemplate === undefined) return <p>Not seeing template</p>

    return (
        <InteractwithTemplates seenTemplate={seenTemplate} />
    )
}
