"use server"
import { db } from "@/db"
import { websites } from "@/db/schema"
import { newWebsiteType, newWebsiteSchema, updateWebsiteSchema, websiteType, websiteSchema, tableFilterTypes, updateWebsiteType } from "@/types"
import { ensureUserCanAccessWebsite, sessionCheckWithError } from "@/useful/sessionCheck"
import { makeWhereClauses } from "@/utility/utility"
import { and, desc, eq, SQLWrapper } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function addWebsite(seenNewWebsite: newWebsiteType): Promise<websiteType> {
    const session = await sessionCheckWithError()

    newWebsiteSchema.parse(seenNewWebsite)

    const [addedWebsite] = await db.insert(websites).values({
        ...seenNewWebsite,
        userId: session.user.id
    }).returning()

    return addedWebsite
}

export async function updateWebsite(websiteId: websiteType["id"], websiteObj: Partial<updateWebsiteType>) {
    //security check - ensures only admin or author can update
    const seenWebsite = await getSpecificWebsite(websiteId)
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //auth
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    const validatedNewWebsite = updateWebsiteSchema.partial().parse(websiteObj)
    if (websiteId === undefined) throw new Error("need id")

    const [result] = await db.update(websites)
        .set({
            ...validatedNewWebsite
        })
        .where(eq(websites.id, websiteId)).returning();

    return result
}

export async function refreshWebsitePath(websiteIdObj: Pick<websiteType, "id">) {
    await sessionCheckWithError()

    websiteSchema.pick({ id: true }).parse(websiteIdObj)

    revalidatePath(`/websites/${websiteIdObj.id}`)
}

export async function getSpecificWebsite(websiteId: websiteType["id"], runAuth = true): Promise<websiteType | undefined> {
    websiteSchema.shape.id.parse(websiteId)

    const result = await db.query.websites.findFirst({
        where: eq(websites.id, websiteId),
    });

    if (runAuth && result !== undefined) {
        //auth
        await ensureUserCanAccessWebsite(result.userId, result.authorisedUsers)
    }

    return result
}

export async function getWebsites(filter: tableFilterTypes<websiteType>, getWith?: { [key in keyof websiteType]?: true }, limit = 50, offset = 0): Promise<websiteType[]> {
    //compile filters into proper where clauses
    const whereClauses: SQLWrapper[] = makeWhereClauses(websiteSchema.partial(), filter, websites)

    const results = await db.query.websites.findMany({
        where: and(...whereClauses),
        limit,
        offset,
        orderBy: [desc(websites.dateAdded)],
        with: getWith === undefined ? undefined : {
            fromUser: getWith.fromUser,
        }
    });

    return results;
}

export async function deleteWebsite(websiteId: websiteType["id"]) {
    //validation
    websiteSchema.shape.id.parse(websiteId)

    //security check
    const seenWebsite = await getSpecificWebsite(websiteId)
    if (seenWebsite === undefined) throw new Error("not seeing website")

    //auth
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)

    await db.delete(websites).where(eq(websites.id, websiteId));
}