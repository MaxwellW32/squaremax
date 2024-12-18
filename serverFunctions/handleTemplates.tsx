"use server"

import { auth } from "@/auth/auth"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { newTemplate, newTemplatesSchema, template, templatesSchema } from "@/types"
import { eq, like } from "drizzle-orm"

export async function getTemplates(seenLimit = 50, seenOffset = 0): Promise<template[]> {

    const results = await db.query.templates.findMany({
        limit: seenLimit,
        offset: seenOffset,
    });

    return results
}

export async function addTemplate(newTemplate: newTemplate) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    newTemplatesSchema.parse(newTemplate)

    await db.insert(templates).values(newTemplate)
}

export async function updateTemplate(seenTemplate: template) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    templatesSchema.parse(seenTemplate)

    await db.update(templates)

        .set({
            ...seenTemplate
        })
        .where(eq(templates.id, seenTemplate.id));
}

export async function deleteTemplate(templateIdObj: Pick<template, "id">) {
    const session = await auth()
    if (!session) throw new Error("not signed in")

    if (session.user.role !== "admin") throw new Error("not authorized")

    templatesSchema.pick({ id: true }).parse(templateIdObj)

    await db.delete(templates).where(eq(templates.id, templateIdObj.id));
}

export async function getTemplateById(templateIdObj: Pick<template, "id">): Promise<template | undefined> {
    templatesSchema.pick({ id: true }).parse(templateIdObj)

    const result = await db.query.templates.findFirst({
        where: eq(templates.id, templateIdObj.id)
    });

    return result
}

export async function getTemplatesByName(templateNameObj: Pick<template, "name">): Promise<template[]> {
    templatesSchema.pick({ name: true }).parse(templateNameObj)

    const result = await db.query.templates.findMany({
        where: like(templates.name, `%${templateNameObj.name}%`),
    });

    return result
}
