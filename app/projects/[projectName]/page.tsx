import React from 'react'
import { auth } from '@/auth/auth'
import { getProjectsFromUser } from '@/serverFunctions/handleProjects'
import ViewProject from '@/components/projects/viewProject'

export default async function Page({ params }: { params: { projectName: string } }) {
    const session = await auth()
    if (session === null) return <p>Not authorized to view project</p>

    const seenProjectName = decodeURIComponent(params.projectName);

    const userProjects = await getProjectsFromUser()
    const seenProject = userProjects.find(eachProject => eachProject.name === seenProjectName)

    if (seenProject === undefined) return <p>not seeing seenProject</p>

    return (
        <ViewProject seenProject={seenProject} />
    )
}


