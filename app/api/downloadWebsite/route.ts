import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import simpleGit from 'simple-git';
import { postMessageSchemaTemplateInfo, postMessageSchemaTemplateInfoType } from "@/types";

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        //get websiteCustomizations
        const templateInfoPostMessage = await request.json();
        postMessageSchemaTemplateInfo.parse(templateInfoPostMessage)

        //get github download url
        const githubUrl = searchParams.get("githubUrl");
        if (!githubUrl) throw new Error("GitHub URL is required");

        //clone github files to a temp folder
        const tempStagingId = uuidv4()
        const tempPath = path.join(process.cwd(), "stagingArea", tempStagingId);
        const git = simpleGit();
        await git.clone(githubUrl, tempPath);

        //editing necessary files with customer data
        await customizeProject(tempPath, templateInfoPostMessage);

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

    } catch (error) {
        throw new Error(`Error downloading repository: ${error}`);
    }
}

async function customizeProject(sourcePath: string, seenTemplateInfoPostMessage: postMessageSchemaTemplateInfoType) {
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = await fs.stat(sourceFilePath);

        if (stats.isDirectory()) {
            // Recursively clone directories
            await customizeProject(sourceFilePath, seenTemplateInfoPostMessage);

        } else if (file === "globalFormData.tsx") {
            // Replace globalFormData with client values
            await fs.writeFile(sourceFilePath, `
import { globalFormDataType } from "@/types";
export const globalFormData: globalFormDataType = ${JSON.stringify(seenTemplateInfoPostMessage.globalFormData, null, 2)}
`);

        } else if (file === "package.json") {
            // Customize package.json
            const packageJsonContent = await fs.readFile(sourceFilePath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);
            packageJson.name = seenTemplateInfoPostMessage.globalFormData.siteInfo.name;
            await fs.writeFile(sourceFilePath, JSON.stringify(packageJson, null, 2));
        }
    }
}
