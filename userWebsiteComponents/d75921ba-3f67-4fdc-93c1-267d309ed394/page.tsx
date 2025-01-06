import { navBarsType } from '@/types'
import Link from 'next/link'
import React from 'react'
import "./page.css"

export default function Nav({ data }: { data: navBarsType }) {

    return (
        <nav className={"nav"}>
            {data.menu.map((eachMenuItem, eachMenuItemIndex) => {
                return (
                    <li key={eachMenuItemIndex}>
                        <Link href={eachMenuItem.link}>{eachMenuItem.label}</Link>

                        {eachMenuItem.subMenu !== undefined && eachMenuItem.subMenu.length > 0 && (
                            <ul>
                                {eachMenuItem.subMenu.map((eachSubMenuItem, eachSubMenuItemIndex) => {

                                    return (
                                        <li key={eachSubMenuItemIndex}>
                                            <Link href={eachSubMenuItem.link}>{eachSubMenuItem.label}</Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </li>
                )
            })}
        </nav>
    )
}
