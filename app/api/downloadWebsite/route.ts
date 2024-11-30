import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { createWebsiteFiles } from "@/serverFunctions/handleMakeWebsite";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    //get github download url
    const githubUrl = searchParams.get("githubUrl");
    const projectId = searchParams.get("projectId");
    const projectsToTemplatesId = searchParams.get("projectsToTemplatesId");

    if (githubUrl === null || projectId === null || projectsToTemplatesId === null) throw new Error("options required");

    const tempPath = await createWebsiteFiles(githubUrl, { id: projectId }, { id: projectsToTemplatesId })

    //zip the folder
    const zip = new JSZip();
    // Function to recursively add files and directories to the zip object
    const addFolderToZip = async (folderPath: string, relativePath: string) => {
        const files = await fs.readdir(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const relativeFilePath = path.join(relativePath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await addFolderToZip(filePath, relativeFilePath); // Recursively add subdirectories

            } else {
                const fileData = await fs.readFile(filePath);
                zip.file(relativeFilePath, fileData); // Add file to zip
            }
        }
    };

    // Add the entire temp folder to the zip object
    await addFolderToZip(tempPath, "");
    const archive = await zip.generateAsync({ type: "blob" });

    //delete temp directory when finished
    await fs.rm(tempPath, { force: true, recursive: true })

    //send zipped file to client
    return new Response(archive);
}


