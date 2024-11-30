import { globalFormDataSchema, globalFormDataType, project, projectsSchema, projectsToTemplate, projectsToTemplatesSchema } from "@/types";
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck";
import { v4 as uuidv4 } from 'uuid';
import { getSpecificProject } from "./handleProjects";
import path from "path";
import { ensureDirectoryExists } from "@/usefulFunctions/fileManagement";
import simpleGit from "simple-git";
import fs from "fs/promises";
import { uploadedUserImagesStarterUrl, userUploadedImagesDirectory } from "@/types/userUploadedTypes";

export async function createWebsiteFiles(githubUrl: string, projectIdObj: Pick<project, "id">, projectsToTemplatesIdObj: Pick<projectsToTemplate, "id">) {
    const session = await sessionCheckWithError()

    projectsSchema.pick({ id: true }).parse(projectIdObj)
    projectsToTemplatesSchema.pick({ id: true }).parse(projectsToTemplatesIdObj)

    //authenticate and get latest project
    const seenProject = await getSpecificProject({ option: "id", data: { id: projectIdObj.id }, })
    if (seenProject === undefined) throw new Error("not seeing project")

    //ensure user has rights to download - also add on authusers list in future
    if (session.user.id !== seenProject.userId) throw new Error("not authorized to download website")

    //retrieve latest globalFormData
    if (seenProject.projectsToTemplates === undefined || seenProject.projectsToTemplates.length === 0) throw new Error("no project templates seen")
    const wantedProjectsToTemplate = seenProject.projectsToTemplates.find(eachpro => eachpro.id === projectsToTemplatesIdObj.id)
    if (wantedProjectsToTemplate === undefined) throw new Error("didn't see wanted template")
    if (wantedProjectsToTemplate.globalFormData === null) throw new Error("no globalFormData to download")

    //get websiteCustomizations
    const templateGlobalFormData: globalFormDataType = wantedProjectsToTemplate.globalFormData
    globalFormDataSchema.parse(templateGlobalFormData)

    // clone github files to a temp folder
    const tempStagingId = uuidv4()

    const tempPath = path.join(process.cwd(), "tempGithubStagingArea", tempStagingId);
    await ensureDirectoryExists(tempPath)

    const git = simpleGit();
    await git.clone(githubUrl, tempPath);

    await customizeProject(tempPath, templateGlobalFormData, seenProject);

    return tempPath
}

async function customizeProject(sourcePath: string, templateGlobalFormData: globalFormDataType, seenProject: project, topLevelPath?: string) {
    const files = await fs.readdir(sourcePath);

    //assign topLevelPath once
    if (topLevelPath === undefined) {
        topLevelPath = sourcePath
    }

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = await fs.stat(sourceFilePath);

        if (stats.isDirectory()) {
            // Recursively clone directories
            await customizeProject(sourceFilePath, templateGlobalFormData, seenProject, topLevelPath);

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
                //part 1 - insert new globalFormData
                const fileContent = await fs.readFile(sourceFilePath, 'utf-8');

                const newGlobalFormData = `export const globalFormData: globalFormDataType = ${JSON.stringify(templateGlobalFormData, null, 2)};`;

                const { formDataStartedIndex, formDataEndedIndex } = getFormDataIndexes(fileContent)

                const lines = fileContent.split('\n');

                //insert newGlobalFormData in the correct place
                lines.splice(formDataStartedIndex, formDataEndedIndex - formDataStartedIndex, newGlobalFormData)
                const updatedContent = lines.join("\n") //use thos going forward





                //part 2 - validate local images
                if (topLevelPath === undefined) throw new Error("not seeing topLevelPath")
                const localImageDir = path.join(topLevelPath, "public", "localImages")
                const localImageFiles = await fs.readdir(localImageDir);

                type imageFileInclusion = { [key: string]: boolean }
                const imageFileInclusionObj: imageFileInclusion = {}

                //set the imageInclusionObj 
                localImageFiles.forEach(eachImageFile => {
                    imageFileInclusionObj[eachImageFile] = false
                })

                //get latest formDataRange
                const { formDataStartedIndex: updatedFormDataStartedIndex, formDataEndedIndex: updatedFormDataEndedIndex } = getFormDataIndexes(updatedContent)
                const updatedContentLines = updatedContent.split("\n")

                //within range ensure the default image files are used
                for (let index = updatedFormDataStartedIndex; index < updatedFormDataEndedIndex; index++) {
                    const eachLine = updatedContentLines[index];

                    //update imageInclusionObj if in use 
                    Object.keys(imageFileInclusionObj).forEach(eachImageFileKey => {
                        if (eachLine.includes(`/localImages/${eachImageFileKey}`)) {
                            imageFileInclusionObj[eachImageFileKey] = true
                        }
                    })
                }





                //part 3 - download my server image
                if (seenProject.userUploadedImages !== null) {
                    //within range replace server image urls with local imports
                    for (let index = updatedFormDataStartedIndex; index < updatedFormDataEndedIndex; index++) {
                        //replace server image urls with local imports of the same name
                        for (let smallIndex = 0; smallIndex < seenProject.userUploadedImages.length; smallIndex++) {
                            const eachUserUploadedImage = seenProject.userUploadedImages[smallIndex]

                            updatedContentLines[index] = updatedContentLines[index].replace(`${uploadedUserImagesStarterUrl}${eachUserUploadedImage}`, `/localImages/${eachUserUploadedImage}`)
                        }
                    }

                    //copy over all userUploadedImages files into the local directory
                    await Promise.all(
                        seenProject.userUploadedImages.map(async eachUserUploadedImage => {
                            const serverUserUploadedImagePath = path.join(userUploadedImagesDirectory, eachUserUploadedImage)
                            const localImageFilepath = path.join(localImageDir, eachUserUploadedImage)

                            //paste in localImageDir
                            await fs.copyFile(serverUserUploadedImagePath, localImageFilepath);

                            //show they completed with this return
                            return true
                        })
                    )
                }

                //hold the final version of the globalFormData.tsx file
                const finalContent = updatedContentLines.join("\n")

                // Write the updated content back to the file
                await fs.writeFile(sourceFilePath, finalContent, 'utf-8');

            } else if (file === "package.json") {
                // Remove invalid characters (allow only a-z, 0-9, hyphens, underscores)
                const makeValidPackageJsonName = (name: string) => {
                    //ensure no capitals or numbers
                    const initialString = name.toLowerCase().replace(/[^a-z0-9-_]/g, '')

                    //ensure no underscores/hypens
                    const finalString = initialString.replace(/^[-_]+|[-_]+$/g, '')
                    return finalString
                }

                const sanitizedName = makeValidPackageJsonName(templateGlobalFormData.linkedData.siteInfo.websiteName)

                // Customize package.json
                const packageJsonContent = await fs.readFile(sourceFilePath, "utf-8");
                const packageJson = JSON.parse(packageJsonContent);
                packageJson.name = sanitizedName;

                await fs.writeFile(sourceFilePath, JSON.stringify(packageJson, null, 2));
            }
        }
    }
}

function getFormDataIndexes(fileContent: string) {
    const formDataIndexes: { started: number | null; ended: number | null; } = { started: null, ended: null }

    // Split the content by lines
    const lines = fileContent.split('\n');

    let inFormDataZone = false
    let openingBracketCount = 0
    let closingBracketCount = 0

    //go over each line
    for (let index = 0; index < lines.length; index++) {
        const eachLine = lines[index];

        if (eachLine.includes("export const globalFormData: globalFormDataType = {")) {
            inFormDataZone = true

            //set start point
            formDataIndexes.started = index
        }

        //update bracket counts
        const { leftCount, rightCount } = countBrackets(eachLine)
        openingBracketCount += leftCount
        closingBracketCount += rightCount

        //set inFormDataZone to false
        if (openingBracketCount === closingBracketCount && inFormDataZone) {
            inFormDataZone = false

            //set end point - increments to include the last closing bracket
            formDataIndexes.ended = index + 1
            break;
        }
    }

    if (formDataIndexes.started === null || formDataIndexes.ended === null) throw new Error("not seeing formDataStart End indexes")

    return { formDataStartedIndex: formDataIndexes.started, formDataEndedIndex: formDataIndexes.ended }
}

function countBrackets(line: string) {
    let leftCount = 0;
    let rightCount = 0;

    let inQuotes1 = false;
    let inQuotes2 = false;
    let inQuotes3 = false;

    // Iterate through each character in the line
    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Toggle the inQuotes flag if encountering a quote (handles single/double quotes)
        if (char === '"') {
            inQuotes1 = !inQuotes1;
        }
        if (char === "'") {
            inQuotes2 = !inQuotes2;
        }
        if (char === "`") {
            inQuotes3 = !inQuotes3;
        }

        // Count opening brackets when not inside quotes
        if (char === '{' && !inQuotes1 && !inQuotes2 && !inQuotes3) {
            leftCount++;
        }
        if (char === '}' && !inQuotes1 && !inQuotes2 && !inQuotes3) {
            rightCount++;
        }
    }

    return { leftCount, rightCount };
}

