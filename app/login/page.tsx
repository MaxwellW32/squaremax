"use client"
import { signIn } from "next-auth/react"

export default function Page() {
    return (
        <div>
            <button
                onClick={async () => {
                    await signIn("google", {
                        redirectTo: "/"
                    })
                }}
            >Signin with Google</button>

            <br />

            <button
                onClick={async () => {
                    await signIn("github", {
                        redirectTo: "/"
                    })
                }}
            >Signin with Github</button>
        </div>
    )
}
