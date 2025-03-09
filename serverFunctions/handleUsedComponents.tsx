"use server"
import { db } from "@/db"
import { usedComponents } from "@/db/schema"
import { ensureUserCanAccess, sessionCheckWithError } from "@/usefulFunctions/sessionCheck"
import { eq } from "drizzle-orm"
import { newUsedComponent, updateUsedComponent, updateUsedComponentSchema, usedComponent, usedComponentLocationType, usedComponentSchema, website, websiteSchema } from "@/types"
import { getSpecificWebsite } from "./handleWebsites"
import { v4 as uuidV4 } from "uuid"
import { getDescendedUsedComponents, getUsedComponentsInSameLocation, moveItemInArray, sortUsedComponentsByOrder } from "@/utility/utility"

export async function getSpecificUsedComponent(usedComponentId: usedComponent["id"]): Promise<usedComponent | undefined> {
    //validation
    usedComponentSchema.shape.id.parse(usedComponentId)

    const result = await db.query.usedComponents.findFirst({
        where: eq(usedComponents.id, usedComponentId),
        with: {
        }
    });

    return result
}

export async function getUsedComponents(selectionObj: { option: "website", data: Pick<usedComponent, "websiteId"> } | { option: "template", data: Pick<usedComponent, "templateId"> }): Promise<usedComponent[]> {
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

    } else if (selectionObj.option === "template") {
        //validation
        usedComponentSchema.pick({ templateId: true }).parse(selectionObj.data)

        //security check
        if (seenSession.user.role !== "admin") throw new Error("not authorised")

        const results = await db.query.usedComponents.findMany({
            where: eq(usedComponents.templateId, selectionObj.data.templateId),
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

    //security
    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: fullNewUsedComponent.websiteId } })

    //validation
    usedComponentSchema.parse(fullNewUsedComponent)

    //maintain db recusrive constraint with child used component
    //ensure child can be added to wanted parent
    if (fullNewUsedComponent.location.type === "child") {
        await ensureChildCanBeAddedToParent(fullNewUsedComponent.location.parentId, { option: "reuse", sentUsedComponent: latestUsedComponents })
    }

    //match other usedComponents in same location
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(fullNewUsedComponent, latestUsedComponents)

    //ensure the ordering always adds to the last in the array
    let largestOrderNumberSeen = -1
    usedComponentsInSameLocation.forEach(eachUsedComponentInSameLocation => {
        if (eachUsedComponentInSameLocation.order > largestOrderNumberSeen) {
            largestOrderNumberSeen = eachUsedComponentInSameLocation.order
        }
    })
    fullNewUsedComponent.order = largestOrderNumberSeen + 1

    const [result] = await db.insert(usedComponents).values(fullNewUsedComponent).returning()

    return result
}

export async function updateTheUsedComponent(websiteId: website["id"], usedComponentId: usedComponent["id"], updatedUsedComponentObj: Partial<updateUsedComponent>, runSecurity = true): Promise<usedComponent> {
    const seenSession = await sessionCheckWithError()

    //validation
    websiteSchema.shape.id.parse(websiteId)
    usedComponentSchema.shape.id.parse(usedComponentId)
    const validatedUpdatedUsedComponent = updateUsedComponentSchema.partial().parse(updatedUsedComponentObj)

    if (runSecurity) {
        //security check 
        const seenWebsite = await getSpecificWebsite({ option: "id", data: { "id": websiteId } })
        if (seenWebsite === undefined) throw new Error("not seeing website")
        await ensureUserCanAccess(seenSession, seenWebsite.userId)
    }

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
    //validation
    usedComponentSchema.parse(seenUsedComponent)

    //security
    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: seenUsedComponent.websiteId } })

    //get used components in same location
    //put them in an array
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent, latestUsedComponents)

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

export async function changeUsedComponentLocation(seenUsedComponent: usedComponent, newLocation: usedComponentLocationType) {
    //validation
    usedComponentSchema.parse(seenUsedComponent)

    //security
    //get latest usedComponents on server
    let latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: seenUsedComponent.websiteId } })

    //if adding as a child of another element ensure parentEl is valid
    if (newLocation.type === "child") {
        ensureChildCanBeAddedToParent(newLocation.parentId, { option: "reuse", sentUsedComponent: latestUsedComponents })
    }

    //get used components in same location
    //put them in an array
    const usedComponentsInSameLocation = getUsedComponentsInSameLocation(seenUsedComponent, latestUsedComponents)

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

//ensure parentEl can actually take children elements
export async function ensureChildCanBeAddedToParent(parentId: usedComponent["id"], otherData: { option: "reuse", sentUsedComponent: usedComponent[] } | { option: "fetch", websiteId: website["id"] }) {
    let latestUsedComponents: usedComponent[] = []

    if (otherData.option === "reuse") {
        latestUsedComponents = otherData.sentUsedComponent
    } else if (otherData.option === "fetch") {
        latestUsedComponents = await getUsedComponents({ option: "website", data: { websiteId: otherData.websiteId } })
    }

    //ensure parent exists in array
    const foundParentUsedComponent = latestUsedComponents.find(eachSentUsedComponent => eachSentUsedComponent.id === parentId)
    if (foundParentUsedComponent === undefined) throw new Error("not seeing parent used component")

    //ensure parent can take children
    if (!Object.hasOwn(foundParentUsedComponent.data, "children")) throw new Error("This component can't take child elements")
}