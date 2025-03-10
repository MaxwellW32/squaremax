import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import { requestDownloadWebsiteBodySchema, templateDataType, usedComponent } from "@/types";
import { auth } from "@/auth/auth";
import { ensureUserCanAccess } from "@/usefulFunctions/sessionCheck";
import { getSpecificWebsite } from "@/serverFunctions/handleWebsites";
import { websiteBuildsStagingAreaDir, websiteBuildsStarterDir } from "@/lib/websiteTemplateLib";
import { checkIfDirectoryExists, ensureDirectoryExists } from "@/utility/manageFiles";
import { getChildrenUsedComponents, getDescendedUsedComponents, getUsedComponentsImportName, getUsedComponentsImportString, getUsedComponentsInSameLocation, makeUsedComponentsImplementationString, makeValidPageName, sortUsedComponentsByOrder } from "@/utility/utility";

export async function POST(request: Request) {
    //ensure logged in
    const session = await auth()
    if (session === null) throw new Error("not authorised to download")

    //parse body
    const requestDownloadWebsiteBody = requestDownloadWebsiteBodySchema.parse(await request.json())

    //fetch website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": requestDownloadWebsiteBody.websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //security check - ensure authed to download site
    await ensureUserCanAccess(session, seenWebsite.userId)

    const baseFolderPath = path.join(process.cwd(), websiteBuildsStagingAreaDir, seenWebsite.id)

    //if baseFolder already exists delete it
    if (await checkIfDirectoryExists(baseFolderPath)) {
        await fs.rm(baseFolderPath, { force: true, recursive: true })
    }

    //make baseFolder
    await ensureDirectoryExists(baseFolderPath)

    //get the starter files
    const websiteBuildsStarterFolderPath = path.join(process.cwd(), websiteBuildsStarterDir)

    //copy the starter to my base path
    await fs.cp(websiteBuildsStarterFolderPath, baseFolderPath, { recursive: true })




    //edit the package.json
    const packageJsonFilePath = path.join(baseFolderPath, "package.json")

    const packageJsonContent = await fs.readFile(packageJsonFilePath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    // Remove invalid characters (allow only a-z, 0-9, hyphens, underscores)
    let sanitizedName = seenWebsite.name.replace(/[^a-z0-9-_]/g, '');
    // Convert to lowercase
    sanitizedName = sanitizedName.toLowerCase();
    // Ensure no leading or trailing hyphens/underscores
    sanitizedName = sanitizedName.replace(/^[-_]+|[-_]+$/g, '');

    packageJson.name = sanitizedName;

    await fs.writeFile(packageJsonFilePath, JSON.stringify(packageJson, null, 2));




    //create the app folder
    const appFolderPath = path.join(baseFolderPath, "app")
    await ensureDirectoryExists(appFolderPath)

    //make fav icon
    //make global.css
    const globalsCssFilePath = path.join(baseFolderPath, "globals.css")
    await fs.writeFile(globalsCssFilePath, seenWebsite.globalCss);

    //ensure website usedComponents seen
    if (seenWebsite.usedComponents === undefined) throw new Error("not seeing usedComponents")




    //make layout.tsx
    const layoutFilePath = path.join(baseFolderPath, "layout.tsx")

    //get base usedComponents in location header and footer
    const headerUsedComponents = getUsedComponentsInSameLocation({ type: "header" }, seenWebsite.usedComponents)
    const footerUsedComponents = getUsedComponentsInSameLocation({ type: "footer" }, seenWebsite.usedComponents)

    //order the components
    const headerUsedComponentsOrdered = sortUsedComponentsByOrder(headerUsedComponents)
    const footerUsedComponentsOrdered = sortUsedComponentsByOrder(footerUsedComponents)

    //then get all their descendants for proper import
    const headerAndFooterUsedComponents: usedComponent[] = [...headerUsedComponentsOrdered, ...footerUsedComponentsOrdered]
    const allDescendedUsedComponents: usedComponent[] = getDescendedUsedComponents(headerAndFooterUsedComponents.map(e => e.id), seenWebsite.usedComponents)
    const allUsedComponentsUsed: usedComponent[] = [...headerAndFooterUsedComponents, ...allDescendedUsedComponents]

    //get all the needed import statements
    const usedComponentsImportsText = getUsedComponentsImportString(allUsedComponentsUsed)

    //get usedComponents in this location
    const headerUsedComponentsText = makeUsedComponentsImplementationString(headerUsedComponentsOrdered, seenWebsite.usedComponents)
    const footerUsedComponentsText = makeUsedComponentsImplementationString(footerUsedComponentsOrdered, seenWebsite.usedComponents)

    const layoutTsxFileString =
        `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
${usedComponentsImportsText}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "new website",
  description: "new website description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        ${headerUsedComponentsText}

        {children}

        ${footerUsedComponentsText}
      </body>
    </html>
  );
}
`
    await fs.writeFile(layoutFilePath, layoutTsxFileString);




    //make pages
    if (seenWebsite.pages === undefined) throw new Error("not seeing pages")

    const combinedPageCssObj: { [key: string]: string } = {}

    await Promise.all(
        seenWebsite.pages.map(async eachPage => {
            if (seenWebsite.usedComponents === undefined) return

            //ensure page name is possible
            const validatedPageName = makeValidPageName(eachPage.name)

            //create the page folder
            const onHomePage = validatedPageName === "home"
            const pageFolderPath = onHomePage ? path.join(appFolderPath) : path.join(appFolderPath, validatedPageName)

            //make the page folder in the app directory
            await ensureDirectoryExists(pageFolderPath)

            //get base usedComponents on the page
            const usedComponentsOnPage = getUsedComponentsInSameLocation({ type: "page", pageId: eachPage.id }, seenWebsite.usedComponents)

            //order the components
            const usedComponentsOnPageOrdered = sortUsedComponentsByOrder(usedComponentsOnPage)

            //then get all their descendants for proper import
            const allDescendedUsedComponents: usedComponent[] = getDescendedUsedComponents(usedComponentsOnPageOrdered.map(e => e.id), seenWebsite.usedComponents)
            const allUsedComponentsUsed: usedComponent[] = [...usedComponentsOnPageOrdered, ...allDescendedUsedComponents]

            //get all the needed import statements
            const usedComponentsImportsText = getUsedComponentsImportString(allUsedComponentsUsed)

            //write the usedComponents on page css to combinedPageCssObj
            allUsedComponentsUsed.map(eachUsedComponent => {
                combinedPageCssObj[eachUsedComponent.id] = eachUsedComponent.css
            })

            //get usedComponents in this location
            const pageUsedComponentsText = makeUsedComponentsImplementationString(usedComponentsOnPageOrdered, seenWebsite.usedComponents)


            const pageTsxFileString = `${usedComponentsImportsText}

export default function ${onHomePage ? "Home" : "Page"}() {
  return (
    <>
        ${pageUsedComponentsText}
    </>
  );
}
`

            //page.tsx file path
            const pageFilePath = path.join(pageFolderPath, "page.tsx")

            //write to the actual file
            await fs.writeFile(pageFilePath, pageTsxFileString);
        })
    )




    //create the components folder

    //create the public folder

    const publicFolderPath = path.join(baseFolderPath, "public")
    await ensureDirectoryExists(publicFolderPath)

    //build website
    //
    //grab website, pages, and all used components...
    //make new entry in websiteBuildsStagingArea by website id..
    //copy down the websiteBuildsStarter folder...
    //start editing it...
    //files to update - package.json - give it website name...
    //files to create - layout.tsx..., page.tsx, each page folder - page.tsx combo
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
    await addFolderToZip(baseFolderPath, "");
    const archive = await zip.generateAsync({ type: "blob" });

    //send zipped file to client
    return new Response(archive);
}


