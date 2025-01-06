"use server"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { newPage, newPageSchema, page, pageSchema, website, websiteSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { getSpecificWebsite } from "./handleWebsites"

export async function addPage(seenNewPage: newPage, websiteIdObj: Pick<website, "id">): Promise<page> {
    await sessionCheckWithError()

    newPageSchema.parse(seenNewPage)
    websiteSchema.pick({ id: true }).parse(websiteIdObj)

    const addedPage = await db.insert(pages).values({
        ...seenNewPage,
        websiteId: websiteIdObj.id
    }).returning()

    return addedPage[0]
}

export async function updatePage(pageObj: Partial<page>) {
    await sessionCheckWithError()

    if (pageObj.id === undefined) throw new Error("need to provide id")

    pageSchema.partial().parse(pageObj)

    await db.update(pages)
        .set({
            ...pageObj
        })
        .where(eq(pages.id, pageObj.id));
}

export async function deletePage(pageIdObj: Pick<page, "id">, websiteIdObj: Pick<website, "id">) {
    const session = await sessionCheckWithError()

    pageSchema.pick({ id: true }).parse(pageIdObj)

    const seenPage = await getSpecificPage({ id: pageIdObj.id })
    if (seenPage === undefined) throw new Error("not seeing page")

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteIdObj.id } })
    if (seenWebsite === undefined) throw new Error("not seeing seenWebsite")

    if (session.user.id !== seenWebsite.userId && session.user.role !== "admin") throw new Error("not authorized to delete page")

    await db.delete(pages).where(eq(pages.id, pageIdObj.id));
}

export async function getSpecificPage(pageIdObj: Pick<page, "id">): Promise<page | undefined> {
    pageSchema.pick({ id: true }).parse(pageIdObj)

    const result = await db.query.pages.findFirst({
        where: eq(pages.id, pageIdObj.id),
        with: {
            pagesToComponents: {
                with: {
                    component: true
                }
            }

        }
    });

    return result
}

export async function getPagesFromWebsite(websiteIdObj: Pick<website, "id">): Promise<page[]> {
    const session = await sessionCheckWithError()

    const seenWebsite = await getSpecificWebsite({ option: "id", data: { id: websiteIdObj.id } })
    if (seenWebsite === undefined) throw new Error("not seeing seenWebsite")

    if (session.user.id !== seenWebsite.userId && session.user.role !== "admin") throw new Error("not authorized to get pages")

    const results = await db.query.pages.findMany({
        where: eq(pages.websiteId, websiteIdObj.id)
    })

    return results
}