import Link from "next/link"
import { auth } from "@/auth/auth"
import { getProjectsFromUser } from "@/serverFunctions/handleProjects"
import ViewNavProjects from "../ViewNavProjects"
import { project } from "@/types"
import styles from "./styles.module.css"
import Image from "next/image"
import defaultImage from "@/public/defaultImage.jpg"
import MoreNavOptions from "../moreNavOptions/MoreNavOptions"

export default async function Nav() {
    const session = await auth()

    let seenUserProjects: project[] = []
    if (session !== null) {
        seenUserProjects = await getProjectsFromUser()
    }

    return (
        <nav className={styles.nav}>
            <Image alt="logo" src={defaultImage} width={50} height={50} style={{ objectFit: "cover" }} />

            <ul className={styles.menu}>
                {session === null ? (
                    <li className={styles.menuItem}><Link href={"/login"}><button>Login</button></Link></li>
                ) : (
                    <>
                        <li className={styles.menuItem}>
                            <ViewNavProjects seenUserProjects={seenUserProjects} />
                        </li>

                        <MoreNavOptions session={session} />
                    </>
                )}
            </ul>
        </nav>
    )
}
