"use client"
import React, { useState, useEffect } from 'react'
import styles from "./nav.module.css"
import Link from 'next/link';
import Logo from '../logo/Logo';
import Cart from '../cart/Cart';

export type menuItem = {
    title: string;
    link: string;
    subMenu?: subMenuItem[];
}

export type subMenuItem = {
    title: string;
    link: string;
}

const menuItems: menuItem[] = [
    {
        title: "Home",
        link: "#",
    },
    {
        title: "Our Menus",
        link: "",
    },
    {
        title: "About",
        link: "",
    },
    {
        title: "Order Online",
        link: "",
    },
    {
        title: "Find Us",
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
        <nav className={`${styles.desktopNav} ${scrollHitTarget && styles.scrolling} ${styles.navAll}`}>
            <Menu menuItems={menuItems.slice(0, 3)} />

            <Logo />

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Menu menuItems={menuItems.slice(3, 5)} />

                <Socials />

                <Cart />
            </div>
        </nav>
    )
}

function MobileNav() {
    const [showingMenu, showingMenuSet] = useState(false)

    //stop scrolling on select
    useEffect(() => {
        if (showingMenu) {
            const body = document.querySelector("body") as HTMLBodyElement
            body.style.overflow = "hidden"
        } else {
            const body = document.querySelector("body") as HTMLBodyElement
            body.style.overflow = "auto"
        }
    }, [showingMenu])

    return (
        <nav className={`${styles.mobileNav} ${styles.navAll}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
                <Logo />

                <Cart />

                <span className={`material-symbols-outlined ${styles.menuToggleButton}`} style={{ fontSize: "var(--mediumIconSize)" }} onClick={() => { showingMenuSet(prev => !prev) }}>
                    menu
                </span>
            </div>

            {showingMenu && (
                <Menu menuItems={menuItems} showingMenuSet={showingMenuSet} onMobile={true} />
            )}
        </nav>
    )
}

function Menu({ showingMenuSet, onMobile = false, menuItems }: { menuItems: menuItem[], showingMenuSet?: React.Dispatch<React.SetStateAction<boolean>>, onMobile?: boolean }) {
    return (
        <ul className={styles.menu}>
            {onMobile && (
                <span style={{ justifySelf: "flex-end" }} className="material-symbols-outlined"
                    onClick={() => {
                        if (showingMenuSet) {
                            showingMenuSet(false)
                        }
                    }}
                >
                    close
                </span>
            )}

            {menuItems.map((eachMenuItem, eachMenuItemIndex) => {
                return (
                    <MenuItem key={eachMenuItemIndex} menuItem={eachMenuItem} showingMenuSet={showingMenuSet} />
                )
            })}

            {onMobile && (
                <li className={styles.menuItem}>
                    <Socials />
                </li>
            )}
        </ul>
    )
}

function Socials() {
    return (
        <ul style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <li style={{ display: "grid" }}>
                <Link href={""}><span className="material-symbols-outlined"> share </span></Link>
            </li>
        </ul>
    )
}

export function MenuItem({ menuItem, showingMenuSet }: { menuItem: menuItem, showingMenuSet?: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <li className={styles.menuItem}>
            <div style={{ display: "flex", gap: ".2rem", alignItems: "center" }}>
                <Link href={menuItem.link} onClick={() => {
                    if (showingMenuSet) {
                        showingMenuSet(false)
                    }
                }}>{menuItem.title}</Link>

                {menuItem.subMenu && (
                    <span className="material-symbols-outlined">
                        arrow_drop_down
                    </span>
                )}
            </div>

            {menuItem.subMenu && (
                <ul className={styles.subMenu}>
                    {menuItem.subMenu.map((eachSubMenuItem, eachSubMenuItemIndex) => {
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
}
