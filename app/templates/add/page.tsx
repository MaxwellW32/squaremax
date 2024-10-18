import React from 'react'
import { auth } from '@/auth/auth'
import AddTemplate from '@/components/templates/addTemplate'

export default async function Page() {
    const session = await auth()
    if (session === null || session.user.role !== "admin") return <p>Not authorized to add template</p>

    return (
        <AddTemplate />
    )
}
