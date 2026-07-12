"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { submitIntake } from "@/serverFunctions/handleIntake"
import { ServiceId } from "@/lib/pricing/catalog"

export default function IntakeForm({ services }: { services: ServiceId[] }) {
    const [name, nameSet] = useState("")
    const [email, emailSet] = useState("")
    const [businessName, businessNameSet] = useState("")
    const [currentSite, currentSiteSet] = useState("")
    const [notes, notesSet] = useState("")
    const [status, statusSet] = useState<"idle" | "sending" | "sent">("idle")

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (status !== "idle") return

        statusSet("sending")
        try {
            await submitIntake({ name, email, businessName, currentSite, notes, services })
            statusSet("sent")
        } catch {
            toast.error("Couldn't send — check your email address and try again")
            statusSet("idle")
        }
    }

    if (status === "sent") {
        return (
            <div className="grid gap-2 rounded-lg border border-line bg-surface p-6">
                <p className="font-display text-xl font-bold normal-case">Got it — talk soon.</p>
                <p className="text-mist">
                    I&apos;ll reply within 1 business day with any clarifying questions and your start date.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-line bg-surface p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                    Your name
                    <input required value={name} onChange={e => nameSet(e.target.value)} autoComplete="name" className="rounded-md font-normal" />
                </label>

                <label className="grid gap-1 text-sm font-semibold">
                    Email
                    <input required type="email" value={email} onChange={e => emailSet(e.target.value)} autoComplete="email" className="rounded-md font-normal" />
                </label>
            </div>

            <label className="grid gap-1 text-sm font-semibold">
                Business name
                <input required value={businessName} onChange={e => businessNameSet(e.target.value)} autoComplete="organization" className="rounded-md font-normal" />
            </label>

            <label className="grid gap-1 text-sm font-semibold">
                Current website (if any)
                <input value={currentSite} onChange={e => currentSiteSet(e.target.value)} placeholder="https://…" className="rounded-md font-normal" />
            </label>

            <label className="grid gap-1 text-sm font-semibold">
                Anything I should know?
                <textarea value={notes} onChange={e => notesSet(e.target.value)} rows={4} placeholder="Goals, examples you like, deadline…" className="rounded-md font-normal" />
            </label>

            <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-lg bg-brand px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
            >
                {status === "sending" ? "Sending…" : "Book my build"}
            </button>
        </form>
    )
}
