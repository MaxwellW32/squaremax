import React from 'react'
import { auth } from '@/auth/auth'
import { getSpecificWebsite } from '@/serverFunctions/handleWebsites'
import ViewWebsite from '@/components/websites/viewWebsite'

export default async function Page({ params }: { params: { websiteId: string } }) {
    const session = await auth()
    if (session === null) return <p>Not authorised to view website</p>

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: params.websiteId } })
    if (seenWebsite === undefined) return <p>not seeing seenWebsite</p>

    if (seenWebsite.userId !== session.user.id) return <p>not authorised to view this website</p>

    return (
        <ViewWebsite websiteFromServer={seenWebsite} />
    )
}


