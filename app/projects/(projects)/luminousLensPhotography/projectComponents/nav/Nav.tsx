"use client"
import React, { useState, useEffect } from 'react'
import styles from "./nav.module.css"
import Link from 'next/link';
import Logo from '../logo/Logo';

type menuItem = {
    title: string;
    link: string;
    subMenu?: subMenuItem[];
}

type subMenuItem = {
    title: string;
    link: string;
}

const menuItems: menuItem[] = [
    {
        title: "Home",
        link: "",
    },
    {
        title: "About Us",
        link: "",
    },
    {
        title: "Services",
        link: "",
    },
    {
        title: "Gallery",
        link: "",
    },
    {
        title: "Blog",
        link: "",
        subMenu: [
            {
                title: "Blog Page",
                link: "",
            },
            {
                title: "Post Page",
                link: "",
            },
        ]
    },
    {
        title: "Contact",
        link: "",
    }
]

export default function Nav() {

    return (
        <>
            <DesktopNav />
            <MobileNav />
        </>
    )
}

function DesktopNav() {
    const [scrollHitTarget, scrollHitTargetSet] = useState(false)

    useEffect(() => {
        window.addEventListener("scroll", handleWindowScroll)

        return () => {
            window.removeEventListener("scroll", handleWindowScroll)
        }
    }, [])

    function handleWindowScroll() {
        const scrollY = window.scrollY

        if (scrollY > 70) {
            scrollHitTargetSet(true)
        } else {
            scrollHitTargetSet(false)
        }
    }

    return (
        <nav className={`${styles.desktopNav} ${styles.navAll}`} style={{ backgroundColor: scrollHitTarget ? "#000" : "" }}>
            <Logo />

            <Menu />
        </nav>
    )
}

function MobileNav() {
    const [showingMenu, showingMenuSet] = useState(false)

    return (
        <nav className={`${styles.mobileNav} ${styles.navAll}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: "1rem" }}>
                <Logo />

                <span className={`material-symbols-outlined ${styles.menuToggleButton}`} style={{ fontSize: "var(--mediumIconSize)" }} onClick={() => { showingMenuSet(prev => !prev) }}>
                    menu
                </span>
            </div>

            {showingMenu && (
                <Menu showingMenuSet={showingMenuSet} />
            )}
        </nav>
    )
}

function Menu({ showingMenuSet }: { showingMenuSet?: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <ul className={styles.menu}>
            {menuItems.map((eachMenuItem, eachMenuItemIndex) => {
                return (
                    <li key={eachMenuItemIndex} className={styles.menuItem}>
                        <div style={{ display: "flex", gap: ".2rem" }}>
                            <Link href={eachMenuItem.link} onClick={() => {
                                if (showingMenuSet) {
                                    showingMenuSet(false)
                                }
                            }}>{eachMenuItem.title}</Link>

                            {eachMenuItem.subMenu && (
                                <span className="material-symbols-outlined">
                                    arrow_drop_down
                                </span>
                            )}
                        </div>

                        {eachMenuItem.subMenu && (
                            <ul className={styles.subMenu}>
                                {eachMenuItem.subMenu.map((eachSubMenuItem, eachSubMenuItemIndex) => {
                                    return (
                                        <li key={eachSubMenuItemIndex} className={styles.subMenuItem}>
                                            <Link href={eachSubMenuItem.link} onClick={() => {
                                                if (showingMenuSet) {
                                                    showingMenuSet(false)
                                                }
                                            }}>{eachSubMenuItem.title}</Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}

