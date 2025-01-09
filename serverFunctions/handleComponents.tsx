"use server"
import { db } from "@/db"
import { components } from "@/db/schema"
import { collection, component, componentSchema, newComponent, newComponentSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq, like } from "drizzle-orm"
import { deleteDirectory } from "./handleServerFiles"
import path from "path"
import { globalComponentsFilePath, userWebsiteComponentsDir } from "@/lib/userWebsiteComponents"
import fs from "fs/promises"
import { replaceBaseFolderNameInPath } from "@/usefulFunctions/usefulFunctions"

export async function getSpecificComponent(componentIdObj: Pick<component, "id">): Promise<component | undefined> {
    componentSchema.pick({ id: true }).parse(componentIdObj)

    const result = await db.query.components.findFirst({
        where: eq(components.id, componentIdObj.id),
        with: {
            category: true,
        }
    });

    return result
}

export async function getComponents(selectionObj: { option: "name", data: Pick<component, "name"> } | { option: "categoryId", data: Pick<component, "categoryId"> }): Promise<component[]> {
    if (selectionObj.option === "name") {
        componentSchema.pick({ name: true }).parse(selectionObj.data)

        const result = await db.query.components.findMany({
            where: like(components.name, `%${selectionObj.data}%`),
        });

        return result

    } else if (selectionObj.option === "categoryId") {
        componentSchema.pick({ categoryId: true }).parse(selectionObj.data)

        const result = await db.query.components.findMany({
            where: eq(components.categoryId, selectionObj.data.categoryId),
        });

        return result

    } else {
        throw new Error("not seeing selectionObj")
    }
}

export async function addComponent(seenNewComponent: newComponent, collectionsArr: collection[]): Promise<component> {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website components")

    newComponentSchema.parse(seenNewComponent)

    const [addedComponent] = await db.insert(components).values(seenNewComponent).returning()

    collectionsArr = collectionsArr.map(eachCollection => {
        eachCollection.relativePath = replaceBaseFolderNameInPath(addedComponent.id, eachCollection.relativePath)
        return eachCollection
    })

    //write component files to directory
    await createComponentFolder(addedComponent.id, collectionsArr)

    //add entry to allow dynamic imports
    await addEntryToGlobalComponentsFile(addedComponent.id)

    return addedComponent
}

export async function updateComponent(componentObj: Partial<component>, collectionsArr: collection[]) {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website components")

    if (componentObj.id === undefined) throw new Error("need to provide id")

    componentSchema.partial().parse(componentObj)

    //update files
    if (collectionsArr.length > 0) {
        collectionsArr = collectionsArr.map(eachCollection => {
            if (componentObj.id === undefined) throw new Error("need to provide id in eachCollection")

            eachCollection.relativePath = replaceBaseFolderNameInPath(componentObj.id, eachCollection.relativePath)
            return eachCollection
        })

        //write component files to directory
        await createComponentFolder(componentObj.id, collectionsArr)
    }

    await db.update(components)
        .set(componentObj)
        .where(eq(components.id, componentObj.id));
}

export async function deleteComponent(componentIdObj: Pick<component, "id">) {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("not authorized to delete component")

    componentSchema.pick({ id: true }).parse(componentIdObj)

    await db.delete(components).where(eq(components.id, componentIdObj.id));
}

async function createComponentFolder(seenComponentId: component["id"], collection: collection[]) {
    //delete folder if existing already
    await deleteDirectory(path.join(userWebsiteComponentsDir, seenComponentId))

    const basePath = path.join(process.cwd(), userWebsiteComponentsDir);

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

export async function addEntryToGlobalComponentsFile(id: string) {//repalce with component when ready
    const basePath = path.join(process.cwd(), globalComponentsFilePath);

    let fileContent = await fs.readFile(basePath, 'utf8');

    const markerIndex = fileContent.indexOf('}//<marker>');

    if (markerIndex === -1) {
        throw new Error("Marker not found in file")
    }

    // Find the index of the newline character before the marker
    let newlineIndex = fileContent.lastIndexOf('\n', markerIndex);

    // Append the string before the marker
    if (newlineIndex !== -1) {
        fileContent = fileContent.slice(0, newlineIndex) + '\n' + `"${id}": () => dynamic(() => import(\`@/userWebsiteComponents/\${id}/page.tsx\`), { ssr: false }),` + fileContent.slice(newlineIndex);
    }

    await fs.writeFile(basePath, fileContent);

    console.log('Record appended to dynamicComponents successfully.');
}

export async function removeEntryFromGlobalComponentsFile(id: string) {
    const basePath = path.join(process.cwd(), globalComponentsFilePath);

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

        console.log(`Line containing ID "${id}" removed from globalComponents.tsx successfully.`);

    } else {
        console.log(`ID "${id}" not found in globalComponents.tsx.`);
    }
}