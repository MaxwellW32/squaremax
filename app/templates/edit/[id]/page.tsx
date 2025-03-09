import { auth } from "@/auth/auth"
import AddEditTemplate from "@/components/templates/editTemplates/AddEditTemplate"
import { getSpecificTemplate } from "@/serverFunctions/handleTemplates"

export default async function Page({ params }: { params: { id: string } }) {
    const session = await auth()

    if (session === null) return null

    if (session.user.role !== "admin") return null

    //get website template
    const seenTemplate = await getSpecificTemplate({ id: params.id })
    if (seenTemplate === undefined) return <p>not seeing template</p>

    return (
        <AddEditTemplate oldTemplate={seenTemplate} />
    )
}
