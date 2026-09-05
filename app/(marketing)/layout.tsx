import React from "react"
import { auth } from "@/auth/auth"
import SiteHeader from "@/components/marketing/SiteHeader"
import SiteFooter from "@/components/marketing/SiteFooter"
import Analytics from "@/components/marketing/Analytics"

//marketing chrome wraps everything EXCEPT tenant pages (/[businessSlug]).
//Ad measurement lives here too, so it can never reach a client's site.
export default async function MarketingLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth()

    return (
        <>
            <Analytics />
            <SiteHeader session={session} />
            {children}
            <SiteFooter />
        </>
    )
}
