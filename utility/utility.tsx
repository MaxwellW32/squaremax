import { usedComponent } from "@/types"

export function deepClone(object: unknown) {
    return JSON.parse(JSON.stringify(object))
}

export function addScopeToCSS(cssString: string, idPrefix: string) {
    return cssString.replace(
        // Match valid class (.classname) or ID (#id) selectors
        /(?<=^|\s|,)([.#][a-zA-Z_-][a-zA-Z0-9_-]*)/g,
        (match) => {
            // Only prepend if it's a class or ID, not a hex code
            if (match.startsWith("#") && /^#[a-fA-F0-9]{3,6}$/.test(match)) {
                // Leave hex codes untouched
                return match;
            }

            // Prepend the prefix to valid selectors
            return `${match}____${idPrefix}`;
        }
    );
}

export function sanitizeUsedComponentData(usedComponent: usedComponent): usedComponent {
    // Update the used components recursively

    const seenPropData = usedComponent.data

    //ensure not to pass react children data to server
    if (seenPropData !== null) {
        if (Object.hasOwn(seenPropData, "children")) {
            // @ts-expect-error types
            seenPropData["children"] = []
        }

        usedComponent.data = seenPropData
    }

    return deepClone(usedComponent)
}

export function moveItemInArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const newArr = [...arr]; // Clone to avoid mutation
    const [movedItem] = newArr.splice(fromIndex, 1); // Remove item
    newArr.splice(toIndex, 0, movedItem); // Insert at new position
    return newArr;
}

export function getDescendedUsedComponents(parentUsedComponents: usedComponent[], originalUsedComponentsList: usedComponent[]): usedComponent[] {
    const descendedArray: usedComponent[] = []

    parentUsedComponents.forEach(eachParentUsedComponent => {
        // get children for each usedComponent
        let childrenUsedComponents = getChildrenUsedComponents(eachParentUsedComponent.id, originalUsedComponentsList)
        descendedArray.push(...childrenUsedComponents)

        const seenFutherChildComponents = getDescendedUsedComponents(childrenUsedComponents, originalUsedComponentsList)
        descendedArray.push(...seenFutherChildComponents)
    })

    return descendedArray
}

export function getChildrenUsedComponents(usedComponentParentId: usedComponent["id"], originalUsedComponentsList: usedComponent[]) {
    // get children for each usedComponent
    const childrenUsedComponents = originalUsedComponentsList.filter(eachUsedComponent => {
        return eachUsedComponent.location.type === "child" && eachUsedComponent.location.parentId === usedComponentParentId
    })

    return childrenUsedComponents
}

export function sortUsedComponentsByIndex(seenUsedComponents: usedComponent[]) {
    let orderedUsedComponents = seenUsedComponents.sort((a, b) => a.index - b.index);
    return orderedUsedComponents
}

