import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { requestDownloadWebsiteBodySchema } from "@/types";
import { auth } from "@/auth/auth";
import { ensureUserCanAccess } from "@/usefulFunctions/sessionCheck";
import { getSpecificWebsite } from "@/serverFunctions/handleWebsites";
import { websiteBuildsStagingAreaDir } from "@/lib/websiteTemplateLib";

export async function GET(request: Request) {
    //ensure logged in
    const session = await auth()
    if (session === null) throw new Error("not authorised to download")

    //parse body
    const requestDownloadWebsiteBody = requestDownloadWebsiteBodySchema.parse(request.body)

    //fetch website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": requestDownloadWebsiteBody.websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //security check - ensure authed to download site
    await ensureUserCanAccess(session, seenWebsite.userId)

    const basePath = path.join(process.cwd(), websiteBuildsStagingAreaDir, seenWebsite.id)

    //build website
    //
    //grab website, pages, and all used components...
    //make new entry in websiteBuildsStagingArea by website id
    //copy down the websiteBuildsStarter folder
    //start editing it
    //files to loop over - package.json - give it website name
    //files to create - layout.tsx, page.tsx, each page folder - page.tsx combo
    //
    //layout.tsx
    //get the layout file working
    //  fonts - font array - import name, variable name, local variable name in next js
    //  use same usedComponentBuildProcess to write the header and footer usedComponents
    //  
    //loop over the pages and build those files - folder name/page.tsx
    //in each of those page.tsx files write the used components
    //  ensure used components on page ordered 
    //  import the appropriate template 
    //  put the appropiate string on screen
    //  handle recursion
    //gather all the templates used and copy them from the main website to the components folder
    //write the global css file with each scoped css declaration under the global css plain
    //
    //
    //zip all of these files
    //download it
    //replace the original download folder if peeps downloding again































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
    await addFolderToZip(basePath, "");
    const archive = await zip.generateAsync({ type: "blob" });

    //delete temp directory when finished
    // await fs.rm(tempPath, { force: true, recursive: true })

    //send zipped file to client
    return new Response(archive);
}


