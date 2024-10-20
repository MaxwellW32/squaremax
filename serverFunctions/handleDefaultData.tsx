"use server"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import { projects, templates } from "@/db/schema"
import { project, projectsSchema, template, templatesSchema } from "@/types"
import { v4 as uuidv4 } from "uuid"

export async function addDefaultData(making: { project?: boolean, template?: boolean }) {
    const session = await auth()
    if (!session || session.user.role !== "admin") throw new Error("not authorized to make change")

    if (making.project) {
        const newProject: project = {
            id: uuidv4(),
            name: `newProject${uuidv4()}`,
            templateData: null,
            templateId: null,
            userId: session.user.id
        }

        projectsSchema.parse(newProject)

        await db.insert(projects).values(newProject)
    }

    if (making.template) {
        const newTemplate: template = {
            id: "aaaa",
            name: `FirstRemplater`,
            github: "https://github.com/MaxwellW32/aaaa.git",
            url: "https://onedaywebsite-templates-aaaa.vercel.app"
        }

        templatesSchema.parse(newTemplate)

        await db.insert(templates).values(newTemplate)
    }
}