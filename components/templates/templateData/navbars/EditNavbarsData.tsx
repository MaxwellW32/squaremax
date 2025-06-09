"use client"
import RecursiveForm from '@/components/recursiveForm/RecursiveForm'
import { usedComponent } from '@/types'
import { navBarsDataType, templateDataType, updateNavBarsDataSchema, updateNavBarsDataType } from '@/types/templateDataTypes'
import React from 'react'

export default function EditNavbarsData({ data, activeUsedComponent, handlePropsChange }: { data: navBarsDataType, activeUsedComponent: usedComponent, handlePropsChange: (newPropsObj: templateDataType, sentUsedComponent: usedComponent) => void }) {

    //make components to edit the different types of reusable data
    //make recusrive component to edit nav menus
    return (
        <form action={() => { }}>
            <RecursiveForm
                seenForm={updateNavBarsDataSchema.parse(data)}
                seenMoreFormInfo={{
                    "menu/0/link/title": {
                        returnToNull: true
                    },
                    "menu/0/link/target": {
                        returnToNull: true
                    },
                    "menu/0/subMenu/0/link/title": {
                        returnToNull: true
                    },
                    "menu/0/subMenu/0/link/target": {
                        returnToNull: true
                    },
                }}
                seenArrayStarters={{
                    "menu": {
                        title: "",
                        link: {
                            title: null,
                            url: "",
                            target: null,
                        },
                        subMenu: [],
                    },
                    "menu/0/subMenu": {
                        title: "",
                        link: {
                            title: null,
                            url: "",
                            target: null,
                        },
                        subMenu: [],
                    },
                    "menu/0/subMenu/0/subMenu": {
                        title: "",
                        link: {
                            title: null,
                            url: "",
                            target: null,
                        },
                        subMenu: [],
                    },
                    "logos": {
                        src: "",
                        alt: "",
                        priority: null,
                        size: {
                            type: "noFill",
                            width: 300,
                            height: 300,
                        },
                        link: null
                    },
                    "contactInfo": {
                        title: "",
                        link: null,
                        image: null,
                    },
                    "socialMedia": {
                        title: "",
                        link: null,
                        image: null,
                    },
                    "supportingImages": {
                        src: "",
                        alt: "",
                        priority: null,
                        size: {
                            type: "noFill",
                            width: 300,
                            height: 300,
                        },
                        link: null
                    },
                }}
                seenNullishStarters={{
                    "menu/0/link/title": "",
                    "menu/0/link/target": "",
                    "menu/0/subMenu/0/link/title": "",
                    "menu/0/subMenu/0/link/target": "",
                }}
                seenSchema={updateNavBarsDataSchema}
                updater={seenForm => {

                    const newUpdatedNavBarData: navBarsDataType = {
                        ...data,
                        ...(seenForm as updateNavBarsDataType)
                    }

                    handlePropsChange(newUpdatedNavBarData, activeUsedComponent)
                }}
            />

            {/* <ul>
                {data.menu.map((eachMenuItem, eachMenuItemIndex) => {
                    return (
                        <li key={eachMenuItemIndex}>
                            <input type='text' value={eachMenuItem.label} placeholder='Enter label'
                                onChange={(e) => {
                                    data.menu[eachMenuItemIndex].label = e.target.value

                                    handlePropsChange(data, activeUsedComponent)
                                }}
                            />

                            <input type='text' value={eachMenuItem.link} placeholder='Enter link'
                                onChange={(e) => {
                                    data.menu[eachMenuItemIndex].link = e.target.value

                                    handlePropsChange(data, activeUsedComponent)
                                }}
                            />

                            <ul>
                                {eachMenuItem.subMenu !== undefined && eachMenuItem.subMenu.map((eachSubMenuItem, eachSubMenuItemIndex) => {
                                    return (
                                        <li key={eachSubMenuItemIndex}>
                                            <input type='text' value={eachSubMenuItem.label} placeholder='Enter subMenu item label'
                                                onChange={(e) => {
                                                    if (data.menu[eachMenuItemIndex].subMenu === undefined) return null
                                                    data.menu[eachMenuItemIndex].subMenu[eachSubMenuItemIndex].label = e.target.value

                                                    handlePropsChange(data, activeUsedComponent)
                                                }}
                                            />

                                            <input type='text' value={eachSubMenuItem.link} placeholder='Enter subMenu item link'
                                                onChange={(e) => {
                                                    if (data.menu[eachMenuItemIndex].subMenu === undefined) return null
                                                    data.menu[eachMenuItemIndex].subMenu[eachSubMenuItemIndex].link = e.target.value

                                                    handlePropsChange(data, activeUsedComponent)
                                                }}
                                            />
                                        </li>
                                    )
                                })}

                                <button className='button1'
                                    onClick={() => {
                                        if (data.menu[eachMenuItemIndex].subMenu === undefined) return null

                                        const newSubMenuItem: navBarsDataType["menu"][number]["subMenu"] = [{
                                            label: "",
                                            link: "",
                                        }]

                                        if (newSubMenuItem === undefined) return null

                                        data.menu[eachMenuItemIndex].subMenu = [...data.menu[eachMenuItemIndex].subMenu, ...newSubMenuItem]

                                        handlePropsChange(data, activeUsedComponent)
                                    }}
                                >Add Sub Menu</button>
                            </ul>
                        </li>
                    )
                })}
            </ul>

            <button className='button1'
                onClick={() => {
                    const newMenuItem: navBarsDataType["menu"][number] = {
                        label: "",
                        link: "",
                    }

                    data.menu = [...data.menu, newMenuItem]

                    handlePropsChange(data, activeUsedComponent)
                }}
            >Add Menu</button> */}
        </form>
    )
}
