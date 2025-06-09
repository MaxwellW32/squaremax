"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { newWebsite, newWebsiteSchema, updateWebsite, updateWebsiteSchema, website, websiteFilterType, websiteSchema } from "@/types"
import { ensureUserCanAccessWebsite, sessionCheckWithError } from "@/useful/sessionCheck"
import { and, desc, eq, sql, SQLWrapper } from "drizzle-orm"
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

export async function updateTheWebsite(websiteId: website["id"], websiteObj: Partial<updateWebsite>) {
    //security check - ensures only admin or author can update
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //security
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

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
    //validation
    websiteSchema.pick({ id: true }).parse(websiteObj)

    //security check
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteObj.id } })
    if (seenWebsite === undefined) throw new Error("not seeing website")

    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    await db.delete(websites).where(eq(websites.id, websiteObj.id));
}

export async function getSpecificWebsite(websiteObj: { option: "id", data: Pick<website, "id"> } | { option: "name", data: Pick<website, "name"> }, websiteOnly?: boolean): Promise<website | undefined> {
    if (websiteObj.option === "id") {
        websiteSchema.pick({ id: true }).parse(websiteObj.data)

        const result = await db.query.websites.findFirst({
            where: eq(websites.id, websiteObj.data.id),
            with: websiteOnly ? undefined : {
                pages: true,
                usedComponents: {
                    with: {
                        template: true
                    }
                }
            }
        });

        if (result !== undefined) {
            //security check
            await ensureUserCanAccessWebsite(result.userId, result.authorisedUsers)
        }

        return result

    } else if (websiteObj.option === "name") {
        websiteSchema.pick({ name: true }).parse(websiteObj.data)

        const result = await db.query.websites.findFirst({
            where: eq(websites.name, websiteObj.data.name),
            with: websiteOnly ? undefined : {
                pages: true,
                usedComponents: {
                    with: {
                        template: true
                    }
                }
            }
        });

        if (result !== undefined) {
            //security check
            await ensureUserCanAccessWebsite(result.userId, result.authorisedUsers)
        }

        return result
    }
}

export async function getWebsitesFromUserOld(limit = 50, offset = 0): Promise<website[]> {
    const session = await sessionCheckWithError()

    const results = await db.query.websites.findMany({
        where: eq(websites.userId, session.user.id),
        limit: limit,
        offset: offset,
    })

    return results
}
export async function getWebsitesFromUser(filter: websiteFilterType, limit = 50, offset = 0, withProperty: { fromUser?: true, pages?: true, usedComponents?: true } = {}): Promise<website[]> {
    const session = await sessionCheckWithError()

    // Collect conditions dynamically
    const whereClauses: SQLWrapper[] = []

    //auth
    whereClauses.push(eq(websites.userId, session.user.id))

    if (filter.id !== undefined) {
        whereClauses.push(eq(websites.id, filter.id))
    }

    if (filter.name !== undefined) {
        whereClauses.push(
            sql`LOWER(${websites.name}) LIKE LOWER(${`%${filter.name}%`})`
        )
    }

    if (filter.title !== undefined) {
        whereClauses.push(
            sql`LOWER(${websites.title}) LIKE LOWER(${`%${filter.title}%`})`
        )
    }

    if (filter.description !== undefined) {
        whereClauses.push(
            sql`LOWER(${websites.description}) LIKE LOWER(${`%${filter.description}%`})`
        )
    }

    // Run the query
    const results = await db.query.websites.findMany({
        where: and(...whereClauses),
        orderBy: [desc(websites.dateAdded)],
        limit: limit,
        offset: offset,
        with: {
            fromUser: withProperty.fromUser,
            pages: withProperty.pages,
            usedComponents: withProperty.usedComponents
        }
    });

    return results
}