"use client"
import { flattenObject } from "@/utility/utility";
import React, { HTMLAttributes } from "react";

//build logical elements by tags
//cn be edited
//also put into element groupings - use a simple variable - display it
//focus on content - not global styling for everything - so padding, colors will be on element in style, global slassnames can be added later for fonts 
//each element looks to a main for data - read the type then display it - normal, and array based

//save point

type componentType = {
    id: string,
    type: {
        category: "heros",
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
        category: "containers",
        data: {
            title: string
        }
    },
    elements: elementType[],
    childComponents: string[],
    showMultiple?: true
}

type elementType = {
    id: string;
    type:
    | { tag: "p"; props: HTMLAttributes<HTMLParagraphElement> }
    | { tag: "h1"; props: HTMLAttributes<HTMLHeadingElement> }
    | { tag: "div"; props: HTMLAttributes<HTMLDivElement> };
    children: elementChildType[];
};

type elementChildType =
    | { type: "elementId"; elementId: string } // references another element
    | { type: "text"; content: string } // plain text
    | { type: "component", componentIndex: number } // references another component

const components: componentType[] = [
    {
        id: "nav-001",
        type: {
            category: "navbars",
            data: {
                navItem: "nav item",
                menuItem: "menu item",
                subMenu: ["sub menu item"]
            }
        },
        elements: [
            {
                id: "aaa",
                type: {
                    tag: "div",
                    props: {
                        style: { backgroundColor: "purple", padding: ".5rem" }
                    }
                },
                children: [
                    { type: "elementId", elementId: "ppp" },
                ],
            },
            {
                id: "ppp",
                type: {
                    tag: "p",
                    props: {}
                },
                children: [
                    { type: "text", content: "<<data.navItem>>" }
                ]
            },
        ],
        childComponents: []
    },
    {
        id: "cont-001",
        type: {
            category: "containers",
            data: {
                title: "container title"
            }
        },
        elements: [
            {
                id: "aaa",
                type: {
                    tag: "div",
                    props: {
                        style: { padding: "1rem", backgroundColor: "green" }
                    }
                },
                children: [
                    { type: "elementId", elementId: "h1-title" },
                    { type: "elementId", elementId: "div-sub" }
                ],
            },
            {
                id: "h1-title",
                type: {
                    tag: "h1",
                    props: {
                        className: "font-extrabold",
                        style: {}
                    }
                },
                children: [
                    { type: "text", content: "<<data.title>>" }
                ]
            },
            {
                id: "div-sub",
                type: {
                    tag: "div",
                    props: {
                        style: {}
                    }
                },
                children: [
                    { type: "component", componentIndex: 0 }
                ]
            }
        ],
        childComponents: ["hero-001"]
    },
    {
        id: "hero-001",
        type: {
            category: "heros",
            data: {
                title: "Build Beautiful Websites Effortlessly",
                text: "Squaremax lets you design, customize, and launch your next website in minutes."
            }
        },
        elements: [
            {
                id: "div-outer",
                type: {
                    tag: "div",
                    props: {
                        className: "flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-6 text-center",
                        style: {}
                    }
                },
                children: [
                    { type: "elementId", elementId: "h1-title" },
                    { type: "elementId", elementId: "p-subtext" }
                ],
            },
            {
                id: "h1-title",
                type: {
                    tag: "h1",
                    props: {
                        className: "text-5xl font-extrabold text-gray-900 mb-4 max-w-3xl leading-tight",
                        style: {}
                    }
                },
                children: [
                    { type: "text", content: "<<data.title>>" }
                ]
            },
            {
                id: "p-subtext",
                type: {
                    tag: "p",
                    props: {
                        className: "text-lg text-gray-600 max-w-2xl",
                        style: {}
                    }
                },
                children: [
                    { type: "text", content: "<<data.text>>" }
                ]
            }
        ],
        childComponents: [],
    }
]


//Render components
function renderComponents(componentsToRender: componentType[], allComponents: componentType[], calledByParent?: boolean) {
    return componentsToRender.map(eachComponent => {

        //if component id found in children of other component elements
        let componentIsAChild = false

        allComponents.forEach(eachComponentForEach => {
            eachComponentForEach.childComponents.forEach(eachChildComponentId => {
                if (eachChildComponentId === eachComponent.id) {
                    componentIsAChild = true
                }
            })
        })

        //ensure we don't show the same component multiple times - unless wanted
        if (componentIsAChild && !calledByParent && eachComponent.showMultiple === undefined) {
            return null
        }

        return (
            <React.Fragment key={eachComponent.id}>
                {renderElements(eachComponent.elements, eachComponent, allComponents)}
            </React.Fragment>
        )
    })
}

//Recursive function that builds a React element
function renderElements(elementsToRender: elementType[], pairedComponent: componentType, allComponents: componentType[], calledByParent?: boolean): React.ReactNode {

    return (
        <>
            {elementsToRender.map(eachElementToRender => {
                //if found in children of other elements don't show
                let elementIsAChild = false

                const elementsInComponent = pairedComponent.elements
                elementsInComponent.forEach(eachElementForEach => {
                    eachElementForEach.children.forEach(eachChild => {
                        if (eachChild.type === "elementId" && eachChild.elementId === eachElementToRender.id) {
                            elementIsAChild = true
                        }
                    })
                })

                if (elementIsAChild) {
                    if (!calledByParent) return null
                }

                const resolvedChildren = eachElementToRender.children.map((child, i) => {
                    if (child.type === "text") {
                        let seenContent = child.content

                        const flattenedData = flattenObject(pairedComponent.type.data);
                        // console.log(`$flattenedData`, flattenedData);

                        // Replace placeholders dynamically from flattened data
                        Object.entries(flattenedData).forEach(([path, value]) => {
                            const placeholder = `<<${path}>>`;
                            seenContent = seenContent.replaceAll(placeholder, String(value));
                        });

                        return seenContent;

                    } else if (child.type === "elementId") {
                        const childElement = elementsInComponent.find(eachElementFind => eachElementFind.id === child.elementId);

                        if (childElement !== undefined) {
                            return <React.Fragment key={i}>{renderElements([childElement], pairedComponent, allComponents, true)}</React.Fragment>;
                        }

                        return null;

                    } else if (child.type === "component") {
                        const childComponent = allComponents.find(eachComponent => eachComponent.id === pairedComponent.childComponents[child.componentIndex]);

                        if (childComponent !== undefined) {
                            return (
                                <React.Fragment key={i}>
                                    {renderComponents([childComponent], allComponents, true)}
                                </React.Fragment>
                            );
                        }

                        return null;
                    }

                    return null;
                });

                return React.createElement(eachElementToRender.type.tag, { key: eachElementToRender.id, ...eachElementToRender.type.props }, resolvedChildren);
            })}
        </>
    )
}

export default function Page() {
    return (
        <main>
            {renderComponents(components, components)}
        </main>
    );
}