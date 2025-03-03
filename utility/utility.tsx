import { pageComponent } from "@/types"

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

export function sanitizePageComponentData(pageComponent: pageComponent): pageComponent {
    // Recursive function to update the component
    function sanitizeComponent(seenPageComponents: pageComponent[]): pageComponent[] {
        return seenPageComponents.map(eachPageComponent => {
            const seenPropData = eachPageComponent.data

            //ensure not to pass react data to server
            if (seenPropData !== null) {
                if (Object.hasOwn(seenPropData, "children")) {
                    // @ts-expect-error types
                    seenPropData["children"] = []
                }

                eachPageComponent.data = seenPropData
            }

            return {
                ...eachPageComponent,
                children: sanitizeComponent(eachPageComponent.children)
            };
        });
    }

    // Update the page components recursively
    const sanitizedPageComponent = sanitizeComponent([pageComponent]);

    return deepClone(sanitizedPageComponent[0])
}

