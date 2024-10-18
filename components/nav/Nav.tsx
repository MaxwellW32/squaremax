"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Nav() {
    const session = useSession()
    const pathname = usePathname()

    return (
        <nav>
            {session.status === "authenticated" && (
                <button
                    onClick={() => {
                        signOut({
                            redirectTo: "/"
                        })
                    }}
                >Logout
                </button>
            )}

            {session.status === "unauthenticated" && (
                <Link href={"/login"}>
                    <button>Login</button>
                </Link>
            )}

            {pathname === "/" && (
                <Link href={"/newProject"}>
                    <button>New Project</button>
                </Link>
            )}
        </nav>
    )
}
