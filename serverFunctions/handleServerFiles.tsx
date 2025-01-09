"use server"
import fs from "fs/promises"
import path from "path";

export async function checkIfFileExists(filePath: string) {
    const fullFilePath = path.join(process.cwd(), filePath)

    try {
        await fs.access(fullFilePath, fs.constants.F_OK);
        return true;

    } catch (error) {
        //@ts-ignore
        if (error.code === 'ENOENT') {
            return false;

        } else {
            throw error;
        }
    }
}

// export async function getStarterComponentCss(componentId: component["id"]): Promise<string> {
//     const filePath = path.join("userWebsiteComponents", componentId, "page.css")

//     const fileExists = await checkIfFileExists(filePath)
//     if (!fileExists) return ""

//     const fileContents = await fs.readFile(filePath, { encoding: "utf-8" })
//     return fileContents
// }

export async function deleteDirectory(filePath: string) {
    console.log(`$called to delete`, filePath);
    const fullPath = path.join(process.cwd(), filePath)
    await fs.rm(fullPath, { force: true, recursive: true })
}

