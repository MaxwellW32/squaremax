import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import simpleGit from 'simple-git';

export async function GET(request: Request) {
    try {
        //get github download url
        const { searchParams } = new URL(request.url);
        const githubUrl = searchParams.get("githubUrl");
        if (!githubUrl) throw new Error("GitHub URL is required");

        //clone files to temp folder
        const tempStagingId = uuidv4()
        const tempPath = path.join(process.cwd(), "stagingArea", tempStagingId);
        const git = simpleGit();
        await git.clone(githubUrl, tempPath);

        //editing necessary files with customer data
        await customizeProject(tempPath, {
            projectName: "myBeautifulWebsiteA".toLowerCase(),
            customerSpecificDataObj: `
            import { globalFormDataType } from "@/types";

            export const globalFormData: globalFormDataType = {
                siteInfo: {
                    name: "testWebsite1",
                    title: "testWebsite1",
                    description: "this is a testWebsite1",
                    favIcon: ""
                },
                pages: {
                    home: {
                        sectionCont: {
                            using: true,
                            label: "Section Cont",
                            inputType: "checkbox",
                            value: "",
                        },
                        section1: {
                            value: "customized section1 baby"
                        },
                        section2: {
                            value: "section2"
                        },
                        section3: {
                            value: "section3"
                        },
                    },
                    about: {
                        section1: {
                            value: "about section1"
                        },
                        section2: {
                            value: "about section2"
                        },
                        section3: {
                            value: "about section3"
                        },
                    }
                },
                navLinks: [
                    {
                        title: "home",
                        link: "/",
                    },
                    {
                        title: "about",
                        link: "/about",
                    }
                ]
            }
            `,
        });

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

// Function to clone and customize the folder
async function customizeProject(sourcePath: string, customization: { projectName: string, customerSpecificDataObj: string }) {
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const stats = await fs.stat(sourceFilePath);

        if (stats.isDirectory()) {
            // Recursively clone directories
            await customizeProject(sourceFilePath, customization);

        } else if (file === ".env.local") {
            // Replace .env.local with dummy values
            const dummyEnvContent = `API_KEY=dummy\nDATABASE_URL=dummy`;
            await fs.writeFile(sourceFilePath, dummyEnvContent);

        } else if (file === "globalFormData.tsx") {
            // Replace globalFormData with client values
            await fs.writeFile(sourceFilePath, customization.customerSpecificDataObj);

        } else if (file === "package.json") {
            // Customize package.json
            const packageJsonContent = await fs.readFile(sourceFilePath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);
            packageJson.name = customization.projectName;
            await fs.writeFile(sourceFilePath, JSON.stringify(packageJson, null, 2));

        }
    }
}
