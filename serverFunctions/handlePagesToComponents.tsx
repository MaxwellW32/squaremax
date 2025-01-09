"use server"
import { db } from "@/db"
import { pagesToComponents } from "@/db/schema"
import { pagesToComponent, pagesToComponentsSchema, component, componentSchema, page, pageSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"

export async function addComponentToPage(pageObj: Pick<page, "id">, componentObj: Pick<component, "id">, pagesToComponentObj: Pick<pagesToComponent, "indexOnPage">): Promise<pagesToComponent> {
    await sessionCheckWithError()

    pageSchema.pick({ id: true }).parse(pageObj)
    componentSchema.pick({ id: true }).parse(componentObj)
    pagesToComponentsSchema.pick({ indexOnPage: true }).parse(pagesToComponentObj)

    const result = await db.insert(pagesToComponents).values({
        pageId: pageObj.id,
        componentId: componentObj.id,
        ...pagesToComponentObj
    }).returning()

    return result[0]
}

export async function updateComponentInPage(pagesToComponentArr: Partial<pagesToComponent>[]) {
    await sessionCheckWithError()

    //add security validation

    await Promise.all(
        pagesToComponentArr.map(async eachPageToCompObj => {
            //things clients can actually update
            const validatedData = pagesToComponentsSchema.pick({ id: true, css: true, data: true, indexOnPage: true, children: true }).parse(eachPageToCompObj)

            await db.update(pagesToComponents)
                .set({
                    ...validatedData
                })
                .where(eq(pagesToComponents.id, validatedData.id));
        })
    )
}

export async function deleteComponentFromPage(pagesToComponentObj: Pick<pagesToComponent, "id">) {
    await sessionCheckWithError()

    pagesToComponentsSchema.pick({ id: true }).parse(pagesToComponentObj)

    await db.delete(pagesToComponents).where(eq(pagesToComponents.id, pagesToComponentObj.id));
}

export async function removePageComponentsFromComponent(pagesToComponentArr: Pick<pagesToComponent, "id">[], componentId: component["id"]) {
    await sessionCheckWithError()

    await Promise.all(
        pagesToComponentArr.map(async eachPageToComponentObj => {
            pagesToComponentsSchema.pick({ id: true }).parse(eachPageToComponentObj)

            await db.delete(pagesToComponents).where(eq(pagesToComponents.componentId, componentId));
        })
    )
}


export async function getPageComponentsFromComponentId(componentId: component["id"]): Promise<pagesToComponent[]> {
    await sessionCheckWithError()

    const results = await db.query.pagesToComponents.findMany({
        where: eq(pagesToComponents.componentId, componentId)
    })

    return results
}