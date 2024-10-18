import React from 'react'
import { auth } from '@/auth/auth'
import AddProject from '@/components/projects/addProject'

export default async function Page() {
    const session = await auth()
    if (session === null) return <p>Please Sign In</p> //redirect signin

    return (
        <AddProject />
    )
}
