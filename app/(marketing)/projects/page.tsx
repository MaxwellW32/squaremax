import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Work — Squaremax",
    description: "Complete demo websites, each chasing a different mood.",
}

const projectsSiteUrl = "https://maxwebsiteprojects.vercel.app"

export default function Page() {
    return (
        <main className="bg-paper text-ink">
            <iframe
                src={projectsSiteUrl}
                title="Squaremax website studies"
                // the header is sticky, so the frame fills what is left of the
                // viewport and the footer stays one scroll below it
                className="block w-full border-0"
                style={{ height: "calc(100dvh - 4rem)" }}
            />

            <p className="border-t border-line px-4 py-4 text-center text-sm text-mist">
                Not loading?{" "}
                <a href={projectsSiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-cobalt underline">
                    Open the gallery in a new tab
                </a>
                .
            </p>
        </main>
    )
}
