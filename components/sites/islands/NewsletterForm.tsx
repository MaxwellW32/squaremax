"use client"
import React, { useState } from "react"
import { subscribeToUpdates } from "@/serverFunctions/handleSubscribe"

//client island for the newsletter section — creates a password-less customer
//record on THIS tenant (they can claim the account later from /account)
export default function NewsletterForm({ slug, buttonLabel, preview }: { slug: string; buttonLabel: string; preview: boolean }) {
    const [email, emailSet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "done" | "error">("idle")
    const [errorText, errorTextSet] = useState("")

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (preview || status === "sending") return
        statusSet("sending")
        try {
            await subscribeToUpdates({ slug, email })
            statusSet("done")
        } catch (error) {
            statusSet("error")
            errorTextSet(error instanceof Error ? error.message : "something went wrong")
        }
    }

    if (status === "done") {
        return (
            <p className="rounded-[var(--t-radius)] px-5 py-3 text-center font-semibold" style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}>
                You&apos;re on the list ✓
            </p>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid w-full max-w-md gap-2">
            <div className="flex gap-2">
                <input
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => emailSet(e.target.value)}
                    className="grow rounded-[var(--t-radius)] px-4 py-3"
                    style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
                <button
                    type="submit"
                    disabled={status === "sending" || preview}
                    className="whitespace-nowrap rounded-[var(--t-radius)] px-5 py-3 font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
                >
                    {status === "sending" ? "…" : buttonLabel}
                </button>
            </div>
            {status === "error" && <p className="text-[length:var(--t-text-s)] font-semibold" style={{ color: "var(--t-accent)" }}>{errorText}</p>}
        </form>
    )
}
