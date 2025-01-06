"use server"
import { db } from "@/db"
import { pagesToComponents } from "@/db/schema"
import { pagesToComponent, pagesToComponentsSchema, component, componentSchema, page, pageSchema } from "@/types"
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"

export async function addComponentToPage(pageObj: Pick<page, "id">, componentObj: Pick<component, "id">) {
    await sessionCheckWithError()

    pageSchema.pick({ id: true }).parse(pageObj)
    componentSchema.pick({ id: true }).parse(componentObj)

    await db.insert(pagesToComponents).values({
        pageId: pageObj.id,
        componentId: componentObj.id
    })
}

export async function updateComponentInPage(pagesToComponentObj: Partial<pagesToComponent>) {
    await sessionCheckWithError()

    if (pagesToComponentObj.id === undefined) throw new Error("need to provide id")

    pagesToComponentsSchema.partial().parse(pagesToComponentObj)

    await db.update(pagesToComponents)
        .set({
            ...pagesToComponentObj
        })
        .where(eq(pagesToComponents.id, pagesToComponentObj.id));
}

export async function deleteComponentFromPage(pagesToComponentObj: Pick<pagesToComponent, "id">) {
    await sessionCheckWithError()

    pagesToComponentsSchema.pick({ id: true }).parse(pagesToComponentObj)

    await db.delete(pagesToComponents).where(eq(pagesToComponents.id, pagesToComponentObj.id));
}