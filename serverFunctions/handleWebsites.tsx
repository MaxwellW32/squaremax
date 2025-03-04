"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { component, newPage, newPageSchema, newWebsite, newWebsiteSchema, page, pageComponent, pageComponentSchema, pageSchema, updatePageSchema, updateWebsite, updateWebsiteSchema, website, websiteSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { moveItemInArray } from "@/utility/utility"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { v4 as uuidV4 } from "uuid"

export async function addWebsite(seenNewWebsite: newWebsite): Promise<website> {
    const session = await sessionCheckWithError()

    newWebsiteSchema.parse(seenNewWebsite)

    const addedWebsite = await db.insert(websites).values({
        ...seenNewWebsite,
        userId: session.user.id
    }).returning()

    return addedWebsite[0]
}

export async function updateTheWebsite(websiteId: website["id"], websiteObj: Partial<updateWebsite>) {
    await sessionCheckWithError()

    const validatedNewWebsite = updateWebsiteSchema.partial().parse(websiteObj)
    if (websiteId === undefined) throw new Error("need id")

    await db.update(websites)
        .set({
            ...validatedNewWebsite
        })
        .where(eq(websites.id, websiteId));
}

export async function refreshWebsitePath(websiteIdObj: Pick<website, "id">) {
    await sessionCheckWithError()

    websiteSchema.pick({ id: true }).parse(websiteIdObj)

    revalidatePath(`/websites/${websiteIdObj.id}`)
}

export async function deleteWebsite(websiteObj: Pick<website, "id">) {
    const session = await sessionCheckWithError()

    websiteSchema.pick({ id: true }).parse(websiteObj)

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteObj.id } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    if (session.user.id !== seenWebsite.userId && session.user.role !== "admin") throw new Error("not authorized")

    await db.delete(websites).where(eq(websites.id, websiteObj.id));
}

export async function getSpecificWebsite(websiteObj: { option: "id", data: Pick<website, "id"> } | { option: "name", data: Pick<website, "name"> }): Promise<website | undefined> {
    if (websiteObj.option === "id") {
        websiteSchema.pick({ id: true }).parse(websiteObj.data)

        const result = await db.query.websites.findFirst({
            where: eq(websites.id, websiteObj.data.id)
        });

        return result

    } else if (websiteObj.option === "name") {
        websiteSchema.pick({ name: true }).parse(websiteObj.data)

        const result = await db.query.websites.findFirst({
            where: eq(websites.name, websiteObj.data.name)
        });

        return result
    }
}

export async function getWebsitesFromUser(): Promise<website[]> {
    const session = await sessionCheckWithError()

    const results = await db.query.websites.findMany({
        where: eq(websites.userId, session.user.id)
    })

    return results
}



//website pages
export async function addWebsitePage(websiteId: website["id"], newPageObj: newPage) {
    await sessionCheckWithError()
    if (websiteId === undefined) throw new Error("need id")

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    const validatedNewPage = newPageSchema.parse(newPageObj)

    const fullNewPage: page = {
        ...validatedNewPage,
        pageComponents: [],
    }

    pageSchema.parse(fullNewPage)

    //add new page at unique id
    seenWebsite.pages[uuidV4()] = fullNewPage

    await db.update(websites)
        .set({
            pages: seenWebsite.pages
        })
        .where(eq(websites.id, websiteId));
}
export async function updateWebsitePage(websiteId: website["id"], pageId: string, pageObj: Partial<page>) {
    await sessionCheckWithError()

    //get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //limits what can be updated by a client
    const validatedPageObj = updatePageSchema.partial().parse(pageObj)

    //update specific page
    seenWebsite.pages = Object.fromEntries(Object.entries(seenWebsite.pages).map(eachPageEntry => {
        const eachPageKey = eachPageEntry[0]
        let eachPageValue = eachPageEntry[1]

        if (eachPageKey === pageId) {
            eachPageValue = { ...eachPageValue, ...validatedPageObj }
        }

        return [eachPageKey, eachPageValue]
    }))

    await db.update(websites)
        .set({
            pages: seenWebsite.pages
        })
        .where(eq(websites.id, websiteId));
}
export async function deleteWebsitePage(websiteId: website["id"], pageId: string) {
    await sessionCheckWithError()

    //get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //update specific page
    delete seenWebsite.pages[pageId]

    await db.update(websites)
        .set({
            pages: seenWebsite.pages
        })
        .where(eq(websites.id, websiteId));
}

//website page components
export async function addWebsitePageComponent(websiteId: website["id"], pageId: string, componentObj: component, currentIndex: number, parentComponent?: pageComponent) {
    await sessionCheckWithError();

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    const newPageComponent: pageComponent = {
        id: uuidV4(),
        css: "",
        data: null,
        children: [],
        componentId: componentObj.id,
    };

    pageComponentSchema.parse(newPageComponent);

    // Recursive function to find the parent and add the component to its children
    function addToParent(components: pageComponent[]): pageComponent[] {
        return components.map(component => {
            if (component.id === parentComponent?.id) {
                return {
                    ...component,
                    children: [
                        ...component.children.slice(0, currentIndex),
                        newPageComponent,
                        ...component.children.slice(currentIndex)
                    ]
                };
            }

            return {
                ...component,
                children: addToParent(component.children) // Recursively update children
            };
        });
    }

    if (parentComponent) {
        // Update the nested structure if a parent is specified
        seenWebsite.pages[pageId].pageComponents = addToParent(seenWebsite.pages[pageId].pageComponents);
    } else {
        // Insert normally at the root level
        seenWebsite.pages[pageId].pageComponents = [
            ...seenWebsite.pages[pageId].pageComponents.slice(0, currentIndex),
            newPageComponent,
            ...seenWebsite.pages[pageId].pageComponents.slice(currentIndex)
        ];
    }

    await db.update(websites)
        .set({ pages: seenWebsite.pages })
        .where(eq(websites.id, websiteId));
}
export async function updateWebsitePageComponent(websiteId: website["id"], pageId: string, pageComponentObj: Partial<pageComponent>) {
    await sessionCheckWithError();

    if (!pageComponentObj.id) throw new Error("Need page component ID");

    // Remove component info for database
    const { component, ...updateData } = pageComponentObj;

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    // Recursive function to update the component
    function updateComponent(seenPageComponents: pageComponent[]): pageComponent[] {
        return seenPageComponents.map(eachPageComponent => {
            if (eachPageComponent.id === pageComponentObj.id) {
                const updatedComponent = { ...eachPageComponent, ...updateData };

                // Validate the updated component
                pageComponentSchema.parse(updatedComponent);

                return updatedComponent;
            }

            return {
                ...eachPageComponent,
                children: updateComponent(eachPageComponent.children)
            };
        });
    }

    // Update the page components recursively
    seenWebsite.pages[pageId].pageComponents = updateComponent(seenWebsite.pages[pageId].pageComponents);

    // Update the database
    await db.update(websites)
        .set({ pages: seenWebsite.pages })
        .where(eq(websites.id, websiteId));
}
export async function changeWebsitePageComponentIndex(websiteId: website["id"], pageId: string, pageComponentId: pageComponent["id"], wantedIndex: number) {
    await sessionCheckWithError();

    // Get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    function FindProperArrayIndex(seenPageComponents: pageComponent[]): pageComponent[] {
        let foundInArrayIndex: number | null = null

        const seenArray = seenPageComponents.map((eachPageComponent, eachPageComponentIndex) => {
            if (eachPageComponent.id === pageComponentId) {
                foundInArrayIndex = eachPageComponentIndex
                return eachPageComponent
            }

            return {
                ...eachPageComponent,
                children: FindProperArrayIndex(eachPageComponent.children)
            };
        });

        if (foundInArrayIndex !== null) {
            //change up the array order
            const updatedArray = moveItemInArray(seenArray, foundInArrayIndex, wantedIndex);
            return updatedArray
        }

        return seenArray
    }

    // Update the specific page's components with the new arrangement
    seenWebsite.pages[pageId].pageComponents = FindProperArrayIndex(seenWebsite.pages[pageId].pageComponents);

    // Update the database
    await db.update(websites)
        .set({ pages: seenWebsite.pages })
        .where(eq(websites.id, websiteId));
}
export async function deleteWebsitePageComponent(websiteId: website["id"], pageId: string, pageComponentId: pageComponent["id"]) {
    await sessionCheckWithError();

    // Get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    // Recursive function to remove a component and its children
    function removeComponent(pageComponents: pageComponent[]): pageComponent[] {
        return pageComponents
            .filter(component => component.id !== pageComponentId)
            .map(component => ({
                ...component,
                children: removeComponent(component.children),
            }));
    }

    // Update the specific page's components
    seenWebsite.pages[pageId].pageComponents = removeComponent(seenWebsite.pages[pageId].pageComponents);

    // Update the database
    await db.update(websites)
        .set({ pages: seenWebsite.pages })
        .where(eq(websites.id, websiteId));
}

