import React from "react"
import type { Metadata } from "next"
import { auth } from "@/auth/auth"
import { getOwnedTenantById } from "@/serverFunctions/handleTenants"
import OnboardingWizard from "@/components/sites/onboarding/OnboardingWizard"

export const metadata: Metadata = {
    title: "Launch my page | Squaremax Sites",
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tenant?: string; cancelled?: string; name?: string; plan?: string }> }) {
    const { tenant: tenantParam, cancelled, name, plan } = await searchParams
    const session = await auth()

    //resume an in-progress draft (also how a cancelled payment returns)
    let resumeTenant = null
    if (session !== null && tenantParam !== undefined) {
        try {
            const tenant = await getOwnedTenantById(tenantParam)
            resumeTenant = { id: tenant.id, slug: tenant.slug, meta: tenant.content, config: tenant.config }
        } catch {
            resumeTenant = null
        }
    }

    return (
        <main className="bg-paper text-ink">
            <OnboardingWizard
                signedIn={session !== null}
                resumeTenant={resumeTenant}
                cancelled={cancelled === "1"}
                initialName={typeof name === "string" ? name.slice(0, 160) : undefined}
                initialPlan={plan === "service" || plan === "storefront" ? plan : null}
            />
        </main>
    )
}
