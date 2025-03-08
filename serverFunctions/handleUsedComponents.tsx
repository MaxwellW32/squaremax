"use server"
import { db } from "@/db"
import { usedComponents } from "@/db/schema"
import { ensureUserCanAccess, sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { newUsedComponent, updateUsedComponent, updateUsedComponentSchema, usedComponent, usedComponentSchema, website, websiteSchema } from "@/types"
import { getSpecificWebsite } from "./handleWebsites"
import { v4 as uuidV4 } from "uuid"

export async function getSpecificUsedComponent(usedComponentId: usedComponent["id"]): Promise<usedComponent | undefined> {
    //validation
    usedComponentSchema.shape.id.parse(usedComponentId)

    const result = await db.query.usedComponents.findFirst({
        where: eq(usedComponents.id, usedComponentId),
        // with: {
        //     category: true,
        // }
    });

    return result
}

export async function getUsedComponents(selectionObj: { option: "website", data: Pick<usedComponent, "websiteId"> } | { option: "component", data: Pick<usedComponent, "componentId"> }): Promise<usedComponent[]> {
    const seenSession = await sessionCheckWithError()

    if (selectionObj.option === "website") {
        //validation
        usedComponentSchema.pick({ websiteId: true }).parse(selectionObj.data)

        //security check 
        const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": selectionObj.data.websiteId } })
        if (seenWebsite === undefined) throw new Error("not seeing website")
        await ensureUserCanAccess(seenSession, seenWebsite.userId)

        const results = await db.query.usedComponents.findMany({
            where: eq(usedComponents.websiteId, selectionObj.data.websiteId),
        });

        return results

    } else if (selectionObj.option === "component") {
        //validation
        usedComponentSchema.pick({ componentId: true }).parse(selectionObj.data)

        //security check
        if (seenSession.user.role !== "admin") throw new Error("not authorised")

        const results = await db.query.usedComponents.findMany({
            where: eq(usedComponents.componentId, selectionObj.data.componentId),
        });

        return results

    } else {
        throw new Error("not seeing selectionObj")
    }
}

export async function addUsedComponent(newUsedComponent: newUsedComponent): Promise<usedComponent> {
    const fullNewUsedComponent: usedComponent = {
        id: uuidV4(),
        index: 0, //make it work
        ...newUsedComponent,
    }

    //validation
    usedComponentSchema.parse(fullNewUsedComponent)

    //sort out children


    //get all the latest components on server
    //also runs security check
    // let latestUsedComponent = await getUsedComponents({ option: "website", data: { websiteId: fullNewUsedComponent.websiteId } })

    //insert in array normally
    //check for siblings to get proper order numbering
    //refix the order

    const [result] = await db.insert(usedComponents).values(fullNewUsedComponent).returning()

    return result
}

export async function updateTheUsedComponent(websiteId: website["id"], usedComponentId: usedComponent["id"], updatedUsedComponentObj: Partial<updateUsedComponent>): Promise<usedComponent> {
    const seenSession = await sessionCheckWithError()

    //validation
    websiteSchema.shape.id.parse(websiteId)
    usedComponentSchema.shape.id.parse(usedComponentId)
    const validatedUpdatedUsedComponent = updateUsedComponentSchema.partial().parse(updatedUsedComponentObj)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccess(seenSession, seenWebsite.userId)


    const [result] = await db.update(usedComponents)
        .set({
            ...validatedUpdatedUsedComponent
        })
        .where(eq(usedComponents.id, usedComponentId)).returning()

    return result
}

export async function deleteUsedComponent(websiteId: website["id"], usedComponentId: usedComponent["id"]) {
    const seenSession = await sessionCheckWithError()

    //validation
    websiteSchema.shape.id.parse(websiteId)
    usedComponentSchema.shape.id.parse(usedComponentId)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccess(seenSession, seenWebsite.userId)

    //delete children used components recursively
    const latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: websiteId } })
    const allDescendentUsedComponents = await findChildren(usedComponentId, latestUsedComponents)
    async function findChildren(parentUsedComponentId: usedComponent["id"], sentUsedComponents: usedComponent[]): Promise<usedComponent[]> {
        // Find direct children
        let seenChildren = sentUsedComponents.filter(eachUsedComponent => {
            return eachUsedComponent.location.type === "child" && eachUsedComponent.location.parentId === parentUsedComponentId
        })

        // Recursively find children of each child component
        const subChildrenArrays = await Promise.all(seenChildren.map(async eachChildUsedComponent => {
            return await findChildren(eachChildUsedComponent.id, sentUsedComponents);
        }));

        // Flatten the results and return
        return seenChildren.concat(...subChildrenArrays);
    }

    //delete children used component
    await Promise.all(
        allDescendentUsedComponents.map(async eachDescendentUsedComponent => {
            await db.delete(usedComponents).where(eq(usedComponents.id, eachDescendentUsedComponent.id));
        })
    )

    //delte parent used component
    await db.delete(usedComponents).where(eq(usedComponents.id, usedComponentId));
}
