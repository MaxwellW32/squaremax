"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { getAnnouncements, sendAnnouncement } from "@/serverFunctions/handleNotifications"

//============================================================
// Marketing tab (notifications add-on): send an announcement to
// every customer who opted into email, with a history below.
//============================================================

export type AnnouncementRow = {
    id: string
    subject: string
    body: string
    sentTo: number
    createdAt: Date | string
}

export default function MarketingTab(props: {
    tenantId: string
    enabled: boolean
    customerCount: number
    initialAnnouncements: AnnouncementRow[]
}) {
    const [announcements, announcementsSet] = useState<AnnouncementRow[]>(props.initialAnnouncements)
    const [subject, subjectSet] = useState("")
    const [body, bodySet] = useState("")
    const [busy, busySet] = useState(false)

    if (!props.enabled) {
        return (
            <p className="max-w-xl rounded-lg border border-line bg-surface p-5 text-sm text-mist">
                The <strong>Notifications</strong> add-on emails you about bookings and messages, and lets you send
                announcements (promos, holiday hours, events) to your customers. Turn it on in the Add-ons tab — $5/month.
            </p>
        )
    }

    const send = async () => {
        if (busy) return
        if (!window.confirm(`Send this announcement to every subscribed customer?`)) return
        busySet(true)
        try {
            const result = await sendAnnouncement(props.tenantId, { subject, body })
            toast.success(`Sent to ${result.sentTo} customer${result.sentTo === 1 ? "" : "s"}`)
            subjectSet("")
            bodySet("")
            announcementsSet(await getAnnouncements(props.tenantId))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "couldn't send")
        } finally {
            busySet(false)
        }
    }

    return (
        <div className="grid max-w-2xl gap-5">
            <div className="grid gap-3 rounded-xl border border-line bg-surface p-5">
                <p className="font-display font-bold">Send an announcement</p>
                <p className="text-xs text-mist">
                    Goes to customers who opted into email updates ({props.customerCount} account{props.customerCount === 1 ? "" : "s"} on your site).
                    Keep it short and useful — a promo, new hours, an event.
                </p>
                <input className="rounded-md border border-line bg-paper px-3 py-2 text-sm" placeholder="Subject"
                    value={subject} onChange={e => subjectSet(e.target.value)} />
                <textarea className="rounded-md border border-line bg-paper px-3 py-2 text-sm" rows={5} placeholder="Your message"
                    value={body} onChange={e => bodySet(e.target.value)} />
                <button type="button" disabled={busy || subject.trim() === "" || body.trim() === ""} onClick={send}
                    className="w-fit rounded-lg bg-cobalt px-5 py-2.5 font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                    {busy ? "Sending…" : "Send announcement"}
                </button>
            </div>

            <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-mist">History</p>
                {announcements.length === 0 && <p className="text-sm text-mist">Nothing sent yet.</p>}
                {announcements.map(announcement => (
                    <div key={announcement.id} className="grid gap-1 rounded-lg border border-line bg-surface p-4 text-sm">
                        <div className="flex items-baseline justify-between gap-2">
                            <p className="font-semibold">{announcement.subject}</p>
                            <span className="text-xs text-mist">
                                {new Date(announcement.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {announcement.sentTo} recipient{announcement.sentTo === 1 ? "" : "s"}
                            </span>
                        </div>
                        <p className="whitespace-pre-line text-mist">{announcement.body}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
