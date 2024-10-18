"use server"

import { auth } from "@/auth/auth"
import { db } from "@/db"
import { projects } from "@/db/schema"
import { newProject, newProjectsSchema, project, projectsSchema } from "@/types"
import { eq } from "drizzle-orm"
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
        templateId: null,
        userId: session.user.id,
    }

    projectsSchema.parse(fullProject)

    await db.insert(projects).values(fullProject)
}

// export async function updateTemplate(seenTemplate: template) {
//     const session = await auth()
//     if (!session) throw new Error("not signed in")

//     templatesSchema.parse(seenTemplate)

//     await db.update(templates)

//         .set({
//             ...seenTemplate
//         })
//         .where(eq(templates.id, seenTemplate.id));
// }

// export async function deleteTemplate(templateIdObj: Pick<template, "id">) {
//     const session = await auth()
//     if (!session) throw new Error("not signed in")

//     if (session.user.role !== "admin") throw new Error("not authorized")

//     templatesSchema.pick({ id: true }).parse(templateIdObj)

//     await db.delete(templates).where(eq(templates.id, templateIdObj.id));
// }

export async function getSpecificProject(projectIdObj: Pick<project, "id">): Promise<project | undefined> {
    projectsSchema.pick({ id: true }).parse(projectIdObj)

    const result = await db.query.projects.findFirst({
        where: eq(projects.id, projectIdObj.id)
    });

    return result
}
