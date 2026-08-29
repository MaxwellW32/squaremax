"use client"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { z } from "zod"
import { sendNodeEmail } from "@/serverFunctions/handleNodeEmails"

const contactSchema = z.object({
    name: z.string().trim().min(2, "Please enter your name").max(100),
    email: z.email("Please enter a valid email address"),
    company: z.string().trim().max(100),
    message: z.string().trim().min(10, "Tell me a little more — 10 characters minimum").max(5000),
})

type ContactFormValues = z.infer<typeof contactSchema>
type ContactField = keyof ContactFormValues

const emptyForm: ContactFormValues = { name: "", email: "", company: "", message: "" }

const draftKey = "sq-contact-draft"

function readDraft(): ContactFormValues {
    try {
        const raw = localStorage.getItem(draftKey)
        return raw === null ? emptyForm : { ...emptyForm, ...contactSchema.partial().parse(JSON.parse(raw)) }
    } catch {
        //unreadable, stale or blocked — start clean
        return emptyForm
    }
}

export default function ContactForm() {
    const [form, formSet] = useState<ContactFormValues>(emptyForm)
    const [errors, errorsSet] = useState<Partial<Record<ContactField, string>>>({})
    const [status, statusSet] = useState<"idle" | "sending" | "sent">("idle")
    const [draftLoaded, draftLoadedSet] = useState(false)

    //restore an unsent draft so a refresh mid-message costs nothing.
    //deferred: localStorage is browser-only and lint bans sync setState here
    useEffect(() => {
        const timer = setTimeout(() => {
            formSet(readDraft())
            draftLoadedSet(true)
        }, 0)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!draftLoaded) return

        try {
            window.localStorage.setItem(draftKey, JSON.stringify(form))
        } catch {
            //storage blocked or full — the draft is a convenience, not a requirement
        }
    }, [draftLoaded, form])

    function setField(field: ContactField, value: string) {
        formSet(previous => ({ ...previous, [field]: value }))

        //only clear a shown error as they type; never raise one mid-keystroke
        if (errors[field] !== undefined && contactSchema.shape[field].safeParse(value).success) {
            errorsSet(previous => {
                const next = { ...previous }
                delete next[field]
                return next
            })
        }
    }

    function validateField(field: ContactField) {
        const result = contactSchema.shape[field].safeParse(form[field])

        errorsSet(previous => {
            const next = { ...previous }

            if (result.success) {
                delete next[field]
            } else {
                next[field] = result.error.issues[0].message
            }

            return next
        })
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (status !== "idle") return

        const result = contactSchema.safeParse(form)
        if (!result.success) {
            const found: Partial<Record<ContactField, string>> = {}

            result.error.issues.forEach(issue => {
                const field = issue.path[0] as ContactField
                if (found[field] === undefined) found[field] = issue.message
            })

            errorsSet(found)
            return
        }

        statusSet("sending")

        try {
            await sendNodeEmail({
                replyTo: result.data.email,
                subject: `Contact from ${result.data.name}`,
                text: [
                    `name: ${result.data.name}`,
                    `email: ${result.data.email}`,
                    `business: ${result.data.company === "" ? "—" : result.data.company}`,
                    "",
                    "message:",
                    result.data.message,
                ].join("\n"),
            })

            statusSet("sent")
            formSet(emptyForm)

            try {
                window.localStorage.removeItem(draftKey)
            } catch {
                //nothing to clean up
            }
        } catch {
            toast.error("Couldn't send — check your connection and try again")
            statusSet("idle")
        }
    }

    if (status === "sent") {
        return (
            <div className="cornerTicks grid gap-2 rounded-lg border border-line bg-surface p-8 text-center">
                <p className="font-display text-2xl font-bold">Message sent.</p>

                <p className="text-mist">
                    I&apos;ll reply within 1 business day from{" "}
                    <span className="font-semibold text-ink">info@squaremaxtech.com</span>.
                </p>

                <button
                    type="button"
                    onClick={() => statusSet("idle")}
                    className="mt-2 justify-self-center rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                    Send another
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-lg border border-line bg-surface p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Your name"
                    field="name"
                    value={form.name}
                    error={errors.name}
                    autoComplete="name"
                    onChange={setField}
                    onBlur={validateField}
                />

                <Field
                    label="Email"
                    field="email"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    autoComplete="email"
                    onChange={setField}
                    onBlur={validateField}
                />
            </div>

            <Field
                label="Business name"
                field="company"
                optional
                value={form.company}
                error={errors.company}
                autoComplete="organization"
                onChange={setField}
                onBlur={validateField}
            />

            <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-ink">What can I help with?</span>

                <textarea
                    name="message"
                    rows={6}
                    value={form.message}
                    aria-invalid={errors.message !== undefined}
                    placeholder="A hosted page for my shop, a full custom build, a quick question…"
                    onChange={event => setField("message", event.target.value)}
                    onBlur={() => validateField("message")}
                    className="w-full"
                />

                {errors.message !== undefined && <span className="text-sm text-brand">{errors.message}</span>}
            </label>

            <button
                type="submit"
                disabled={status === "sending"}
                className="justify-self-start rounded-lg bg-brand px-6 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
            >
                {status === "sending" ? "Sending…" : "Send message"}
            </button>
        </form>
    )
}

function Field({ label, field, value, error, type, optional, autoComplete, onChange, onBlur }: {
    label: string
    field: ContactField
    value: string
    error?: string
    type?: string
    optional?: boolean
    autoComplete?: string
    onChange: (field: ContactField, value: string) => void
    onBlur: (field: ContactField) => void
}) {
    return (
        <label className="grid content-start gap-1.5">
            <span className="text-sm font-semibold text-ink">
                {label}
                {optional === true && <span className="ml-1 font-normal text-mist">(optional)</span>}
            </span>

            <input
                name={field}
                type={type ?? "text"}
                value={value}
                autoComplete={autoComplete}
                aria-invalid={error !== undefined}
                onChange={event => onChange(field, event.target.value)}
                onBlur={() => onBlur(field)}
                className="w-full"
            />

            {error !== undefined && <span className="text-sm text-brand">{error}</span>}
        </label>
    )
}
