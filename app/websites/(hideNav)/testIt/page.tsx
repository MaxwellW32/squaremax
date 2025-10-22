"use client"
import React, { HTMLAttributes } from "react";

//build logical elements by tags
//cn be edited
//also put into element groupings - use a simple variable - display it
//focus on content - not global styling for everything - so padding, colors will be on element in style, global slassnames can be added later for fonts 
//each element looks to a main for data - read the type then display it - normal, and array based

type componentType = {
    id: string,
    type:
    {
        type: "heros",
        data: {
            title: string,
            text: string
        }
    } | {
        category: "navbars",
        data: {
            navItem: string,
            menuItem: string,
            subMenu: string[]
        }
    } | {
        type: "containers",
        data: {}
    },
    elements: elementType[],
    childComponents: string[],
}
const components: componentType[] = [
    {
        id: "xqwsdaqertyuiop",
        type: {
            category: "navbars",
            data: {
                navItem: "nav item text",
                menuItem: "menu item text",
                subMenu: ["sub item 1", "sub item 2"]
            }
        },
        elements: [
            {
                id: "123",
                type: {
                    tag: "h1",
                    props: {
                        className: "text-2xl font-bold text-gray-800",
                        style: {}
                    }
                },
                children: [{ type: "native", content: "heading 1 - <<data.navItem>>" }]
            },
            {
                id: "zxcvbnm",
                type: {
                    tag: "div",
                    props: {
                        style: {
                            backgroundColor: "purple", padding: "1rem"
                        }
                    }
                },
                children: [{ type: "id", id: "aaaqwertyuiop" }]
            },
            {
                id: "aaaqwertyuiop",
                type: {
                    tag: "div",
                    props: {
                        style: {
                            backgroundColor: "green", padding: "1rem"
                        }
                    }
                },
                children: [{ type: "id", id: "234" }]
            },
            {
                id: "234",
                type: {
                    tag: "p",
                    props: {}
                },
                children: [{ type: "native", content: "paragraph element 1" }]
            },
            {
                id: "345",
                type: {
                    tag: "p",
                    props: {}
                },
                children: [{ type: "native", content: "paragraph element 2" }]
            },
            {
                id: "456",
                type: {
                    tag: "p",
                    props: {}
                },
                children: [{ type: "native", content: "paragraph element 3" }]
            },
        ],
        childComponents: []
    },
    // {//show child element example
    //     id: "asdfgh",
    //     type: {
    //         category: "navbars",
    //         data: {
    //             navItem: "nav item text",
    //             menuItem: "menu item text",
    //             subMenu: ["sub item 1", "sub item 2"]
    //         }
    //     },
    //     elements: [
    //         {
    //             id: "123",
    //             type: {
    //                 tag: "h1",
    //                 props: {
    //                     className: "text-2xl font-bold text-gray-800",
    //                     style: { marginBottom: "1rem" }
    //                 }
    //             },
    //             children: [{ type: "native", content: "heading - <<data.navItem>>" }]
    //         },
    //         {
    //             id: "234",
    //             type: {
    //                 tag: "div",
    //                 props: {}
    //             },
    //             children: [{ type: "id", id: "345" }]
    //         },
    //         {
    //             id: "345",
    //             type: {
    //                 tag: "div",
    //                 props: {}
    //             },
    //             children: [{ type: "id", id: "456" }] //then add variables
    //         },
    //         {
    //             id: "456",
    //             type: {
    //                 tag: "p",
    //                 props: {}
    //             },
    //             children: [{ type: "native", content: "this is a p element 2x - <<data.subMenu[0]>>" }] //then add variables
    //         },
    //     ],
    //     childComponents: []
    // }
]

//what does multiple text look like in p element




type elementType = {
    id: string;
    type:
    | { tag: "p"; props: HTMLAttributes<HTMLParagraphElement> }
    | { tag: "h1"; props: HTMLAttributes<HTMLHeadingElement> }
    | { tag: "div"; props: HTMLAttributes<HTMLDivElement> };
    children: elementChildType[];
    atRoot?: true,
};

type elementChildType =
    | { type: "id"; id: string } // references another element
    | { type: "native"; content: string }; // plain text

//Recursive function that builds a React element
function renderElements(elementsToRender: elementType[], pairedComponent: componentType, calledByParent?: boolean): React.ReactNode {
    console.log(`$elementsToRender`, elementsToRender);

    return (
        <>
            {elementsToRender.map(eachElement => {
                const { type: ElementType, children } = eachElement;

                //if found in children of other elements don't show
                let elementIsAChild = false

                const elementsInComponent = pairedComponent.elements
                elementsInComponent.forEach(eachElementForEach => {
                    eachElementForEach.children.forEach(eachChild => {
                        if (eachChild.type === "id" && eachChild.id === eachElement.id) {
                            elementIsAChild = true
                        }
                    })
                })

                if (elementIsAChild) {
                    console.log(`$elementIsAChild`, elementIsAChild);
                    console.log(`$eachElement`, eachElement);
                    console.log(`$calledByParent`, calledByParent);

                    // if (!calledByParent) return null
                }

                // if (elementIsAChild && !calledByParent)

                const resolvedChildren = children.map((child, i) => {
                    if (child.type === "native") {
                        let seenContent = child.content

                        const flattenedData = flattenObject(pairedComponent.type.data);
                        // console.log(`$flattenedData`, flattenedData);

                        // Replace placeholders dynamically from flattened data
                        Object.entries(flattenedData).forEach(([path, value]) => {
                            const placeholder = `<<${path}>>`;
                            seenContent = seenContent.replaceAll(placeholder, String(value));
                        });

                        return seenContent;

                    } else if (child.type === "id") {
                        const childElement = elementsToRender.find(eachElementFind => eachElementFind.id === child.id);

                        if (childElement !== undefined) {
                            return <React.Fragment key={i}>{renderElements([childElement], pairedComponent, true)}</React.Fragment>;
                        }

                        return null;
                    }

                    return null;
                });

                return React.createElement(ElementType.tag, { key: eachElement.id, ...ElementType.props }, resolvedChildren);
            })}
        </>
    )
}

function flattenObject(obj: any, prefix = "data", result: Record<string, any> = {}): Record<string, any> {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        const path = `${prefix}.${key}`;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            flattenObject(value, path, result);

        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === "object") {
                    flattenObject(item, `${path}[${index}]`, result);
                } else {
                    result[`${path}[${index}]`] = item;
                }
            });

        } else {
            result[path] = value;
        }
    }

    return result;
}

export default function Page() {
    return (
        <div>
            <p>Page</p>

            {components.map(eachComponent => {
                return (
                    <React.Fragment key={eachComponent.id}>
                        {renderElements(eachComponent.elements, eachComponent)}
                    </React.Fragment>
                )
            })}
        </div>
    );
}