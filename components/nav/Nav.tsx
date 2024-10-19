import Link from "next/link"
import SignOutButton from "../SignOutButton"
import { auth } from "@/auth/auth"
import { getProjectsFromUser } from "@/serverFunctions/handleProjects"
import ViewNavProjects from "../ViewNavProjects"
import { project } from "@/types"

export default async function Nav() {
    const session = await auth()

    let seenUserProjects: project[] = []
    if (session !== null) {
        seenUserProjects = await getProjectsFromUser()
    }

    return (
        <nav style={{ display: "grid", gridAutoFlow: "column", position: "relative", zIndex: 9999 }}>
            {session === null ? (
                <Link href={"/login"}>
                    <button>Login</button>
                </Link>
            ) : (
                <>
                    <SignOutButton />

                    <ViewNavProjects seenUserProjects={seenUserProjects} />
                </>
            )}
        </nav>
    )
}
