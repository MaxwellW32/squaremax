import AddEditWebsiteComponent from '@/components/forWebsiteComponents/AddEditWebsiteComponent'
import { getSpecificUserComponent } from '@/serverFunctions/handleUserComponents'
import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth'
import DisplayNotSignedIn from '@/components/displayNotSignedIn/DisplayNotSignedIn';

export default async function Page({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return <DisplayNotSignedIn text='Plase sign in to edit components' />
    }

    const userComponent = await getSpecificUserComponent({ id: params.id })
    if (userComponent === undefined) return (<p>Component not found</p>)

    if (session.user.role !== "admin" && session.user.id !== userComponent.userId) {
        return <p>Not authorized to edit this users component</p>
    }

    return (
        <AddEditWebsiteComponent oldWebsiteComponent={userComponent} />
    )
}
