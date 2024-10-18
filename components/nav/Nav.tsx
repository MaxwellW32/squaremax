"use client"
// import { auth, signOut } from "@/auth/auth"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Nav() {
    const session = useSession()

    return (
        <nav>
            <div>
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
            </div>
        </nav>
    )
}
