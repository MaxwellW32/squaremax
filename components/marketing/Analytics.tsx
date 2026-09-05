import React from "react"
import Script from "next/script"

//============================================================
// Ad measurement for the MARKETING site only (never mounted on
// tenant pages or the dashboard — see the privacy policy).
// Both tags are optional: nothing loads until the env vars exist.
//   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
//   NEXT_PUBLIC_META_PIXEL_ID=1234567890
//============================================================

const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function Analytics() {
    if (ga === undefined && pixel === undefined) return null

    return (
        <>
            {ga !== undefined && (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
                    <Script id="ga4" strategy="afterInteractive">
                        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
                    </Script>
                </>
            )}
            {pixel !== undefined && (
                <Script id="meta-pixel" strategy="afterInteractive">
                    {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixel)});fbq('track','PageView');`}
                </Script>
            )}
        </>
    )
}
