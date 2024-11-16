"use server"
import { auth } from "@/auth/auth"
import { newProject, newTemplate } from "@/types"
import { addProject } from "./handleProjects"
import { addTemplate } from "./handleTemplates"

export async function addDefaultData(making: { project?: boolean, template?: boolean }) {
    const session = await auth()
    if (!session || session.user.role !== "admin") throw new Error("not authorized to make change")

    if (making.project) {
        const newProject: newProject = {
            name: `my fist project`,
        }

        await addProject(newProject)
    }

    if (making.template) {
        const newTemplate: newTemplate = {
            id: "aaaa",
            name: "first template",
            github: "https://github.com/MaxwellW32/aaaa.git",
            url: "https://squaremax-templates-aaaa.vercel.app"
        }

        await addTemplate(newTemplate)
    }
}