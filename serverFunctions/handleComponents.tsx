"use server"
import { db } from "@/db"
import { components } from "@/db/schema"
import { collection, component, componentSchema, newComponent, newComponentSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq, like } from "drizzle-orm"

export async function getSpecificComponent(componentIdObj: Pick<component, "id">): Promise<component | undefined> {
    componentSchema.pick({ id: true }).parse(componentIdObj)

    const result = await db.query.components.findFirst({
        where: eq(components.id, componentIdObj.id),
    });

    return result
}

export async function getComponents(selectionObj: { option: "name", data: Pick<component, "name"> } | { option: "categoryId", data: Pick<component, "categoryId"> }): Promise<component[]> {
    if (selectionObj.option === "name") {
        componentSchema.pick({ name: true }).parse(selectionObj.data)

        const result = await db.query.components.findMany({
            where: like(components.name, `%${selectionObj.data}%`),
        });

        return result

    } else if (selectionObj.option === "categoryId") {
        componentSchema.pick({ categoryId: true }).parse(selectionObj.data)

        const result = await db.query.components.findMany({
            where: eq(components.categoryId, selectionObj.data.categoryId),
        });

        return result

    } else {
        throw new Error("not seeing selectionObj")
    }
}

//server function to manage files
export async function addComponent(seenNewComponent: newComponent, collectionsArr: collection[]): Promise<component> {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website components")

    newComponentSchema.parse(seenNewComponent)

    const addedComponent = await db.insert(components).values(seenNewComponent).returning()

    return addedComponent[0]
}

export async function updateComponent(componentObj: Partial<component>, collectionsArr: collection[]) {
    const session = await sessionCheckWithError()
    if (session.user.role !== "admin") throw new Error("need to be admin to add website components")

    if (componentObj.id === undefined) throw new Error("need to provide id")

    componentSchema.partial().parse(componentObj)

    await db.update(components)
        .set(componentObj)
        .where(eq(components.id, componentObj.id));
}