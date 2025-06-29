"use client"
import { useEffect, useState } from "react"
import styles from "./page.module.css"
import { projectsData } from "@/lib/projectsData"
import Link from "next/link"
import { controlNavView } from "@/utility/utility"
import ScreenHide from "@/components/screenHide/ScreenHide"
import ShowMore from "@/components/showMore/ShowMore"
import { useRouter, usePathname, useParams } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const pathName = usePathname();

    const [navHidden, navHiddenSet] = useState(false)

    const [navHiddenOnce, navHiddenOnceSet] = useState(false)
    const [showingMenu, showingMenuSet] = useState(false)

    const [currentIndex, currentIndexSet] = useState(() => {
        let currentIndex = projectsData.findIndex(eachProject => eachProject.slug === params.slug)
        if (currentIndex < 0) currentIndex = 0

        return currentIndex
    })

    //hide navs
    useEffect(() => {
        //hide
        controlNavView(false)

        navHiddenOnceSet(true)
        navHiddenSet(true)

        return () => {
            //show
            controlNavView(true)
            navHiddenSet(false)
        }
    }, [])

    //update pathname
    useEffect(() => {
        const newSlug = projectsData[currentIndex].slug;
        router.push(pathName.replace(params.slug, newSlug));
    }, [currentIndex])

    const activeProject = projectsData[currentIndex]

    const next = () => {
        currentIndexSet(prevIndex => {
            let newIndex = prevIndex + 1

            if (newIndex > projectsData.length - 1) {
                newIndex = 0
            }

            return newIndex
        })
    }

    const prev = () => {
        currentIndexSet(prevIndex => {
            let newIndex = prevIndex - 1

            if (newIndex < 0) {
                newIndex = projectsData.length - 1
            }

            return newIndex
        })
    }

    return (
        <>
            <ScreenHide hidden={navHiddenOnce}
                style={{
                    backgroundColor: "var(--bg1)"
                }}
            />

            {navHiddenOnce && (
                <>
                    <iframe src={`https://maxwebsiteprojects.vercel.app/${activeProject.slug}`} width={window.innerWidth} height={window.innerHeight} />

                    <div className={styles.menu} style={{ position: "fixed", bottom: 0, left: "50%", translate: "-50%", width: showingMenu ? "100%" : "", display: "grid", justifyItems: "center", zIndex: 9999 }}>
                        <span className={`material-symbols-outlined ${styles.menuButton}`} style={{ opacity: showingMenu ? 1 : "", marginBottom: "1rem", fontSize: "2.5rem", color: "#fff" }}
                            onClick={() => {
                                showingMenuSet(prev => !prev);

                                if (!navHidden) {
                                    //hide
                                    controlNavView(false)
                                    navHiddenSet(true)
                                }
                            }}>
                            widgets
                        </span>

                        {showingMenu && (
                            <div style={{ backgroundColor: "#000", color: "#fff", padding: "1rem", display: "grid", gap: ".5rem", justifyItems: "center", width: "min(800px, 100%)" }}>
                                <span className="material-symbols-outlined" style={{ justifySelf: "flex-end", fontSize: "2.5rem" }}
                                    onClick={() => {
                                        if (navHidden) {
                                            //show
                                            controlNavView(true)
                                            navHiddenSet(false)

                                            window.scrollTo({ top: 0 })

                                        } else {
                                            //hide
                                            controlNavView(false)
                                            navHiddenSet(true)
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
                                    <button className="button1"
                                        onClick={prev}
                                    >Prev</button>

                                    <button className="button1"
                                        onClick={next}
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
