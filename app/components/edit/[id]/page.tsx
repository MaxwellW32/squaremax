import { auth } from "@/auth/auth"
import AddEditWebsiteComponent from "@/components/editWebsiteComponents/AddEditWebsiteComponent"
import { getSpecificComponent } from "@/serverFunctions/handleComponents"

export default async function Page({ params }: { params: { id: string } }) {
    const session = await auth()

    if (session === null) return null

    if (session.user.role !== "admin") return null

    //get website component
    const seenComponent = await getSpecificComponent({ id: params.id })
    if (seenComponent === undefined) return <p>not seeing component</p>

    return (
        <AddEditWebsiteComponent oldWebsiteComponent={seenComponent} />
    )
}
