import React from 'react'
import { auth } from '@/auth/auth'
import { getSpecificProject } from '@/serverFunctions/handleProjects'
import ViewProject from '@/components/projects/viewProject'

export default async function Page({ params }: { params: { projectId: string } }) {
    const session = await auth()
    if (session === null || session.user.role !== "admin") return <p>Not authorized to view project</p>

    const seenProject = await getSpecificProject({ id: params.projectId })
    if (seenProject === undefined) return <p>not seeing seenProject</p>

    return (
        <ViewProject seenProject={seenProject} />
    )
}


