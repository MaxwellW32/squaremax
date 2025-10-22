"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import defaultImage2 from "@/public/defaultImage2.jpg"
import styles from "./styles.module.css"
import SignOutButton from "../SignOutButton"
import { Session } from "next-auth"
import toast from "react-hot-toast"
import { websitetype } from "@/types"
import { getWebsitesFromUser } from "@/serverFunctions/handleWebsites"
import { consoleAndToastError } from "@/useful/consoleErrorWithToast"
import Link from "next/link"
import { usePathname } from 'next/navigation'

export default function MoreNavOptions({ session }: { session: Session }) {
    const [showingNav, showingNavSet] = useState(false)

    const [seenUserWebsites, seenUserWebsitesSet] = useState<websitetype[] | undefined>(undefined)
    const pathname = usePathname()

    //search
    useEffect(() => {
        try {
            const search = async () => {
                seenUserWebsitesSet(await getWebsitesFromUser({}, 5))
            }
            search()

        } catch (error) {
            consoleAndToastError(error)
        }
    }, [])

    return (
        <div className={styles.contDiv}>
            <Image alt="logo" src={session.user.image ?? defaultImage2} width={50} height={50} style={{ objectFit: "cover" }}
                onClick={() => { showingNavSet(prev => !prev) }}
            />

            {showingNav && (
                <ul className={styles.moreItemsMenu}
                    onClick={() => { showingNavSet(false) }}
                >
                    <Link href={`/websites`} style={{ justifySelf: "flex-end" }}>
                        <button className='button3'>manage websites</button>
                    </Link>

                    {seenUserWebsites !== undefined && (
                        <>
                            {seenUserWebsites.map(eachWebsite => {
                                const foundInUrl = pathname.includes(eachWebsite.id)

                                return (
                                    <li className={styles.moreIntemsItem} key={eachWebsite.id} >
                                        <Link href={`/websites/edit/${eachWebsite.id}`} style={{ color: foundInUrl ? "var(--color1)" : "" }}>
                                            {eachWebsite.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </>
                    )}

                    <li className={styles.moreIntemsItem}>account</li>

                    <li className={styles.moreIntemsItem}>settings</li>

                    <li className={styles.moreIntemsItem}>
                        <button style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacingS)" }}
                            onClick={(e) => {
                                e.stopPropagation()

                                navigator.clipboard.writeText(session.user.id);

                                toast.success("user id copied to clipboard")
                            }}
                        >
                            Copy user id <svg style={{ fill: "var(--shade2)" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z" /></svg>
                        </button>
                    </li>

                    <li className={styles.moreIntemsItem}>
                        <SignOutButton />
                    </li>
                </ul>
            )}
        </div>
    )
}