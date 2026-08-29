export const metadata = {
    title: "Work — Squaremax",
    description: "Complete demo websites, each chasing a different mood.",
}

export default function Page() {
    const projectsSiteUrl = "https://maxwebsiteprojects.vercel.app"

    return (
        <main>
            <iframe
                src={projectsSiteUrl}
                title="Squaremax website studies"
                // The header is sticky, so the frame fills what is left of the
                // viewport and the footer stays one scroll below it.
                style={{ display: "block", width: "100%", height: "calc(100dvh - 4rem)", border: 0 }}
            />

            <p style={{ padding: "var(--spacingR)", textAlign: "center", fontSize: "var(--fontSizeS)" }}>
                Not loading? <a href={projectsSiteUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>Open the gallery in a new tab</a>.
            </p>
        </main>
    )
}
