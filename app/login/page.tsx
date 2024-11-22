"use client"
import { signIn } from "next-auth/react"

export default function Page() {
    return (
        <div style={{ display: "grid", alignItems: "center", justifyItems: "center", alignContent: "flex-start", gap: ".5rem" }}>
            <h3>Sign in with</h3>
            <button className="mainButton"
                onClick={async () => {
                    await signIn("google", {
                        redirectTo: "/"
                    })
                }}
            >Google</button>

            <button className="mainButton"
                onClick={async () => {
                    await signIn("github", {
                        redirectTo: "/"
                    })
                }}
            >Github</button>
        </div>
    )
}
