import { getTemplateById } from "@/serverFunctions/handleTemplates"

export default async function Page({ params }: { params: { templateId: string } }) {
    const seenTemplate = await getTemplateById({ id: params.templateId })
    if (seenTemplate === undefined) return <p>not seeing template</p>

    return (
        <iframe src={seenTemplate.url} />
    )
}


