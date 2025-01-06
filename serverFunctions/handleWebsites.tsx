"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { newWebsite, newWebsiteSchema, website, websiteSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function addWebsite(seenNewWebsite: newWebsite): Promise<website> {
    const session = await sessionCheckWithError()

    newWebsiteSchema.parse(seenNewWebsite)

    const addedWebsite = await db.insert(websites).values({
        ...seenNewWebsite,
        userId: session.user.id
    }).returning()

    return addedWebsite[0]
}

export async function updateWebsite(websiteObj: Partial<website>) {
    await sessionCheckWithError()

    if (websiteObj.id === undefined) throw new Error("need to provide id")

    websiteSchema.partial().parse(websiteObj)

    await db.update(websites)
        .set({
            ...websiteObj
        })
        .where(eq(websites.id, websiteObj.id));
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
            where: eq(websites.id, websiteObj.data.id),
            with: {
                pages: {
                    with: {
                        pagesToComponents: {
                            with: {
                                component: {
                                    with: {
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return result

    } else if (websiteObj.option === "name") {
        websiteSchema.pick({ name: true }).parse(websiteObj.data)

        const result = await db.query.websites.findFirst({
            where: eq(websites.name, websiteObj.data.name),
            with: {
                pages: {
                    with: {
                        pagesToComponents: {
                            with: {
                                component: {
                                    with: {
                                        category: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
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