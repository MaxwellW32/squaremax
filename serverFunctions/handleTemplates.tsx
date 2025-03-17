"use server"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { collection, template, templatesSchema, newTemplate, newTemplateSchema, category, templateFilterOptionType, categoryNameSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { desc, eq, like } from "drizzle-orm"
import { deleteDirectory } from "./handleServerFiles"
import path from "path"
import { globalTemplatesFilePath, websiteTemplatesDir } from "@/lib/websiteTemplateLib"
import fs from "fs/promises"
import { replaceBaseFolderNameInPath } from "@/usefulFunctions/usefulFunctions"
import { deleteUsedComponent, getUsedComponents } from "./handleUsedComponents"

export async function getSpecificTemplate(templateIdObj: Pick<template, "id">): Promise<template | undefined> {
    templatesSchema.pick({ id: true }).parse(templateIdObj)

    const result = await db.query.templates.findFirst({
        where: eq(templates.id, templateIdObj.id),
        with: {
            category: true,
        }
    });

    return result
}

export async function getTemplatesByCategory(seenCategoryName: category["name"], filter: templateFilterOptionType, limit = 50, offset = 0): Promise<template[]> {
    //validation
    categoryNameSchema.parse(seenCategoryName)

    const results = await db.query.templates.findMany({
        where: eq(templates.categoryId, seenCategoryName),
        limit: limit,
        offset: offset,
        orderBy: filter === "popular" ? desc(templates.uses) : desc(templates.likes),
        with: {
            category: true,
        }
    });

    return results
}

export async function getTemplatesByFamily(seenFamilyName: string): Promise<template[]> {
    //validation
    // categoryNameSchema.parse(seenCategoryName)

    // const results = await db.query.templates.findMany({
    //     where: eq(templates.categoryId, seenCategoryName),
    //     orderBy: filter === "popular" ? desc(templates.uses) : desc(templates.likes),
    //     with: {
    //         category: true,
    //     }
    // });

    return []
}

export async function getTemplatesByName(seenName: string): Promise<template[]> {
    templatesSchema.shape.name.parse(seenName)

    const results = await db.query.templates.findMany({
        where: like(templates.name, `%${seenName}%`),
        with: {
            category: true,
        }
    });

    return results
}

export async function addTemplate(seenNewTemplate: newTemplate, collectionsArr: collection[]): Promise<template> {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website templates")

    const validatedNewTemplate = newTemplateSchema.parse(seenNewTemplate)

    const [addedTemplate] = await db.insert(templates).values(validatedNewTemplate).returning()

    collectionsArr = collectionsArr.map(eachCollection => {
        eachCollection.relativePath = replaceBaseFolderNameInPath(addedTemplate.id, eachCollection.relativePath)
        return eachCollection
    })

    //write Template files to directory
    await createTemplateFolder(addedTemplate.id, collectionsArr)

    //add entry to allow dynamic imports
    await addEntryToGlobalTemplatesFile(addedTemplate.id)

    return addedTemplate
}

export async function updateTemplate(templateObj: Partial<template>, collectionsArr: collection[]) {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website templates")

    if (templateObj.id === undefined) throw new Error("need to provide id")

    templatesSchema.partial().parse(templateObj)

    //update files
    if (collectionsArr.length > 0) {
        collectionsArr = collectionsArr.map(eachCollection => {
            if (templateObj.id === undefined) throw new Error("need to provide id in eachCollection")

            eachCollection.relativePath = replaceBaseFolderNameInPath(templateObj.id, eachCollection.relativePath)
            return eachCollection
        })

        //write template files to directory
        await createTemplateFolder(templateObj.id, collectionsArr)
    }

    await db.update(templates)
        .set(templateObj)
        .where(eq(templates.id, templateObj.id));
}

export async function deleteTemplate(templateId: template["id"]) {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("not authorised to delete template")

    templatesSchema.shape.id.parse(templateId)

    //delete all related usedComponents
    const seenUsedComponents = await getUsedComponents({ option: "template", data: { templateId: templateId } })
    await Promise.all(seenUsedComponents.map(async eachUsedComponent => {
        await deleteUsedComponent(eachUsedComponent.websiteId, eachUsedComponent.id)
    }))

    await db.delete(templates).where(eq(templates.id, templateId));
}

async function createTemplateFolder(seenTemplateId: template["id"], collection: collection[]) {
    //delete folder if existing already
    await deleteDirectory(path.join(websiteTemplatesDir, seenTemplateId))

    const basePath = path.join(process.cwd(), websiteTemplatesDir);

    //remake folder structure on server
    await Promise.all(
        collection.map(async eachCollection => {
            const filePath = path.join(basePath, eachCollection.relativePath);
            const folderPath = path.dirname(filePath);

            // Create the folder if it doesn't exist
            await fs.mkdir(folderPath, { recursive: true });
            console.log(`$made directory`, folderPath);

            // Write the file to the correct path
            await fs.writeFile(filePath, eachCollection.content);
            console.log(`wrote the file: ${filePath}`);
        })
    )
}

export async function addEntryToGlobalTemplatesFile(id: string) {//repalce with template when ready
    const basePath = path.join(process.cwd(), globalTemplatesFilePath);

    let fileContent = await fs.readFile(basePath, 'utf8');

    const markerIndex = fileContent.indexOf('}//<marker>');

    if (markerIndex === -1) {
        throw new Error("Marker not found in file")
    }

    // Find the index of the newline character before the marker
    let newlineIndex = fileContent.lastIndexOf('\n', markerIndex);

    // Append the string before the marker
    if (newlineIndex !== -1) {
        fileContent = fileContent.slice(0, newlineIndex) + '\n' + `"${id}": () => dynamic(() => import(\`@/websiteTemplates/\${id}/page.tsx\`), { ssr: false }),` + fileContent.slice(newlineIndex);
    }

    await fs.writeFile(basePath, fileContent);

    console.log('Record appended to dynamicTemplates successfully.');
}

export async function removeEntryFromGlobalTemplatesFile(id: string) {
    const basePath = path.join(process.cwd(), globalTemplatesFilePath);

    let fileContent = await fs.readFile(basePath, 'utf8');

    // Split the file content by lines
    const lines = fileContent.split('\n');

    // Find the index of the line that contains the ID
    const index = lines.findIndex(line => line.includes(`"${id}":`));

    if (index !== -1) {
        // Remove the line containing the ID
        lines.splice(index, 1);

        // Join the lines back into a single string
        fileContent = lines.join('\n');

        // Write the modified content back to the file
        await fs.writeFile(basePath, fileContent);

        console.log(`Line containing ID "${id}" removed from globalTemplates.tsx successfully.`);

    } else {
        console.log(`ID "${id}" not found in globalTemplate.tsx.`);
    }
}