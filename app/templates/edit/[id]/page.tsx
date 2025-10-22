import AddEditTemplate from "@/components/templates/editTemplates/AddEditTemplate"
import { getSpecificTemplate } from "@/serverFunctions/handleTemplates"
import { sessionCheckWithError } from "@/useful/sessionCheck"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") return null

    //get website template
    const seenTemplate = await getSpecificTemplate({ id: id })
    if (seenTemplate === undefined) return <p>not seeing template</p>

    return (
        <AddEditTemplate oldTemplate={seenTemplate} />
    )
}