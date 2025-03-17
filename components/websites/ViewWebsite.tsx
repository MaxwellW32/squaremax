"use client"
import styles from "./style.module.css"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { page, usedComponent, website } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import globalDynamicTemplates from '@/utility/globalTemplates'
import { addScopeToCSS, getChildrenUsedComponents, getDescendedUsedComponents, makeValidVariableName, sortUsedComponentsByOrder, } from '@/utility/utility'
import { useSearchParams } from 'next/navigation'
import { templateDataType } from "@/types/templateDataTypes"

export default function ViewWebsite({ websiteFromServer }: { websiteFromServer: website }) {
    const searchParams = useSearchParams();

    const [activePageId, activePageIdSet] = useState<page["id"] | undefined>(undefined)
    const activePage = useMemo<page | undefined>(() => {
        if (websiteFromServer.pages === undefined || activePageId === undefined) return undefined

        const foundPage = websiteFromServer.pages.find(eachPageFind => eachPageFind.id === activePageId)
        if (foundPage === undefined) return undefined

        return foundPage
    }, [websiteFromServer.pages, activePageId])
    const renderedUsedComponentsObj = useRef<{
        [key: string]: React.ComponentType<{
            data: templateDataType;
        }>
    }>({})

    const [usedComponentsBuilt, usedComponentsBuiltSet] = useState(false)

    //get usedComponents on the active page
    const pageUsedComponents = useMemo(() => {
        if (websiteFromServer.usedComponents === undefined || activePage === undefined) return []

        const usedComponentsInPage = websiteFromServer.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "page" && eachUsedComponentFilter.location.pageId === activePage.id
        })

        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInPage)
        return sortedUsedComponents

    }, [websiteFromServer.usedComponents, activePage])

    const headerUsedComponents = useMemo(() => {
        if (websiteFromServer.usedComponents === undefined) return []

        const usedComponentsInHeader = websiteFromServer.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "header"
        })
        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInHeader)
        return sortedUsedComponents

    }, [websiteFromServer.usedComponents])

    const footerUsedComponents = useMemo(() => {
        if (websiteFromServer.usedComponents === undefined) return []

        const usedComponentsInFooter = websiteFromServer.usedComponents.filter(eachUsedComponentFilter => {
            return eachUsedComponentFilter.location.type === "footer"
        })
        const sortedUsedComponents = sortUsedComponentsByOrder(usedComponentsInFooter)
        return sortedUsedComponents

    }, [websiteFromServer.usedComponents])

    // respond to changes from server - build usedComponents seen there
    useEffect(() => {
        const start = async () => {
            try {
                if (activePage === undefined) return

                //replace original
                if (websiteFromServer.usedComponents !== undefined) {
                    websiteFromServer.usedComponents = await renderUsedComponentsInUse(websiteFromServer.usedComponents, activePage.id)
                }

            } catch (error) {
                consoleAndToastError(error)
            }
        }

        start()
    }, [websiteFromServer, activePage])

    //load up fonts dynamically
    useEffect(() => {
        const linkElements = websiteFromServer.fonts.map(eachFont => {
            const link = document.createElement('link')

            //replace underscores with + for google fonts api
            const fontImportNameForApi = eachFont.importName.replace(/ /g, '+')

            link.rel = 'stylesheet'
            link.href = `https://fonts.googleapis.com/css?family=${fontImportNameForApi}&subset=${eachFont.subsets.join(", ")}`

            document.head.appendChild(link);
            const camelCaseName = makeValidVariableName(eachFont.importName)

            link.onload = () => {
                // Set the font family as a CSS variable
                document.documentElement.style.setProperty(`--font-${camelCaseName}`, `${eachFont.importName}`);
                // href="https://fonts.googleapis.com/css?family=Tangerine">
            };

            return link
        })

        return () => {
            linkElements.map(eachLinkEl => {
                document.head.removeChild(eachLinkEl);
            })
        };
    }, [websiteFromServer.fonts])

    //load up page selection on page load
    useEffect(() => {
        if (websiteFromServer.pages === undefined) return

        const seenPageName = searchParams.get("page")
        if (seenPageName === null) return

        const seenPage = websiteFromServer.pages.find(eachPage => eachPage.link === seenPageName)
        if (seenPage === undefined) return

        activePageIdSet(seenPage.id)
    }, [])


    async function buildUsedComponents(sentUsedComponents: usedComponent[]) {
        usedComponentsBuiltSet(false)

        //ensure all can be rendered
        await Promise.all(
            sentUsedComponents.map(async eachUsedComponent => {
                //if doesnt exist in renderObj then render it
                if (renderedUsedComponentsObj.current[eachUsedComponent.templateId] === undefined) {
                    const seenResponse = await globalDynamicTemplates(eachUsedComponent.templateId)

                    //assign builds to renderObj
                    if (seenResponse !== undefined) {
                        renderedUsedComponentsObj.current[eachUsedComponent.templateId] = seenResponse()

                    } else {
                        //log component id not found
                        console.log(`$usedComponent template id not found`, eachUsedComponent.templateId);
                    }
                }

                return eachUsedComponent
            }))

        usedComponentsBuiltSet(true)
    }
    async function renderUsedComponentsInUse(seenUsedComponents: usedComponent[], seenActivePageId?: page["id"]) {
        //get the header, footer and usedComponents on this page
        const baseUsedComponentsInUse = seenUsedComponents.filter(eachFilterUsedComponent => {
            return eachFilterUsedComponent.location.type === "header" || eachFilterUsedComponent.location.type === "footer" || (seenActivePageId !== undefined && eachFilterUsedComponent.location.type === "page" && eachFilterUsedComponent.location.pageId === seenActivePageId)
        })

        //then get all of the base components children recursively
        const baseUsedComponentsInUseIds = baseUsedComponentsInUse.map(eachBaseUsedComponentInUseId => eachBaseUsedComponentInUseId.id)
        const baseUsedComponentsDecendants: usedComponent[] = getDescendedUsedComponents(baseUsedComponentsInUseIds, seenUsedComponents)

        const totalUsedComponentsToRender = [...baseUsedComponentsInUse, ...baseUsedComponentsDecendants]

        //ensure can be rendered
        await buildUsedComponents(totalUsedComponentsToRender)

        //add back onto the original list
        const updatedUsedComponents = seenUsedComponents.map(eachUsedComponent => {
            const seenUpdatedUsedComponent = totalUsedComponentsToRender.find(eachBuiltComponentFind => eachBuiltComponentFind.id === eachUsedComponent.id)
            if (seenUpdatedUsedComponent !== undefined) return seenUpdatedUsedComponent

            //return original usedComponent
            return eachUsedComponent
        })

        //return the exact list with some usedComponents built/added to render obj
        return updatedUsedComponents
    }

    return (
        <main className={styles.main}>
            <style>{addScopeToCSS(websiteFromServer.globalCss, websiteFromServer.id)}</style>

            {usedComponentsBuilt && websiteFromServer.usedComponents !== undefined && (
                <>
                    <RenderComponentTree seenUsedComponents={headerUsedComponents} originalUsedComponentsList={websiteFromServer.usedComponents} renderedUsedComponentsObj={renderedUsedComponentsObj} />

                    {activePage !== undefined && (
                        <RenderComponentTree seenUsedComponents={pageUsedComponents} originalUsedComponentsList={websiteFromServer.usedComponents} renderedUsedComponentsObj={renderedUsedComponentsObj} />
                    )}

                    <RenderComponentTree seenUsedComponents={footerUsedComponents} originalUsedComponentsList={websiteFromServer.usedComponents} renderedUsedComponentsObj={renderedUsedComponentsObj} />
                </>
            )}
        </main>
    )
}

function RenderComponentTree({
    seenUsedComponents, originalUsedComponentsList, renderedUsedComponentsObj
}: {
    seenUsedComponents: usedComponent[], originalUsedComponentsList: usedComponent[], renderedUsedComponentsObj: React.MutableRefObject<{ [key: string]: React.ComponentType<{ data: templateDataType; }> }>
}) {

    return (
        <>
            {seenUsedComponents.map(eachUsedComponent => {
                const ComponentToRender = renderedUsedComponentsObj.current[eachUsedComponent.templateId];
                if (ComponentToRender === undefined) {
                    console.error(
                        `Component with ID ${eachUsedComponent.templateId} is not in renderedComponentsObj.`,
                        renderedUsedComponentsObj.current
                    );
                    return null;
                }

                const scopedCss = addScopeToCSS(eachUsedComponent.css, eachUsedComponent.id);

                const seenChildren: usedComponent[] = getChildrenUsedComponents(eachUsedComponent.id, originalUsedComponentsList)

                //order the children
                const seenOrderedChildren = sortUsedComponentsByOrder(seenChildren)

                // Recursively render child components
                const childJSX: React.JSX.Element | null = seenOrderedChildren.length > 0 ? <RenderComponentTree seenUsedComponents={seenOrderedChildren} originalUsedComponentsList={originalUsedComponentsList} renderedUsedComponentsObj={renderedUsedComponentsObj} /> : null;

                //apply scoped styling starter value
                eachUsedComponent.data.styleId = `____${eachUsedComponent.id}`

                // If the component is a container, pass children as a prop
                //handle chuldren for different categories
                if (childJSX !== null) {
                    if (Object.hasOwn(eachUsedComponent.data, "children")) {
                        //@ts-expect-error types
                        eachUsedComponent.data.children = childJSX
                    }
                }

                let seenElementId: string | undefined = undefined
                let seenElementClassNames: string | undefined = undefined

                //modify id and className of mainElProps render
                if (eachUsedComponent.data.mainElProps.className !== undefined) {
                    const seenClasses = eachUsedComponent.data.mainElProps.className.split(" ")
                    seenElementClassNames = seenClasses.map(eachClass => `${eachClass}____${eachUsedComponent.websiteId}`).join(" ")
                }

                if (eachUsedComponent.data.mainElProps.id !== undefined) {
                    seenElementId = `${eachUsedComponent.data.mainElProps.id}____${eachUsedComponent.websiteId}`
                }

                return (
                    <React.Fragment key={eachUsedComponent.id}>
                        <style>{scopedCss}</style>

                        {/* Render the main component with injected props */}
                        <ComponentToRender data={{ ...eachUsedComponent.data, mainElProps: { ...eachUsedComponent.data.mainElProps, id: seenElementId, className: seenElementClassNames } }} />
                    </React.Fragment>
                );
            })}
        </>
    )
}