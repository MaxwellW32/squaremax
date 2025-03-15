"use server"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { newPage, newPageSchema, page, pageSchema, updatePage, updatePageSchema, website, websiteSchema } from "@/types"
import { ensureUserCanAccessWebsite, sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { getSpecificWebsite } from "./handleWebsites"
import { v4 as uuidV4 } from "uuid"
import { deleteUsedComponent, getUsedComponents } from "./handleUsedComponents"

export async function addPage(seenNewPage: newPage): Promise<page> {
    //validation
    newPageSchema.parse(seenNewPage)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": seenNewPage.websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    const fullNewPage: page = {
        ...seenNewPage,
        id: uuidV4()
    }

    //validation
    pageSchema.parse(fullNewPage)

    const [result] = await db.insert(pages).values(fullNewPage).returning()

    return result
}

export async function updateThePage(pageId: page["id"], websiteId: website["id"], updatePageObj: Partial<updatePage>): Promise<page> {
    //validation
    updatePageSchema.partial().parse(updatePageObj)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    const [result] = await db.update(pages)
        .set({
            ...updatePageObj
        })
        .where(eq(pages.id, pageId)).returning();

    return result
}

export async function deletePage(websiteId: website["id"], pageId: page["id"], deleteRelatedUsedComponents = true) {
    //validate
    websiteSchema.shape.id.parse(websiteId)
    pageSchema.shape.id.parse(pageId)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    if (deleteRelatedUsedComponents) {
        const latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: websiteId } })

        const usedComponentsOnPage = latestUsedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "page" && eachUsedComponentFilter.location.pageId === pageId
        })

        await Promise.all(usedComponentsOnPage.map(async eachUsedComponent => {
            await deleteUsedComponent(websiteId, eachUsedComponent.id)
        }))
    }

    await db.delete(pages)
        .where(eq(pages.id, pageId));
}

export async function getSpecificPage(pageId: page["id"]): Promise<page | undefined> {
    //validation
    pageSchema.shape.id.parse(pageId)

    const result = await db.query.pages.findFirst({
        where: eq(pages.id, pageId),
    });

    if (result !== undefined) {
        //security check 
        const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": result.websiteId } })
        if (seenWebsite === undefined) throw new Error("not seeing website")
        await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers)
    }

    return result
}

export async function getPagesFromWebsite(websiteId: website["id"]): Promise<page[]> {
    //validation
    websiteSchema.shape.id.parse(websiteId)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers)

    const results = await db.query.pages.findMany({
        where: eq(pages.websiteId, websiteId)
    })

    return results
}