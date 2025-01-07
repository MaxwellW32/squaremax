import { pagesToComponent } from "@/types"

export function deepClone(object: unknown) {
    return JSON.parse(JSON.stringify(object))
}

export function sanitizeDataInPageComponent(pageComponent: Partial<pagesToComponent>) {
    const seenObjData = pageComponent.data

    //ensure not to pass react data to server
    if (seenObjData !== undefined && seenObjData !== null) {
        if (Object.hasOwn(seenObjData, "children")) {
            // @ts-expect-error types
            seenObjData["children"] = []
        }

        pageComponent.data = seenObjData
    }

    return deepClone(pageComponent)
}