"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { component, newPage, newPageSchema, newWebsite, newWebsiteSchema, page, usedComponent, usedComponentSchema, pageSchema, updatePageSchema, updateWebsite, updateWebsiteSchema, website, websiteSchema, usedComponentLocationType } from "@/types"
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
export async function addWebsiteUsedComponent(websiteId: website["id"], componentId: component["id"], currentIndex: number, location: usedComponentLocationType, parentComponent?: usedComponent) {
    await sessionCheckWithError();

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    const newUsedComponent: usedComponent = {
        id: uuidV4(),
        componentId: componentId,
        css: "",
        children: [],
        location: location,
        data: null,
    };

    usedComponentSchema.parse(newUsedComponent);

    // Recursive function to find the parent and add the component to its children
    function addToParent(usedComponents: usedComponent[]): usedComponent[] {
        return usedComponents.map(usedComponent => {
            if (usedComponent.id === parentComponent?.id) {
                return {
                    ...usedComponent,
                    children: [
                        ...usedComponent.children.slice(0, currentIndex),
                        newUsedComponent,
                        ...usedComponent.children.slice(currentIndex)
                    ]
                };
            }

            return {
                ...usedComponent,
                children: addToParent(usedComponent.children) // Recursively update children
            };
        });
    }

    if (parentComponent) {
        // Update the nested structure if a parent is specified
        seenWebsite.usedComponents = addToParent(seenWebsite.usedComponents);

    } else {
        // Insert normally at the root level
        seenWebsite.usedComponents = [
            ...seenWebsite.usedComponents.slice(0, currentIndex),
            newUsedComponent,
            ...seenWebsite.usedComponents.slice(currentIndex)
        ];
    }

    await db.update(websites)
        .set({ usedComponents: seenWebsite.usedComponents })
        .where(eq(websites.id, websiteId));
}
export async function updateWebsiteUsedComponent(websiteId: website["id"], usedComponentObj: Partial<usedComponent>) {
    await sessionCheckWithError();

    if (!usedComponentObj.id) throw new Error("Need used component ID");

    // Remove component info for database
    const { component, ...updateData } = usedComponentObj;

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    // Recursive function to update the component
    function updateUsedComponent(seenUsedComponents: usedComponent[]): usedComponent[] {
        return seenUsedComponents.map(eachUsedComponent => {
            if (eachUsedComponent.id === usedComponentObj.id) {
                const updatedComponent = { ...eachUsedComponent, ...updateData };

                // Validate the updated component
                usedComponentSchema.parse(updatedComponent);

                return updatedComponent;
            }

            return {
                ...eachUsedComponent,
                children: updateUsedComponent(eachUsedComponent.children)
            };
        });
    }

    // Update the page components recursively
    seenWebsite.usedComponents = updateUsedComponent(seenWebsite.usedComponents);

    // Update the database
    await db.update(websites)
        .set({ usedComponents: seenWebsite.usedComponents })
        .where(eq(websites.id, websiteId));
}
export async function changeWebsiteUsedComponentIndex(websiteId: website["id"], sentUsedComponent: usedComponent, wantedIndex: number) {
    await sessionCheckWithError();

    // Get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    const filteredUsedComponents: usedComponent[] = []

    //filter by location
    const arrayWithoutFilteredUsedComponents = seenWebsite.usedComponents.filter(eachFilterUsedComponent => {
        let matchingLocation = false

        //match header footer area
        if (eachFilterUsedComponent.location === sentUsedComponent.location) {
            matchingLocation = true
        }

        //match usedComponents on the same page
        if (typeof eachFilterUsedComponent.location === "object" && typeof sentUsedComponent.location === "object") {
            if (eachFilterUsedComponent.location.pageId === sentUsedComponent.location.pageId) {
                matchingLocation = true
            }
        }

        if (matchingLocation) {
            filteredUsedComponents.push(eachFilterUsedComponent)
        }

        //ensure dont return matching locations
        return !matchingLocation
    })

    console.log(`$arrayWithoutFilteredUsedComponents`, JSON.stringify(arrayWithoutFilteredUsedComponents, null, 2));
    console.log(`$filteredUsedComponents`, JSON.stringify(filteredUsedComponents, null, 2));

    // Update the specific page's components with the new arrangement
    seenWebsite.usedComponents = [...arrayWithoutFilteredUsedComponents, ...FindAndApplyProperArrayIndex(filteredUsedComponents)]

    function FindAndApplyProperArrayIndex(seenUsedComponents: usedComponent[]): usedComponent[] {
        let foundInArrayIndex: number | null = null

        const seenArray = seenUsedComponents.map((eachUsedComponent, eachUsedComponentIndex) => {
            if (eachUsedComponent.id === sentUsedComponent.id) {
                foundInArrayIndex = eachUsedComponentIndex
                return eachUsedComponent
            }

            return {
                ...eachUsedComponent,
                children: FindAndApplyProperArrayIndex(eachUsedComponent.children)
            };
        });

        if (foundInArrayIndex !== null) {
            //change up the array order
            const updatedArray = moveItemInArray(seenArray, foundInArrayIndex, wantedIndex);
            return updatedArray
        }

        return seenArray
    }

    // Update the database
    await db.update(websites)
        .set({ usedComponents: seenWebsite.usedComponents })
        .where(eq(websites.id, websiteId));
}
export async function deleteWebsiteUsedComponent(websiteId: website["id"], pageComponentId: usedComponent["id"]) {
    await sessionCheckWithError();

    // Get website
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteId } });
    if (seenWebsite === undefined) throw new Error("Website not found");

    // Recursive function to remove a component and its children
    function removeComponent(pageComponents: usedComponent[]): usedComponent[] {
        return pageComponents
            .filter(component => component.id !== pageComponentId)
            .map(component => ({
                ...component,
                children: removeComponent(component.children),
            }));
    }

    // Update the specific page's components
    seenWebsite.usedComponents = removeComponent(seenWebsite.usedComponents);

    // Update the database
    await db.update(websites)
        .set({ usedComponents: seenWebsite.usedComponents })
        .where(eq(websites.id, websiteId));
}

