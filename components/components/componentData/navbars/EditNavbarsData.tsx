"use client"
import { componentDataType, navBarsType, pagesToComponent } from '@/types'
import React from 'react'

export default function EditNavbarsData({ data, activePagesToComponent, handlePropsChange }: { data: navBarsType, activePagesToComponent: pagesToComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) => void }) {

    return (
        <form>
            <ul>
                {data.menu.map((eachMenuItem, eachMenuItemIndex) => {
                    return (
                        <li key={eachMenuItemIndex}>
                            <input type='text' value={eachMenuItem.label} placeholder='Enter label'
                                onChange={(e) => {
                                    data.menu[eachMenuItemIndex].label = e.target.value

                                    handlePropsChange(data, activePagesToComponent)
                                }}
                            />

                            <input type='text' value={eachMenuItem.link} placeholder='Enter link'
                                onChange={(e) => {
                                    data.menu[eachMenuItemIndex].link = e.target.value

                                    handlePropsChange(data, activePagesToComponent)
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

                                                    handlePropsChange(data, activePagesToComponent)
                                                }}
                                            />

                                            <input type='text' value={eachSubMenuItem.link} placeholder='Enter subMenu item link'
                                                onChange={(e) => {
                                                    if (data.menu[eachMenuItemIndex].subMenu === undefined) return null
                                                    data.menu[eachMenuItemIndex].subMenu[eachSubMenuItemIndex].link = e.target.value

                                                    handlePropsChange(data, activePagesToComponent)
                                                }}
                                            />
                                        </li>
                                    )
                                })}

                                <button className='mainButton'
                                    onClick={() => {
                                        if (data.menu[eachMenuItemIndex].subMenu === undefined) return null

                                        const newSubMenuItem: navBarsType["menu"][number]["subMenu"] = [{
                                            label: "",
                                            link: "",
                                        }]

                                        if (newSubMenuItem === undefined) return null

                                        data.menu[eachMenuItemIndex].subMenu = [...data.menu[eachMenuItemIndex].subMenu, ...newSubMenuItem]

                                        handlePropsChange(data, activePagesToComponent)
                                    }}
                                >Add Sub Menu</button>
                            </ul>
                        </li>
                    )
                })}
            </ul>

            <button className='mainButton'
                onClick={() => {
                    const newMenuItem: navBarsType["menu"][number] = {
                        label: "",
                        link: "",
                    }

                    data.menu = [...data.menu, newMenuItem]

                    handlePropsChange(data, activePagesToComponent)
                }}
            >Add Menu</button>
        </form>
    )
}
