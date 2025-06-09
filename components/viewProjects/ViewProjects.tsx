"use client"
import { useEffect, useMemo, useState } from "react"
import styles from "./style.module.css"
import { usePathname } from 'next/navigation'
import { projectsData } from "@/lib/projectsData"
import Link from "next/link"
import ShowMore from "../showMore/ShowMore"

export default function ViewProjects({ children, ...elProps }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    const pathname = usePathname()

    const [navHidden, navHiddenSet] = useState(false)

    const [navHiddenOnce, navHiddenOnceSet] = useState(false)
    const [showingMenu, showingMenuSet] = useState(false)

    //hide navs
    useEffect(() => {
        controlNav("hide")

        navHiddenOnceSet(true)

        return () => {
            controlNav("show")
        }
    }, [])

    function controlNav(option: "hide" | "show") {
        const mainNav = document.getElementById(`mainNav`)
        const footerNav = document.getElementById(`footerNav`)

        if (option === "hide") {
            if (mainNav) {
                mainNav.classList.add("hide")
            }

            if (footerNav) {
                footerNav.classList.add("hide")
            }
            navHiddenSet(true)


        } else {
            if (mainNav) {
                mainNav.classList.remove("hide")
            }

            if (footerNav) {
                footerNav.classList.remove("hide")
            }
            navHiddenSet(false)
        }
    }

    const currentIndex = useMemo(() => {
        const pathnameSplit = pathname.split("/")
        const seenSlug = pathnameSplit[pathnameSplit.length - 1]

        let currentIndex = projectsData.findIndex(eachProject => eachProject.slug === seenSlug)
        if (currentIndex < 0) currentIndex = 0

        return currentIndex
    }, [pathname])

    const next = () => {
        let newIndex = currentIndex + 1

        if (newIndex > projectsData.length - 1) {
            newIndex = 0
        }

        return newIndex
    }

    const prev = () => {
        let newIndex = currentIndex - 1

        if (newIndex < 0) {
            newIndex = projectsData.length - 1
        }

        return newIndex
    }

    return (
        <>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "#000", zIndex: 9999 }} className={`${navHiddenOnce ? styles.fadeOut : ""}`}></div>

            <div {...elProps} style={{ display: !navHiddenOnce ? "none" : "", position: "relative", ...elProps?.style }} >
                {children}

                <div className={styles.menu} style={{ position: "fixed", bottom: 0, left: "50%", translate: "-50%", width: showingMenu ? "100%" : "", display: "grid", justifyItems: "center", zIndex: 9999 }}>
                    <span className={`material-symbols-outlined ${styles.menuButton}`} style={{ opacity: showingMenu ? 1 : "", marginBottom: "1rem", fontSize: "2.5rem", color: "#fff" }}
                        onClick={() => {
                            showingMenuSet(prev => !prev);
                            if (!navHidden) { controlNav("hide") }
                        }}>
                        widgets
                    </span>

                    {showingMenu && (
                        <div style={{ backgroundColor: "#000", color: "#fff", padding: "1rem", display: "grid", gap: ".5rem", justifyItems: "center", width: "min(800px, 100%)" }}>
                            <span className="material-symbols-outlined" style={{ justifySelf: "flex-end", fontSize: "2.5rem" }}
                                onClick={() => {
                                    if (navHidden) {
                                        controlNav("show")
                                        window.scrollTo({ top: 0 })
                                    } else {
                                        controlNav("hide")
                                    }
                                }}>
                                home
                            </span>

                            <p>{projectsData[currentIndex].type}</p>

                            <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold" }}>{projectsData[currentIndex].name}</h1>

                            {projectsData[currentIndex].inspiration && (
                                <ShowMore label="Design Inspiration From" content={
                                    <Link href={projectsData[currentIndex].inspiration!} target="_blank">{projectsData[currentIndex].inspiration}</Link>
                                } />
                            )}

                            <div className={styles.buttonCont} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: ".5rem" }}>
                                <Link href={`/projects/${projectsData[prev()].slug}`}>
                                    <button className="mainButton">Prev</button>
                                </Link>

                                <Link href={`/projects/${projectsData[next()].slug}`}>
                                    <button className="mainButton">Next</button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
