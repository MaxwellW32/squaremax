import React from 'react'
import { getSpecificWebsite } from '@/serverFunctions/handleWebsites'
import { ensureUserCanAccessWebsite } from '@/useful/sessionCheck'
import ViewWebsite from '@/components/websites/ViewWebsite'

export default async function Page({ params }: { params: Promise<{ websiteId: string }> }) {
    const { websiteId } = await params

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } })
    if (seenWebsite === undefined) return <p>not seeing seenWebsite</p>

    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers)

    return (
        <ViewWebsite websiteFromServer={seenWebsite} />
    )
}


