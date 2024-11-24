import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import simpleGit from 'simple-git';
import { globalFormDataSchema, globalFormDataType } from "@/types";

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    //get websiteCustomizations
    const templateGlobalFormData: globalFormDataType = await request.json();
    globalFormDataSchema.parse(templateGlobalFormData)

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
}

async function customizeProject(sourcePath: string, templateGlobalFormData: globalFormDataType) {
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = await fs.stat(sourceFilePath);

        if (stats.isDirectory()) {
            // Recursively clone directories
            await customizeProject(sourceFilePath, templateGlobalFormData);

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
                const fileContent = await fs.readFile(sourceFilePath, 'utf-8');

                // Split the content by lines
                const lines = fileContent.split('\n');

                // Create the new object string to insert
                const newGlobalFormData = `export const globalFormData: globalFormDataType = ${JSON.stringify(templateGlobalFormData, null, 2)};`;

                let isInGlobalFormDataSection = false;
                const updatedLines = [];

                // Iterate over the lines and process them
                for (const line of lines) {
                    // Start capturing the section when encountering "<<globalFormDataStart>>"
                    if (line.includes("<<globalFormDataStart>>")) {
                        updatedLines.push(line); // Keep the start marker
                        isInGlobalFormDataSection = true; // Enter the section to replace
                        continue; // Skip to the next iteration
                    }

                    // End the replacement when encountering "<<globalFormDataEnd>>"
                    if (line.includes("<<globalFormDataEnd>>")) {
                        if (isInGlobalFormDataSection) {
                            updatedLines.push(newGlobalFormData); // Insert the new globalFormData object
                            isInGlobalFormDataSection = false; // Exit the section
                        }

                        updatedLines.push(line); // Keep the end marker

                        continue;
                    }

                    // If inside the section, don't add the line
                    if (isInGlobalFormDataSection) {
                        continue; // Skip this line as it's within the replacement section
                    }

                    // Add all other lines that are outside the replacement section
                    updatedLines.push(line);
                }

                // Join the updated lines back into a single string with new lines
                const updatedContent = updatedLines.join('\n');

                // Write the updated content back to the file
                await fs.writeFile(sourceFilePath, updatedContent, 'utf-8');

            } else if (file === "package.json") {
                // Remove invalid characters (allow only a-z, 0-9, hyphens, underscores)
                let sanitizedName = templateGlobalFormData.linkedData.siteInfo.websiteName.replace(/[^a-z0-9-_]/g, '');
                // Convert to lowercase
                sanitizedName = sanitizedName.toLowerCase();
                // Ensure no leading or trailing hyphens/underscores
                sanitizedName = sanitizedName.replace(/^[-_]+|[-_]+$/g, '');

                // Customize package.json
                const packageJsonContent = await fs.readFile(sourceFilePath, "utf-8");
                const packageJson = JSON.parse(packageJsonContent);
                packageJson.name = sanitizedName;

                await fs.writeFile(sourceFilePath, JSON.stringify(packageJson, null, 2));
            }
        }
    }
}
