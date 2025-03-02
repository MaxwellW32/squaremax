"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { newPage, newPageSchema, newWebsite, newWebsiteSchema, page, pageSchema, updatePageSchema, updateWebsite, updateWebsiteSchema, website, websiteSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
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
//create
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

//update
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

//delete
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
//create
export async function addWebsitePageComponent(websiteId: website["id"], newPageObj: newPage) {
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

//update
//delete