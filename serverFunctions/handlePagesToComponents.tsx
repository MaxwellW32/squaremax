"use server"
import { db } from "@/db"
import { pagesToComponents } from "@/db/schema"
import { pagesToComponent, pagesToComponentsSchema, component, componentSchema, page, pageSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"

export async function addComponentToPage(pageObj: Pick<page, "id">, componentObj: Pick<component, "id">, pagesToComponentObj: Pick<pagesToComponent, "indexOnPage">) {
    await sessionCheckWithError()

    pageSchema.pick({ id: true }).parse(pageObj)
    componentSchema.pick({ id: true }).parse(componentObj)
    pagesToComponentsSchema.pick({ indexOnPage: true }).parse(pagesToComponentObj)

    await db.insert(pagesToComponents).values({
        pageId: pageObj.id,
        componentId: componentObj.id,
        ...pagesToComponentObj
    })
}

export async function updateComponentInPage(pagesToComponentObj: Partial<pagesToComponent>) {
    await sessionCheckWithError()

    //add security validation

    //things clients can actually update
    const validatedData = pagesToComponentsSchema.pick({ id: true, css: true, data: true, indexOnPage: true }).parse(pagesToComponentObj)

    await db.update(pagesToComponents)
        .set({
            ...validatedData
        })
        .where(eq(pagesToComponents.id, validatedData.id));
}

export async function deleteComponentFromPage(pagesToComponentObj: Pick<pagesToComponent, "id">) {
    await sessionCheckWithError()

    pagesToComponentsSchema.pick({ id: true }).parse(pagesToComponentObj)

    await db.delete(pagesToComponents).where(eq(pagesToComponents.id, pagesToComponentObj.id));
}