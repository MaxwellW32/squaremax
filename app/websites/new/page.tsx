import React from 'react'
import { auth } from '@/auth/auth'
import AddEditWebsite from '@/components/websites/AddEditWebsite'

export default async function Page() {
    const session = await auth()
    if (session === null) return <p>Please Sign In</p> //redirect signin

    return (
        <AddEditWebsite />
    )
}
