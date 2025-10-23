"use server"
import { db } from "@/db"
import { usedComponents } from "@/db/schema"
import { ensureUserCanAccessWebsite } from "@/useful/sessionCheck"
import { eq } from "drizzle-orm"
import { newUsedComponentType, updateUsedComponentType, updateUsedComponentSchema, usedComponentType, usedComponentLocationType, usedComponentSchema, websiteType, websiteSchema } from "@/types"
import { getSpecificWebsite } from "./handleWebsites"
import { v4 as uuidV4 } from "uuid"
import { ensureChildCanBeAddedToParent, getDescendedUsedComponents, getUsedComponentsInSameLocation, moveItemInArray, sortUsedComponentsByOrder } from "@/utility/utility"

export async function getSpecificUsedComponent(usedComponentId: usedComponentType["id"]): Promise<usedComponentType | undefined> {
    //validation
    usedComponentSchema.shape.id.parse(usedComponentId)

    const result = await db.query.usedComponents.findFirst({
        where: eq(usedComponents.id, usedComponentId)
    });

    return result
}

export async function getUsedComponents(selectionObj: { option: "website", data: Pick<usedComponentType, "websiteId"> } | { option: "template", data: Pick<usedComponentType, "templateId"> }): Promise<usedComponentType[]> {
    if (selectionObj.option === "website") {
        //validation
        usedComponentSchema.pick({ websiteId: true }).parse(selectionObj.data)

        //security check 
        const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": selectionObj.data.websiteId } })
        if (seenWebsite === undefined) throw new Error("not seeing website")
        await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers)

        const results = await db.query.usedComponents.findMany({
            where: eq(usedComponents.websiteId, selectionObj.data.websiteId),
        });

        return results

    } else if (selectionObj.option === "template") {
        //validation
        usedComponentSchema.pick({ templateId: true }).parse(selectionObj.data)

        const results = await db.query.usedComponents.findMany({
            where: eq(usedComponents.templateId, selectionObj.data.templateId),
        });

        //security - admin only
        await ensureUserCanAccessWebsite("", [])

        return results

    } else {
        throw new Error("not seeing selectionObj")
    }
}

export async function addUsedComponent(newUsedComponent: newUsedComponentType): Promise<usedComponentType> {
    const fullNewUsedComponent: usedComponentType = {
        id: uuidV4(),
        ...newUsedComponent,
    }

    //validation
    usedComponentSchema.parse(fullNewUsedComponent)

    const [result] = await db.insert(usedComponents).values(fullNewUsedComponent).returning()
    return result
}

export async function updateTheUsedComponent(websiteId: websiteType["id"], usedComponentId: usedComponentType["id"], updatedUsedComponentObj: Partial<updateUsedComponentType>, runSecurity = true): Promise<usedComponentType> {
    //validation
    websiteSchema.shape.id.parse(websiteId)
    usedComponentSchema.shape.id.parse(usedComponentId)
    const validatedUpdatedUsedComponent = updateUsedComponentSchema.partial().parse(updatedUsedComponentObj)

    if (runSecurity) {
        //security check 
        const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
        if (seenWebsite === undefined) throw new Error("not seeing website")
        await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)
    }

    const [result] = await db.update(usedComponents)
        .set({
            ...validatedUpdatedUsedComponent
        })
        .where(eq(usedComponents.id, usedComponentId)).returning()

    return result
}

export async function deleteUsedComponent(websiteId: websiteType["id"], usedComponentId: usedComponentType["id"]) {
    //validation
    websiteSchema.shape.id.parse(websiteId)
    usedComponentSchema.shape.id.parse(usedComponentId)

    //security check 
    const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
    if (seenWebsite === undefined) throw new Error("not seeing website")
    await ensureUserCanAccessWebsite(seenWebsite.userId, seenWebsite.authorisedUsers, true)


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

export async function changeUsedComponentIndex(seenUsedComponent: usedComponentType, wantedIndex: number) {
    //validation
    usedComponentSchema.parse(seenUsedComponent)

    //security
    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: seenUsedComponent.websiteId } })

    //get used components in same location
    //put them in an array
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent.location, latestUsedComponents)

    //order those components for the array
    const orderedUsedComponentsInSameLocation = sortUsedComponentsByOrder(usedComponentsInSameLocation)

    //put where found in array index 
    const seenIndexInArray = orderedUsedComponentsInSameLocation.findIndex(eachOrderedUsedComponentsInSameLocation => eachOrderedUsedComponentsInSameLocation.id === seenUsedComponent.id)

    //change the array by inserting at the wanted index
    let updatedUsedComponentsArray = moveItemInArray(orderedUsedComponentsInSameLocation, seenIndexInArray, wantedIndex)

    //redo the ordering by map index
    updatedUsedComponentsArray = updatedUsedComponentsArray.map((eachUsedComponent, eachUsedComponentIndex) => {
        eachUsedComponent.order = eachUsedComponentIndex

        return eachUsedComponent
    })

    //update each of the usedComponents
    await Promise.all(updatedUsedComponentsArray.map(async eachUsedComponent => {
        await updateTheUsedComponent(eachUsedComponent.websiteId, eachUsedComponent.id, eachUsedComponent, false)
    }))
}

export async function changeUsedComponentLocation(seenUsedComponent: usedComponentType, newLocation: usedComponentLocationType) {
    //validation
    usedComponentSchema.parse(seenUsedComponent)

    //security
    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: seenUsedComponent.websiteId } })

    //if adding as a child of another element ensure parentEl is valid
    if (newLocation.type === "child") {
        ensureChildCanBeAddedToParent(newLocation.parentId, latestUsedComponents)
    }

    //get used components in same location
    //put them in an array
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent.location, latestUsedComponents)

    //ensure the ordering always adds to the last in the array
    let largestOrderNumberSeen = -1
    usedComponentsInSameLocation.forEach(eachUsedComponentInSameLocation => {
        if (eachUsedComponentInSameLocation.order > largestOrderNumberSeen) {
            largestOrderNumberSeen = eachUsedComponentInSameLocation.order
        }
    })

    //update component
    await updateTheUsedComponent(seenUsedComponent.websiteId, seenUsedComponent.id, { order: largestOrderNumberSeen + 1, location: newLocation })
}

