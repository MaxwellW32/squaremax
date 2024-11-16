"use server"
import { db } from "@/db"
import { projects } from "@/db/schema"
import { newProject, newProjectsSchema, project, projectsSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// export async function getTemplates(seenLimit = 50, seenOffset = 0): Promise<template[]> {

//     const results = await db.query.templates.findMany({
//         limit: seenLimit,
//         offset: seenOffset,
//     });

//     return results
// }

export async function addProject(seenNewProject: newProject) {
    const session = await sessionCheckWithError()

    newProjectsSchema.parse(seenNewProject)

    const addedProject = await db.insert(projects).values({
        name: seenNewProject.name,
        userId: session.user.id
    }).returning()

    return addedProject[0].id
}

export async function updateProject(projectObj: Partial<project>) {
    await sessionCheckWithError()

    if (projectObj.id === undefined) throw new Error("need to provide id")

    projectsSchema.partial().parse(projectObj)

    await db.update(projects)
        .set({
            ...projectObj
        })
        .where(eq(projects.id, projectObj.id));
}

export async function refreshProjectPath(projectIdObj: Pick<project, "id">) {
    await sessionCheckWithError()

    projectsSchema.pick({ id: true }).parse(projectIdObj)

    revalidatePath(`/projects/${projectIdObj.id}`)
}


// export async function deleteTemplate(templateIdObj: Pick<template, "id">) {
//     const session = await auth()
//     if (!session) throw new Error("not signed in")

//     if (session.user.role !== "admin") throw new Error("not authorized")

//     templatesSchema.pick({ id: true }).parse(templateIdObj)

//     await db.delete(templates).where(eq(templates.id, templateIdObj.id));
// }

export async function getSpecificProject(projectObj: { option: "id", data: Pick<project, "id"> } | { option: "name", data: Pick<project, "name"> }): Promise<project | undefined> {
    if (projectObj.option === "id") {
        projectsSchema.pick({ id: true }).parse(projectObj.data)

        const result = await db.query.projects.findFirst({
            where: eq(projects.id, projectObj.data.id),
            with: {
                projectsToTemplates: {
                    with: {
                        template: true
                    }
                }
            }
        });

        return result

    } else if (projectObj.option === "name") {
        projectsSchema.pick({ name: true }).parse(projectObj.data)

        const session = await sessionCheckWithError()

        const result = await db.query.projects.findFirst({
            where: and(eq(projects.name, projectObj.data.name), eq(projects.userId, session.user.id)),
            with: {
                projectsToTemplates: {
                    with: {
                        template: true
                    }
                }
            }
        });

        return result
    }
}

export async function getProjectsFromUser(): Promise<project[]> {
    const session = await sessionCheckWithError()

    const results = await db.query.projects.findMany({
        where: eq(projects.userId, session.user.id)
    })

    return results
}
