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
    // Recursive function to update the component
    function sanitizeComponent(seenUsedComponents: usedComponent[]): usedComponent[] {
        return seenUsedComponents.map(eachUsedComponent => {
            const seenPropData = eachUsedComponent.data

            //ensure not to pass react children data to server
            if (seenPropData !== null) {
                if (Object.hasOwn(seenPropData, "children")) {
                    // @ts-expect-error types
                    seenPropData["children"] = []
                }

                eachUsedComponent.data = seenPropData
            }

            return {
                ...eachUsedComponent,
                children: sanitizeComponent(eachUsedComponent.children)
            };
        });
    }

    // Update the used components recursively
    const sanitizedUsedComponent = sanitizeComponent([usedComponent]);

    return deepClone(sanitizedUsedComponent[0])
}

export function moveItemInArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const newArr = [...arr]; // Clone to avoid mutation
    const [movedItem] = newArr.splice(fromIndex, 1); // Remove item
    newArr.splice(toIndex, 0, movedItem); // Insert at new position
    return newArr;
}


export function getUsedComponentsInSameLocation(seenUsedComponents: usedComponent[], sentUsedComponentLocation: usedComponent["location"]) {
    const usedComponentsInSameLocation: usedComponent[] = []

    //filter by location
    const usedComponentsInDifferentLocation = seenUsedComponents.filter(eachFilterUsedComponent => {
        let matchingLocation = false

        //match header footer area
        if (eachFilterUsedComponent.location === sentUsedComponentLocation) {
            matchingLocation = true
        }

        //match usedComponents on the same page
        if (typeof eachFilterUsedComponent.location === "object" && typeof sentUsedComponentLocation === "object" && eachFilterUsedComponent.location.pageId === sentUsedComponentLocation.pageId) {
            matchingLocation = true
        }

        if (matchingLocation) {
            usedComponentsInSameLocation.push(eachFilterUsedComponent)
        }

        //ensure dont return matching locations
        return !matchingLocation
    })

    return {
        usedComponentsInSameLocation: usedComponentsInSameLocation,
        usedComponentsInDifferentLocation: usedComponentsInDifferentLocation
    }
}

// Recursive function to find the parent and add the component to its children
export function addToParent(usedComponents: usedComponent[], newUsedComponent: usedComponent, sentParentComponent: usedComponent, sentIndexToAdd: number): usedComponent[] {
    return usedComponents.map(usedComponent => {
        if (usedComponent.id === sentParentComponent.id) {
            return {
                ...usedComponent,
                children: [
                    ...usedComponent.children.slice(0, sentIndexToAdd),
                    newUsedComponent,
                    ...usedComponent.children.slice(sentIndexToAdd)
                ]
            };
        }

        return {
            ...usedComponent,
            children: addToParent(usedComponent.children, newUsedComponent, sentParentComponent, sentIndexToAdd) // Recursively update children
        };
    });
}

