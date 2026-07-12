"use client"
import React, { useState } from "react"
import { submitTenantMessage } from "@/serverFunctions/handleTenantPublic"

//client island inside server-rendered tenant pages — styled with --t-* tokens only
export default function TenantMessageForm({ slug, preview, notify }: { slug: string; preview: boolean; notify: boolean }) {
    const [name, nameSet] = useState("")
    const [email, emailSet] = useState("")
    const [body, bodySet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "sent" | "error">("idle")

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (preview) return
        if (status === "sending") return

        statusSet("sending")
        try {
            await submitTenantMessage({ slug, name, email, body })
            statusSet("sent")
        } catch {
            statusSet("error")
        }
    }

    if (status === "sent") {
        return (
            <div className="grid content-center gap-1 rounded-[var(--t-radius)] p-6 text-center" style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}>
                <p className="text-[length:var(--t-text-l)] text-[var(--t-text)]" style={{ fontFamily: "var(--t-font-heading)" }}>Message sent ✓</p>
                <p className="text-[length:var(--t-text-s)] text-[var(--t-text-muted)]">
                    {notify ? "We got it and will reply by email." : "We got it — thanks for reaching out."}
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid content-start gap-3 rounded-[var(--t-radius)] p-5" style={{ backgroundColor: "var(--t-bg)", border: "1px solid var(--t-border)" }}>
            <div className="grid gap-3 sm:grid-cols-2">
                <input
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={e => nameSet(e.target.value)}
                    className="rounded-[var(--t-radius)] px-3 py-2.5"
                    style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
                <input
                    required
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => emailSet(e.target.value)}
                    className="rounded-[var(--t-radius)] px-3 py-2.5"
                    style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
                />
            </div>

            <textarea
                required
                placeholder="How can we help?"
                rows={4}
                value={body}
                onChange={e => bodySet(e.target.value)}
                className="rounded-[var(--t-radius)] px-3 py-2.5"
                style={{ backgroundColor: "var(--t-surface)", border: "1px solid var(--t-border)", color: "var(--t-text)" }}
            />

            {status === "error" && (
                <p className="text-[length:var(--t-text-s)]" style={{ color: "var(--t-accent)" }}>Couldn&apos;t send — check your email address and try again.</p>
            )}

            <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-[var(--t-radius)] px-5 py-2.5 font-semibold disabled:opacity-60"
                style={{ backgroundColor: "var(--t-primary)", color: "var(--t-primary-contrast)" }}
            >
                {status === "sending" ? "Sending…" : "Send message"}
            </button>
        </form>
    )
}
