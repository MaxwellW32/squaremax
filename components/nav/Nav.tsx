import Link from "next/link"
import { auth } from "@/auth/auth"
import { getProjectsFromUser } from "@/serverFunctions/handleProjects"
import ViewNavProjects from "../ViewNavProjects"
import { project } from "@/types"
import styles from "./styles.module.css"
import Image from "next/image"
import logo from "@/public/logo.svg"
import MoreNavOptions from "../moreNavOptions/MoreNavOptions"

export default async function Nav() {
    const session = await auth()

    let seenUserProjects: project[] = []
    if (session !== null) {
        seenUserProjects = await getProjectsFromUser()
    }

    return (
        <nav className={styles.nav}>
            <Link href={"/"}>
                <Image alt="logo" src={logo} width={30} height={30} style={{ objectFit: "contain" }} />
            </Link>

            <ul className={styles.menu}>
                {session === null ? (
                    <li className={styles.menuItem}><Link href={"/login"}><button className="mainButton">Login</button></Link></li>
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
