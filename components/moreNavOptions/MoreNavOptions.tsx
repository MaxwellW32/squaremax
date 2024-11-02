"use client"
import Image from "next/image"
import { useState } from "react"
import defaultImage2 from "@/public/defaultImage2.jpg"
import styles from "./styles.module.css"
import SignOutButton from "../SignOutButton"
import { Session } from "next-auth"

export default function MoreNavOptions({ session }: { session: Session | null }) {
    const [showingNav, showingNavSet] = useState(false)

    if (session === null) return null

    return (
        <div className={styles.contDiv}>
            <Image alt="logo" src={session.user.image ?? defaultImage2} width={20} height={20} style={{ objectFit: "cover" }}
                onClick={() => { showingNavSet(prev => !prev) }}
            />

            {showingNav && (
                <ul className={styles.moreItemsMenu}
                    onClick={() => { showingNavSet(false) }}
                >
                    <li className={styles.moreIntemsItem}>account</li>
                    <li className={styles.moreIntemsItem}>settings</li>
                    <li className={styles.moreIntemsItem}><SignOutButton /></li>
                </ul>
            )}
        </div>
    )
}