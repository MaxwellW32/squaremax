import React from 'react'
import { getSpecificWebsite } from '@/serverFunctions/handleWebsites'
import { ensureUserCanAccessWebsite } from '@/useful/sessionCheck'
import ViewWebsite from '@/components/websites/ViewWebsite'

export default async function Page({ params }: { params: { websiteId: string } }) {
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: params.websiteId } })
    if (seenWebsite === undefined) return <p>not seeing seenWebsite</p>

    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers)

    return (
        <ViewWebsite websiteFromServer={seenWebsite} />
    )
}


