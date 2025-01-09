import { auth } from '@/auth/auth'
import AddEditWebsiteComponent from '@/components/forWebsiteComponents/AddEditWebsiteComponent'
import React from 'react'

export default async function Page() {
    //auth 
    const session = await auth()

    if (session === null) return null

    if (session.user.role !== "admin") return null

    return (
        <AddEditWebsiteComponent />
    )
}
