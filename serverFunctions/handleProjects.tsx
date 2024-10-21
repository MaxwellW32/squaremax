"use server"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import { projects } from "@/db/schema"
import { newProject, newProjectsSchema, project, projectsSchema } from "@/types"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { v4 as uuidV4 } from "uuid"

// export async function getTemplates(seenLimit = 50, seenOffset = 0): Promise<template[]> {

//     const results = await db.query.templates.findMany({
//         limit: seenLimit,
//         offset: seenOffset,
//     });

//     return results
// }

export async function addProject(seenProject: newProject) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    newProjectsSchema.parse(seenProject)

    const fullProject: project = {
        ...seenProject,
        id: uuidV4(),
        userId: session.user.id,
        templateId: null,
        templateData: null
    }

    projectsSchema.parse(fullProject)

    await db.insert(projects).values(fullProject)
}

export async function updateProject(projectObj: Partial<project>) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    if (projectObj.id === undefined) throw new Error("need to provide id")

    projectsSchema.partial().parse(projectObj)

    await db.update(projects)
        .set({
            ...projectObj
        })
        .where(eq(projects.id, projectObj.id));
}

export async function refreshProjectPath(name: Pick<project, "name">) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    projectsSchema.pick({ name: true }).parse(name)

    revalidatePath(`/projects/${name.name}`)
}


// export async function deleteTemplate(templateIdObj: Pick<template, "id">) {
//     const session = await auth()
//     if (!session) throw new Error("not signed in")

//     if (session.user.role !== "admin") throw new Error("not authorized")

//     templatesSchema.pick({ id: true }).parse(templateIdObj)

//     await db.delete(templates).where(eq(templates.id, templateIdObj.id));
// }

export async function getSpecificProject(projectObj: { option: "id", data: Pick<project, "id"> } | { option: "name", data: Pick<project, "name"> }): Promise<project | undefined> {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    if (projectObj.option === "id") {
        projectsSchema.pick({ id: true }).parse(projectObj.data)

        const result = await db.query.projects.findFirst({
            where: eq(projects.id, projectObj.data.id),
            with: {
                template: true,
            }
        });

        return result

    } else if (projectObj.option === "name") {
        projectsSchema.pick({ name: true }).parse(projectObj.data)

        const result = await db.query.projects.findFirst({
            where: and(eq(projects.name, projectObj.data.name), eq(projects.userId, session.user.id)),
            with: {
                template: true,
            }
        });

        return result
    }
}

export async function getProjectsFromUser(): Promise<project[]> {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    const results = await db.query.projects.findMany({
        where: eq(projects.userId, session.user.id)
    })

    return results
}
