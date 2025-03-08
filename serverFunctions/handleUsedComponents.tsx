"use server"
import { db } from "@/db"
import { usedComponents } from "@/db/schema"
import { ensureUserCanAccess, sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { newUsedComponent, updateUsedComponent, updateUsedComponentSchema, usedComponent, usedComponentSchema, website, websiteSchema } from "@/types"
import { getSpecificWebsite } from "./handleWebsites"
import { v4 as uuidV4 } from "uuid"
import { getDescendedUsedComponents, getUsedComponentsInSameLocation } from "@/utility/utility"

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
        ...newUsedComponent,
    }

    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: fullNewUsedComponent.websiteId } })

    //validation
    usedComponentSchema.parse(fullNewUsedComponent)

    //add to last index of elements in same location header, footer, page
    if (fullNewUsedComponent.location.type !== "child") {
        const usedComponentsInSameLocation = latestUsedComponents.filter(eachUsedComponent => {
            return eachUsedComponent.location.type === fullNewUsedComponent.location.type
        })

        //assign latest index
        fullNewUsedComponent.index = usedComponentsInSameLocation.length

    } else {
        //add child usedComponent to the latest seen with its siblings
        const siblingUsedComponents = latestUsedComponents.filter(eachUsedComponent => {
            return eachUsedComponent.location.type === "child" && fullNewUsedComponent.location.type === "child" && eachUsedComponent.location.parentId === fullNewUsedComponent.location.parentId
        })

        //assign latest index
        fullNewUsedComponent.index = siblingUsedComponents.length
    }

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

    //get all descended used components
    const allDescendentUsedComponents = getDescendedUsedComponents([usedComponentId], latestUsedComponents)

    //delete children used component
    await Promise.all(
        allDescendentUsedComponents.map(async eachDescendentUsedComponent => {
            await db.delete(usedComponents).where(eq(usedComponents.id, eachDescendentUsedComponent.id));
        })
    )

    //delte parent used component
    await db.delete(usedComponents).where(eq(usedComponents.id, usedComponentId));
}

export async function changeUsedComponentIndex(seenUsedComponent: usedComponent, wantedIndex: number) {
    //get latest usedComponents on server
    //security
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: seenUsedComponent.websiteId } })

    //get used components in same location
    //put them in an array
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent, latestUsedComponents)

    //change the array by inserting at the wanted index

    //redo the ordering by map index

    //update each of the usedComponents
}
