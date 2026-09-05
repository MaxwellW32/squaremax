"use client"
import { useEffect } from "react"

//fires one conversion event to whichever ad tags are loaded (see
//Analytics.tsx). Renders nothing; safe when no tag is present.

type Tagged = Window & {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
}

export default function ConversionPing({ event, value }: { event: "purchase" | "sign_up" | "lead"; value?: number }) {
    useEffect(() => {
        const tagged = window as Tagged
        try {
            if (tagged.gtag !== undefined) tagged.gtag("event", event, value !== undefined ? { value, currency: "USD" } : {})
            if (tagged.fbq !== undefined) {
                const metaName = event === "purchase" ? "Purchase" : event === "lead" ? "Lead" : "CompleteRegistration"
                tagged.fbq("track", metaName, value !== undefined ? { value, currency: "USD" } : {})
            }
        } catch {
            //measurement must never break the page
        }
    }, [event, value])

    return null
}
