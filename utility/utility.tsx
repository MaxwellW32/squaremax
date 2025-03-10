import { fontsType, usedComponent, usedComponentLocationType } from "@/types"

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
    if (Object.hasOwn(seenPropData, "children")) {
        // @ts-expect-error types
        seenPropData["children"] = []
    }

    usedComponent.data = seenPropData

    return deepClone(usedComponent)
}

export function moveItemInArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const newArr = [...arr]; // Clone to avoid mutation

    const [movedItem] = newArr.splice(fromIndex, 1); // Remove item

    newArr.splice(toIndex, 0, movedItem); // Insert at new position

    return newArr;
}

export function getDescendedUsedComponents(parentUsedComponentIds: (usedComponent["id"])[], originalUsedComponentsList: usedComponent[]): usedComponent[] {
    const descendedArray: usedComponent[] = []

    parentUsedComponentIds.forEach(eachParentUsedComponentId => {
        // get children for each usedComponent
        let childrenUsedComponents = getChildrenUsedComponents(eachParentUsedComponentId, originalUsedComponentsList)
        descendedArray.push(...childrenUsedComponents)

        const childrenUsedComponentIds = childrenUsedComponents.map(eachUsedComponentChild => eachUsedComponentChild.id)

        const seenFutherChildComponents = getDescendedUsedComponents(childrenUsedComponentIds, originalUsedComponentsList)
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

// export function getUsedComponentsInSameLocation(seenUsedComponent: usedComponent, usedComponents: usedComponent[]) {
//     const usedComponentsInSameLocation = usedComponents.filter(eachUsedComponentFilter => {
//         let seenInMatchingLocation = false

//         if (eachUsedComponentFilter.location.type === "header" && seenUsedComponent.location.type === "header") {
//             seenInMatchingLocation = true

//         } else if (eachUsedComponentFilter.location.type === "footer" && seenUsedComponent.location.type === "footer") {
//             seenInMatchingLocation = true

//         } else if (eachUsedComponentFilter.location.type === "page" && seenUsedComponent.location.type === "page" && eachUsedComponentFilter.location.pageId === seenUsedComponent.location.pageId) {
//             seenInMatchingLocation = true

//         } else if (eachUsedComponentFilter.location.type === "child" && seenUsedComponent.location.type === "child" && eachUsedComponentFilter.location.parentId === seenUsedComponent.location.parentId) {
//             seenInMatchingLocation = true
//         }

//         return seenInMatchingLocation
//     })

//     return usedComponentsInSameLocation
// }

export function getUsedComponentsInSameLocation(seenLocation: usedComponentLocationType, usedComponents: usedComponent[]) {
    const usedComponentsInSameLocation = usedComponents.filter(eachUsedComponentFilter => {
        let seenInMatchingLocation = false

        if (eachUsedComponentFilter.location.type === "header" && seenLocation.type === "header") {
            seenInMatchingLocation = true

        } else if (eachUsedComponentFilter.location.type === "footer" && seenLocation.type === "footer") {
            seenInMatchingLocation = true

        } else if (eachUsedComponentFilter.location.type === "page" && seenLocation.type === "page" && eachUsedComponentFilter.location.pageId === seenLocation.pageId) {
            seenInMatchingLocation = true

        } else if (eachUsedComponentFilter.location.type === "child" && seenLocation.type === "child" && eachUsedComponentFilter.location.parentId === seenLocation.parentId) {
            seenInMatchingLocation = true
        }

        return seenInMatchingLocation
    })

    return usedComponentsInSameLocation
}

export function sortUsedComponentsByOrder(seenUsedComponents: usedComponent[]) {
    let orderedUsedComponents = seenUsedComponents.sort((a, b) => a.order - b.order);
    return orderedUsedComponents
}

export function makeValidPageName(pageName: string) {
    return pageName
        .trim() // Remove leading and trailing spaces
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-zA-Z0-9-_]/g, "") // Remove invalid characters
}
















export function getUsedComponentsImportString(seenUsedComponents: usedComponent[]) {
    const templatesIdsUsedAlready: usedComponent["templateId"][] = []

    const seenResults: (string | null)[] = seenUsedComponents.map(eachUsedComponent => {
        //ensure no duplicates
        if (templatesIdsUsedAlready.includes(eachUsedComponent.templateId)) return null
        templatesIdsUsedAlready.push(eachUsedComponent.templateId)

        const componentName = getUsedComponentsImportName(eachUsedComponent)

        return `import ${componentName} from "@/components/${eachUsedComponent.templateId}/page";`
    }).filter(e => e !== null)

    return seenResults.join("\n")
}

export function getUsedComponentsImportName(seenUsedComponent: usedComponent) {
    let componentName = seenUsedComponent.template !== undefined ? seenUsedComponent.template.name : seenUsedComponent.data.category

    //capitalize the first letter
    componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

    //add on the id - replace any - in the id with _
    componentName = `${componentName}_${seenUsedComponent.templateId.replace(/-/g, "_")}`

    //remove any spaces in the name
    componentName = componentName.replace(/\s+/g, "")

    return componentName
}

export function makeUsedComponentsImplementationString(seenUsedComponents: usedComponent[], originalList: usedComponent[]): string {
    return seenUsedComponents.map(eachUsedComponent => {
        const seenImplementationName = getUsedComponentsImportName(eachUsedComponent)

        let seenPropData = eachUsedComponent.data
        let writablePropData = ""

        //make the style id
        seenPropData.styleId = `____${eachUsedComponent.id}`

        //replace children with this implementation
        if (Object.hasOwn(seenPropData, "children")) {
            //get the children
            const seenChildren = getChildrenUsedComponents(eachUsedComponent.id, originalList)

            //remove the children key value on the object
            // @ts-expect-error type
            delete seenPropData["children"]

            const propsWithoutChildren = seenPropData

            //stringify it
            writablePropData = JSON.stringify(propsWithoutChildren, null, 2)

            //add on the key value pair children and the component implamentation
            const seenChildrenImplementation = makeUsedComponentsImplementationString(seenChildren, originalList)

            //get rid of the closing }
            writablePropData = writablePropData.slice(0, writablePropData.length - 2) + ","

            //write the new values to the string
            writablePropData = writablePropData + `\n "children": (\n<>\n${seenChildrenImplementation}\n</>\n)` + "\n}";
            // writablePropData = writablePropData.replace(/}(\s*)$/, `,\n "children": (\n<>${seenChildrenImplementation}</>\n)` + " }");

        } else {
            //can handle normally
            writablePropData = JSON.stringify(seenPropData, null, 2)
        }

        const componentImplementation = `<${seenImplementationName} 
data={${writablePropData}}
/>`

        return componentImplementation
    }).join("\n\n\n")
}

export function getFontImportStrings(seenFonts: fontsType[]) {
    //handle font imports
    const importListString = seenFonts.map(eachFont => {
        return eachFont.importName
    }).join(", ")
    const importString = `import { ${importListString} } from "next/font/google";`

    //handle font variable
    const variableImplementationString = seenFonts.map(eachFont => {
        //make lower case first letter
        //remove any underscores
        const newName = eachFont.importName.replace(/_/g, '')
            .replace(/^\w/, (c) => c.toLowerCase());

        const subsetsString = eachFont.subsets.map(eachSubSet => `"${eachSubSet}"`).join(", ")

        return `
const ${newName} = ${eachFont.importName}({
    variable: "${eachFont.cssVariableName}",
    subsets: [${subsetsString}],
});`
    }).join("\n\n")

    //handle className
    const classNameImplementationString = seenFonts.map(eachFont => {
        //make lower case first letter
        //remove any underscores
        const newName = eachFont.importName.replace(/_/g, '')
            .replace(/^\w/, (c) => c.toLowerCase());

        const subsetsString = eachFont.subsets.map(eachSubSet => `"${eachSubSet}"`).join(", ")

        return `
const ${newName} = ${eachFont.importName}({
    variable: "${eachFont.cssVariableName}",
    subsets: [${subsetsString}],
});`
    }).join("\n\n")

    const seenString = `
    import { Geist, Geist_Mono } from "next/font/google";

    const geistSans = Geist({
        variable: "--font-geist-sans",
        subsets: ["latin"],
      });
      
      const geistMono = Geist_Mono({
        variable: "--font-geist-mono",
        subsets: ["latin"],
      });
      
      export const metadata: Metadata = {
        title: "\${seenWebsite.title}",
        description: "\${seenWebsite.description}",
      };
      
      export default function RootLayout({
        children,
      }: Readonly<{
        children: React.ReactNode;
      }>) {
        return (
          <html lang="en">
            <body
                className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
            >`

    return {
        fontImportStr: importString,
        variableImplementationStr: variableImplementationString,
        classNameImplementationStr: "",
    }
}
