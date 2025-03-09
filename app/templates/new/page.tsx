import { auth } from '@/auth/auth'
import AddEditTemplate from '@/components/templates/editTemplates/AddEditTemplate'
import React from 'react'

export default async function Page() {
    //auth 
    const session = await auth()

    if (session === null) return null

    if (session.user.role !== "admin") return null

    return (
        <AddEditTemplate />
    )
}
