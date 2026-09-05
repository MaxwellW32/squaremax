"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { MediaRow, listMedia, uploadImage } from "@/serverFunctions/handleMedia"

//============================================================
// One control for every image slot in the dashboard: paste a
// URL, upload from the phone's camera roll, or pick something
// uploaded before. Uploads are resized and compressed on the
// server, so owners never think about file sizes.
// UploadContext carries the tenant id so forms deep in the
// editor don't need it threaded through props.
//============================================================

export const UploadContext = createContext<{ tenantId: string } | null>(null)

export function useTenantUpload() {
    const ctx = useContext(UploadContext)
    const [busy, busySet] = useState(false)

    const upload = async (file: File): Promise<string | null> => {
        if (ctx === null) {
            toast.error("uploads aren't available here")
            return null
        }
        busySet(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const media = await uploadImage(ctx.tenantId, formData)
            toast.success("Image uploaded")
            return media.url
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "upload failed")
            return null
        } finally {
            busySet(false)
        }
    }

    return { available: ctx !== null, tenantId: ctx?.tenantId ?? null, busy, upload }
}

function MediaPicker({ tenantId, onPick, onClose }: { tenantId: string; onPick: (url: string) => void; onClose: () => void }) {
    const [items, itemsSet] = useState<MediaRow[] | null>(null)
    const [usage, usageSet] = useState<{ usedBytes: number; quotaBytes: number } | null>(null)

    useEffect(() => {
        let cancelled = false
        listMedia(tenantId)
            .then(result => {
                if (cancelled) return
                itemsSet(result.items)
                usageSet({ usedBytes: result.usedBytes, quotaBytes: result.quotaBytes })
            })
            .catch(() => { if (!cancelled) itemsSet([]) })
        return () => { cancelled = true }
    }, [tenantId])

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-[110] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Your uploaded images">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <div className="relative grid max-h-[85vh] w-full max-w-3xl grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                    <div className="grid gap-0.5">
                        <p className="font-display text-lg font-bold">Your images</p>
                        {usage !== null && (
                            <p className="text-xs text-mist">{(usage.usedBytes / (1024 * 1024)).toFixed(1)} MB of {Math.round(usage.quotaBytes / (1024 * 1024))} MB used</p>
                        )}
                    </div>
                    <button type="button" onClick={onClose} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-mist hover:text-ink">Close</button>
                </div>
                <div className="overflow-y-auto p-4">
                    {items === null && <p className="text-sm text-mist">Loading…</p>}
                    {items !== null && items.length === 0 && <p className="text-sm text-mist">Nothing uploaded yet — use the Upload button to add your first photo.</p>}
                    {items !== null && items.length > 0 && (
                        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                            {items.map(item => (
                                <li key={item.id}>
                                    <button type="button" onClick={() => onPick(item.url)} className="block w-full overflow-hidden rounded-lg border border-line hover:border-cobalt focus-visible:ring-2 focus-visible:ring-cobalt">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ImageField({ label, value, onChange, placeholder, compact }: {
    label?: string
    value: string
    onChange: (next: string) => void
    placeholder?: string
    compact?: boolean
}) {
    const { available, tenantId, busy, upload } = useTenantUpload()
    const fileRef = useRef<HTMLInputElement | null>(null)
    const [pickerOpen, pickerOpenSet] = useState(false)

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (file === undefined) return
        const url = await upload(file)
        if (url !== null) onChange(url)
    }

    const control = (
        <div className="flex items-center gap-1.5">
            {value !== "" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" className={`${compact ? "size-8" : "size-10"} shrink-0 rounded-md border border-line object-cover`} />
            ) : (
                <span aria-hidden className={`${compact ? "size-8" : "size-10"} grid shrink-0 place-items-center rounded-md border border-dashed border-line text-mist`}>🖼</span>
            )}
            <input
                className="min-w-0 grow rounded-md border border-line bg-surface px-3 py-2 text-sm font-normal"
                value={value}
                placeholder={placeholder ?? (available ? "Upload, or paste an image link" : "https://…")}
                onChange={e => onChange(e.target.value)}
            />
            {available && (
                <>
                    <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
                        className="shrink-0 rounded-md bg-cobalt px-2.5 py-2 text-xs font-bold text-white hover:bg-ink disabled:opacity-50">
                        {busy ? "…" : "Upload"}
                    </button>
                    <button type="button" title="Choose from your uploads" aria-label="Choose from your uploads" onClick={() => pickerOpenSet(true)}
                        className="shrink-0 rounded-md border border-line px-2 py-2 text-xs font-semibold text-mist hover:text-ink">
                        📁
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
                </>
            )}
            {value !== "" && (
                <button type="button" aria-label="Clear image" onClick={() => onChange("")} className="shrink-0 rounded-md border border-line px-2 py-2 text-xs text-mist hover:text-brand">×</button>
            )}
            {pickerOpen && tenantId !== null && (
                <MediaPicker tenantId={tenantId} onPick={url => { onChange(url); pickerOpenSet(false) }} onClose={() => pickerOpenSet(false)} />
            )}
        </div>
    )

    if (label === undefined) return control
    return (
        <label className="grid gap-1 text-xs font-semibold">
            {label}
            {control}
        </label>
    )
}
