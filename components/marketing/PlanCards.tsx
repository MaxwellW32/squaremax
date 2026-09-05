import React from "react"
import Link from "next/link"
import { ADDON_MONTHLY_PRICE, BASE_INCLUDES, BASE_MONTHLY_PRICE, addons, bundles } from "@/lib/sites/addons"
import { FREE_MONTHS_PER_YEAR } from "@/lib/sites/billing"

//============================================================
// The three ways to buy, in one glance — reused on the home
// page and /pricing so the numbers can never drift apart.
//============================================================

const plans = [
    {
        id: "website",
        name: "Website",
        price: BASE_MONTHLY_PRICE,
        tagline: "A professional site, live tonight",
        bestFor: "Anyone who needs to be found and contacted: hours, menu or services, photos, a contact form.",
        includes: BASE_INCLUDES,
        recommended: false,
    },
    ...bundles.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        price: bundle.monthlyPrice,
        tagline: bundle.tagline,
        bestFor: bundle.bestFor,
        includes: ["Everything in Website", ...bundle.addons.map(id => addons.find(addon => addon.id === id)?.name ?? id)],
        recommended: bundle.recommended === true,
    })),
]

export default function PlanCards({ compact }: { compact?: boolean }) {
    return (
        <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
                {plans.map(plan => (
                    <div key={plan.id} className={`relative grid content-start gap-4 rounded-2xl border-2 bg-paper p-6 ${plan.recommended ? "cornerTicks border-cobalt" : "border-line"}`}>
                        {plan.recommended && (
                            <span className="absolute -top-3 left-6 rounded-full bg-cobalt px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Most popular</span>
                        )}
                        <div className="grid gap-1">
                            <p className="font-display text-lg font-bold normal-case">{plan.name}</p>
                            <p className="flex items-baseline gap-1">
                                <span className="font-display text-4xl font-bold">US${plan.price}</span>
                                <span className="text-sm text-mist">/month</span>
                            </p>
                            <p className="text-sm text-mist">{plan.tagline}</p>
                        </div>
                        <ul className="grid gap-1.5 text-sm">
                            {plan.includes.map(item => (
                                <li key={item} className="flex gap-2"><span aria-hidden className="font-bold text-cobalt">✓</span>{item}</li>
                            ))}
                        </ul>
                        {!compact && <p className="text-xs text-mist">{plan.bestFor}</p>}
                        <Link
                            href={`/sites/start${plan.id === "website" ? "" : `?plan=${plan.id}`}`}
                            className={`mt-auto rounded-lg px-5 py-3 text-center font-display font-bold transition-colors ${plan.recommended ? "bg-cobalt text-white hover:bg-ink" : "border-2 border-ink text-ink hover:bg-ink hover:text-white"}`}
                        >
                            Start with {plan.name}
                        </Link>
                    </div>
                ))}
            </div>

            <div className="grid gap-3 rounded-xl border border-line bg-paper p-5 text-sm md:flex md:items-center md:justify-between">
                <p className="text-mist">
                    <span className="font-semibold text-ink">Or add any single tool for US${ADDON_MONTHLY_PRICE}/month:</span>{" "}
                    {addons.filter(addon => addon.status === "available").map(addon => addon.name.toLowerCase()).join(", ")}.
                    Switch tools on or off from your dashboard — the price follows.
                </p>
                <p className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                    Pay for a year, get {FREE_MONTHS_PER_YEAR} months free
                </p>
            </div>

            <p className="text-center text-xs text-mist">
                No setup fee · no contract · pay month to month by card · cancel by simply not renewing. Prices in US dollars.
            </p>
        </div>
    )
}
