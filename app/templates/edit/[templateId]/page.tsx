import React from 'react'
import { auth } from '@/auth/auth'
import AddTemplate from '@/components/templates/addTemplate'
import { getSpecificTemplate } from '@/serverFunctions/handleTemplates'

export default async function Page({ params }: { params: { templateId: string } }) {
    const session = await auth()
    if (session === null || session.user.role !== "admin") return <p>Not authorized to update template</p>

    const seenTemplate = await getSpecificTemplate({ id: params.templateId })
    if (seenTemplate === undefined) return <p>not seeing template</p>

    return (
        <AddTemplate oldTemplate={seenTemplate} />
    )
}


