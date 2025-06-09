"use client"
import React, { useState, useEffect } from 'react'
import styles from "./nav.module.css"
// import "../../page.css"
import Link from 'next/link';
import Logo from '../logo/Logo';
import { useAtom } from 'jotai';
import { jamMode } from '../../lib/atomState';

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
        title: "Bio",
        link: "#",
    },
    {
        title: "Feed",
        link: "",
    },
    {
        title: "Music",
        link: "",
    },
    {
        title: "Store",
        link: "",
    },
    {
        title: "Bag",
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
    return (
        <nav className={`${styles.desktopNav} ${styles.navAll}`} style={{ animation: "opacity 1s 1s both" }}  >
            <Logo />

            <Socials />

            <JamButton />

            <Menu />
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
        <nav className={`${styles.mobileNav} ${styles.navAll}`} style={{ animation: "opacity 1s 1s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: "1rem" }}>
                <Logo />

                <JamButton />

                <span className={`material-symbols-outlined ${styles.menuToggleButton}`} style={{ fontSize: "var(--mediumIconSize)" }} onClick={() => { showingMenuSet(prev => !prev) }}>
                    menu
                </span>
            </div>

            {showingMenu && (
                <Menu showingMenuSet={showingMenuSet} onMobile={true} />
            )}
        </nav>
    )
}

function Menu({ showingMenuSet, onMobile = false }: { showingMenuSet?: React.Dispatch<React.SetStateAction<boolean>>, onMobile?: boolean }) {
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
                <Link className={"slideText"} href={""}><p data-text={"Instagram"}>Instagram</p></Link>
            </li>

            <li style={{ display: "grid" }}>
                <Link className={"slideText"} href={""}><p data-text={"Youtube"}>Youtube</p></Link>
            </li>
        </ul>
    )
}

function JamButton() {
    const [, isJamModeSet] = useAtom(jamMode)


    return (
        <li style={{ display: "grid" }}>
            <div style={{ display: "flex", alignItems: "center" }} onClick={() => {
                isJamModeSet(prev => !prev)
            }}>
                <span className="material-symbols-outlined">
                    music_note
                </span>

                <Link className={"slideText"} href={""}><p data-text={"JAM MODE"}>JAM MODE</p></Link>
            </div>
        </li>
    )

}

export function MenuItem({ menuItem, showingMenuSet }: { menuItem: menuItem, showingMenuSet?: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <li className={styles.menuItem}>
            <div style={{ display: "flex", gap: ".2rem", alignItems: "center" }}>
                <Link className={`slideText ${menuItem.link === "#" && "slideTextBg"}`} href={menuItem.link} onClick={() => {
                    if (showingMenuSet) {
                        showingMenuSet(false)
                    }
                }}><p data-text={menuItem.title}>{menuItem.title}</p></Link>

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
