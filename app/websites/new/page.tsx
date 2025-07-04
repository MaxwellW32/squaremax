import React from 'react'
import AddEditWebsite from '@/components/websites/AddEditWebsite'
import { sessionCheckWithError } from '@/useful/sessionCheck'

export default async function Page() {
    await sessionCheckWithError()

    return (
        <AddEditWebsite />
    )
}
