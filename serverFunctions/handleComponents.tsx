"use server"
import { db } from "@/db"
import { components } from "@/db/schema"
import { component, componentSchema } from "@/types"
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