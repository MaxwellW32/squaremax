import React from "react"
import { auth } from "@/auth/auth"
import SiteHeader from "@/components/marketing/SiteHeader"
import SiteFooter from "@/components/marketing/SiteFooter"

//marketing chrome wraps everything EXCEPT tenant pages (/[businessSlug])
export default async function MarketingLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth()

    return (
        <>
            <SiteHeader session={session} />
            {children}
            <SiteFooter />
        </>
    )
}
