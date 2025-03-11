"use server"
import { githubContentData, githubRepo, githubTokenType, githubUser, newGithubRepoType, user, website, websiteSchema } from "@/types";
// import { githubContentData, githubRepo, githubUser, newGithubRepoType, website, websiteSchema, usedComponent, user } from "@/types";
import { Octokit } from "octokit";
import fs from "fs/promises";
import path from "path";
import { websiteBuildsStagingAreaDir } from "@/lib/websiteTemplateLib";

export async function getGithubRepos(token: githubTokenType["token"]): Promise<githubRepo[]> {
    // Make the raw fetch request to GitHub API using the provided access token
    // const response = await fetch('https://api.github.com/user/repos', {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Accept': 'application/vnd.github.v3+json',
    //     },
    // });
    // if (!response.ok) throw new Error("not seeing response")

    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.repos.listForAuthenticatedUser();

    const githubRepos: githubRepo[] = data as unknown as githubRepo[]
    return githubRepos
}

export async function getGithubUserFromToken(token: user["userGithubTokens"][number]["token"]): Promise<githubUser> {
    // const response = await fetch('https://api.github.com/user', {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Accept': 'application/vnd.github.v3+json',
    //     },
    // });

    // if (!response.ok) throw new Error("not seeing response")

    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.rest.users.getAuthenticated();

    const user: githubUser = data
    return user
}

export async function addGithubRepo(token: user["userGithubTokens"][number]["token"], newGithubRepo: newGithubRepoType) {
    const octokit = new Octokit({ auth: token });

    await octokit.rest.repos.createForAuthenticatedUser({
        ...newGithubRepo
    });
}

export async function pushToGithubRepo(
    token: githubTokenType,
    websiteId: website["id"],
    repoName: string
) {
    const octokit = new Octokit({ auth: token.token });

    // Validate inputs
    websiteSchema.shape.id.parse(websiteId);

    // Generate website files (path to the folder containing files)
    const websiteFilesDirPath = path.join(process.cwd(), websiteBuildsStagingAreaDir, websiteId)

    // Hold previous repo data
    const repoDataObj: { [key: string]: githubContentData | undefined } = {};

    // Add files to GitHub
    const addFolderToGithub = async (folderPath: string, relativePath: string) => {
        const files = await fs.readdir(folderPath);

        // Get previous data if exists
        try {
            const prevRepoData = await octokit.rest.repos.getContent({
                owner: token.username,
                repo: repoName,
                path: relativePath.replace(/\\/g, "/"),
            });

            if (Array.isArray(prevRepoData.data)) {
                prevRepoData.data.forEach((eachRepoData) => {
                    repoDataObj[eachRepoData.path.replace(/\\/g, "/")] = eachRepoData;
                });
            }
        } catch (error) {
            console.log(`Error in previous data check`, error);
        }

        async function checkOnFile(file: string) {
            const filePath = path.join(folderPath, file);
            const relativeFilePath = path.join(relativePath, file);
            const forwardRelativeFilePath = relativeFilePath.replace(/\\/g, "/"); // Use for GitHub
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await addFolderToGithub(filePath, relativeFilePath);

            } else {
                // Check for problematic paths
                if (!isValidPath(relativeFilePath)) {
                    console.warn(`Skipping invalid path: ${relativeFilePath}`);
                    return;
                }

                const fileData = await fs.readFile(filePath, { encoding: "base64" });

                const seenDataObj = repoDataObj[forwardRelativeFilePath];

                await octokit.rest.repos.createOrUpdateFileContents({
                    owner: token.username,
                    repo: repoName,
                    path: forwardRelativeFilePath,
                    sha: seenDataObj !== undefined ? seenDataObj.sha : undefined,
                    message: `Squaremaxtech ${new Date().toISOString()}`,
                    content: fileData,
                });

                console.log(`$added to github repo`, forwardRelativeFilePath);
            }
        }

        // Use looper to process files in batches
        await promiseLimiter(files, (file) => checkOnFile(file), 0, 50);
    }

    await addFolderToGithub(websiteFilesDirPath, "");
}

// Helper function to validate paths
function isValidPath(filePath: string): boolean {
    const invalidChars = /[\0<>:"|?*]/g;
    const reservedNames = [".git", "node_modules"];
    const segments = filePath.split(path.sep);

    return (
        !invalidChars.test(filePath) &&
        !segments.some((segment) => reservedNames.includes(segment))
    );
}

async function promiseLimiter<T>(
    mainArr: T[],
    asyncFunctionToRun: (eachItem: T) => Promise<unknown>,
    startingIndex: number,
    chunkSize: number
): Promise<unknown[]> {
    const arrChunk = mainArr.slice(startingIndex, startingIndex + chunkSize);

    let seenResolvedInfo = await Promise.all(
        arrChunk.map((eachItem) => asyncFunctionToRun(eachItem))
    );

    if (arrChunk.length < chunkSize) {
        // End of recursion
        return seenResolvedInfo;
    } else {
        // Continue recursion
        console.log(`$running again - current chunk`, arrChunk);

        const nextResults = await promiseLimiter(mainArr, asyncFunctionToRun, startingIndex + chunkSize, chunkSize);
        return [...seenResolvedInfo, ...nextResults];
    }
}

//my old code
// export async function pushToGithubRepo(token: user["userGithubTokens"][number], githubUrl: string, projectIdObj: Pick<project, "id">, projectsToTemplatesIdObj: Pick<projectsToTemplate, "id">, repoName: string) {
//     const octokit = new Octokit({ auth: token.token });

//     // Validate inputs
//     projectsSchema.pick({ id: true }).parse(projectIdObj);
//     projectsToTemplatesSchema.pick({ id: true }).parse(projectsToTemplatesIdObj);

//     // Generate website files (path to the folder containing files)
//     const websiteFilesDirPath = await createWebsiteFiles(githubUrl, { id: projectIdObj.id }, { id: projectsToTemplatesIdObj.id });

//     //hold prev repo data
//     const repoDataObj: { [key: string]: githubContentData | undefined } = {}

//     //add to github
//     await addFolderToGithub(websiteFilesDirPath, "");

//     //delete temp directory when finished
//     await fs.rm(websiteFilesDirPath, { force: true, recursive: true })

//     async function addFolderToGithub(folderPath: string, relativePath: string) {
//         const files = await fs.readdir(folderPath);

//         //get prev data if exists
//         try {
//             const prevRepoData = await octokit.rest.repos.getContent({
//                 owner: token.username,
//                 repo: repoName,
//                 path: relativePath.replace(/\\/g, '/'),
//             });

//             if (Array.isArray(prevRepoData.data)) {
//                 prevRepoData.data.forEach(eachRepoData => {
//                     repoDataObj[eachRepoData.path.replace(/\\/g, '/')] = eachRepoData
//                 })
//             }

//         } catch (error) {
//             console.log(`$error in prev data check`, error);
//         }

//         async function checkOnFile({ folderPath, file }: { folderPath: string, file: string }) {
//             const filePath = path.join(folderPath, file)
//             const relativeFilePath = path.join(relativePath, file)
//             const forwardRelativeFilePath = relativeFilePath.replace(/\\/g, '/'); //use for github
//             const stats = await fs.stat(filePath);

//             if (stats.isDirectory()) {
//                 await addFolderToGithub(filePath, relativeFilePath);

//             } else {
//                 // Check for problematic paths
//                 if (!isValidPath(relativeFilePath)) {
//                     console.warn(`Skipping invalid path: ${relativeFilePath}`);

//                     return
//                 }

//                 const fileData = await fs.readFile(filePath, { encoding: "base64" });

//                 const seenDataObj = repoDataObj[forwardRelativeFilePath]

//                 await octokit.rest.repos.createOrUpdateFileContents({
//                     owner: token.username,
//                     repo: repoName,
//                     path: forwardRelativeFilePath,
//                     sha: seenDataObj !== undefined ? seenDataObj.sha : undefined,
//                     message: `Squaremaxtech ${new Date().toISOString()}`,
//                     content: fileData,
//                 })
//             }
//         }

//         const seenItemsOnClient = await looper(files, checkOnFile, 0, 5)
//     };
// }

// // Helper function to validate paths
// function isValidPath(filePath: string): boolean {
//     // Example regex for invalid characters
//     const invalidChars = /[\0<>:"|?*]/g;
//     const reservedNames = ['.git', 'node_modules'];
//     const segments = filePath.split(path.sep);

//     return (
//         !invalidChars.test(filePath) &&
//         !segments.some((segment) => reservedNames.includes(segment))
//     );
// }

// export async function looper(mainArr: unknown[], asyncFunctionToRun: (eachItem: unknown) => Promise<unknown>, startingIndex: number, chunkSize: number) {
//     const arrChunk = mainArr.slice(startingIndex, startingIndex + chunkSize)

//     let seenResolvedInfo = await Promise.all(
//         arrChunk.map(async eachItem => {

//             //run the async function
//             return await asyncFunctionToRun(eachItem)
//         })
//     )

//     //if less elements than the chunk we hit the end, stop loop
//     if (arrChunk.length < chunkSize) {

//     } else {
//         //run again
//         seenResolvedInfo = [...seenResolvedInfo, ...(await looper(mainArr, asyncFunctionToRun, startingIndex + chunkSize, chunkSize))]
//     }

//     return seenResolvedInfo
// }
