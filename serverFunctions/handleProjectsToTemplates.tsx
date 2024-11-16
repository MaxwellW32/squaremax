"use server"
import { db } from "@/db"
import { projectsToTemplates } from "@/db/schema"
import { project, projectsSchema, projectsToTemplate, projectsToTemplatesSchema, template, templatesSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"

export async function addTemplateToProject(projectObj: Pick<project, "id">, templateObj: Pick<template, "id">) {
    await sessionCheckWithError()

    projectsSchema.pick({ id: true }).parse(projectObj)
    templatesSchema.pick({ id: true }).parse(templateObj)

    await db.insert(projectsToTemplates).values({
        projectId: projectObj.id,
        templateId: templateObj.id
    })
}

export async function updateProjectsToTemplates(projectsToTemplatesObj: Partial<projectsToTemplate>) {
    await sessionCheckWithError()

    if (projectsToTemplatesObj.id === undefined) throw new Error("need to provide id")

    projectsToTemplatesSchema.partial().parse(projectsToTemplatesObj)

    await db.update(projectsToTemplates)
        .set({
            ...projectsToTemplatesObj
        })
        .where(eq(projectsToTemplates.id, projectsToTemplatesObj.id));
}

export async function deleteTemplateFromProject(projectsToTemplatesIdObj: Pick<projectsToTemplate, "id">) {
    await sessionCheckWithError()

    projectsToTemplatesSchema.pick({ id: true }).parse(projectsToTemplatesIdObj)

    await db.delete(projectsToTemplates).where(eq(projectsToTemplates.id, projectsToTemplatesIdObj.id));
}