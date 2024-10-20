import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import simpleGit from 'simple-git';
import { syncFromTemplateSchema, syncFromTemplateType } from "@/types";

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        //get websiteCustomizations
        const templateGlobalFormData = await request.json();
        syncFromTemplateSchema.parse(templateGlobalFormData)

        //get github download url
        const githubUrl = searchParams.get("githubUrl");
        if (!githubUrl) throw new Error("GitHub URL is required");

        //clone github files to a temp folder
        const tempStagingId = uuidv4()
        const tempPath = path.join(process.cwd(), "stagingArea", tempStagingId);
        const git = simpleGit();
        await git.clone(githubUrl, tempPath);

        //editing necessary files with customer data
        await customizeProject(tempPath, templateGlobalFormData);

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

async function customizeProject(sourcePath: string, syncFromTemplate: syncFromTemplateType) {
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = await fs.stat(sourceFilePath);

        if (stats.isDirectory()) {
            // Recursively clone directories
            await customizeProject(sourceFilePath, syncFromTemplate);

        } else {
            //handling files

            if (file.includes(".tsx")) {
                // rewrite all client files to server files
                const fileContent = await fs.readFile(sourceFilePath, 'utf-8');

                // Split content into lines for processing
                const lines = fileContent.split('\n');

                // Flags to track what lines to remove
                let hasSeenReplaceDirective = false;

                // Process lines
                const processedLines = lines.filter((line, index) => {
                    // Check if the first line is "use client"
                    if (line.includes('use client') && index === 0) {
                        const nextLine = lines[index + 1]

                        // If the next line is `//replace`, skip the first line "use client"
                        if (nextLine.includes('//replace')) {
                            hasSeenReplaceDirective = true
                            return false;
                        }
                    }

                    //dont do anything if //replace is not there
                    if (!hasSeenReplaceDirective) return true

                    // If the next line is `//replace`, skip it
                    if (line.includes('//replace')) {
                        return false;
                    }

                    // Remove specific imports and useAtom assignment
                    if (line.includes('import { useAtom }') || line.includes('import { globalFormDataJotaiGlobal }') || line.includes('const [globalFormDataJotai,')) {
                        return false; // Remove these lines
                    }

                    return true; // Keep other lines
                });

                // Join the filtered lines back together
                let updatedFileContent = processedLines.join('\n');

                if (hasSeenReplaceDirective) {
                    // Replace all occurrences of `globalFormDataJotai` with `globalFormData`
                    updatedFileContent = updatedFileContent.replace(/globalFormDataJotai/g, 'globalFormData');

                    // Add the import statement for `globalFormData` at the top of the file
                    if (!updatedFileContent.includes("import { globalFormData }")) {
                        updatedFileContent = `import { globalFormData } from '@/globalFormData'\n${updatedFileContent}`;
                    }
                }

                // Now you can write the updated file back to the system or do further processing
                await fs.writeFile(sourceFilePath, updatedFileContent, 'utf-8');
            }

            if (file === "globalFormData.tsx") {
                // Replace globalFormData with client values
                await fs.writeFile(sourceFilePath, `
    import { globalFormDataType } from "@/types";
    export const globalFormData: globalFormDataType = ${JSON.stringify(syncFromTemplate, null, 2)}
    `);

            } else if (file === "package.json") {
                // Customize package.json
                const packageJsonContent = await fs.readFile(sourceFilePath, "utf-8");
                const packageJson = JSON.parse(packageJsonContent);
                packageJson.name = syncFromTemplate.siteInfo.name;
                await fs.writeFile(sourceFilePath, JSON.stringify(packageJson, null, 2));

            }
        }
    }
}
