"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
    ServiceId, TierId, UseCase,
    computeQuote, everyTierIncludes, services, tierPresets, tiers, tiersById, useCases, usd,
} from "@/lib/pricing/catalog"

//count-up that respects prefers-reduced-motion
function useAnimatedNumber(target: number): number {
    const [shown, shownSet] = useState(target)
    const frameRef = useRef<number | undefined>(undefined)
    const shownRef = useRef(target)

    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            shownRef.current = target
            shownSet(target)
            return
        }

        const from = shownRef.current
        if (from === target) return

        const duration = 320
        const start = performance.now()

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - progress, 3)
            const value = Math.round(from + (target - from) * eased)
            shownRef.current = value
            shownSet(value)

            if (progress < 1) frameRef.current = requestAnimationFrame(tick)
        }

        frameRef.current = requestAnimationFrame(tick)
        return () => {
            if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current)
        }
    }, [target])

    return shown
}

export default function Configurator() {
    const [selected, selectedSet] = useState<Set<ServiceId>>(new Set(tierPresets.launch))
    const [activeUseCase, activeUseCaseSet] = useState<UseCase | null>(null)

    const quote = useMemo(() => computeQuote([...selected]), [selected])
    const tier = tiersById[quote.tierId]

    const shownSubtotal = useAnimatedNumber(quote.subtotal)
    const shownDiscount = useAnimatedNumber(quote.discount)
    const shownTotal = useAnimatedNumber(quote.tierPrice)

    const toggle = (id: ServiceId) => {
        activeUseCaseSet(null)
        selectedSet(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const applyPreset = (tierId: TierId) => {
        activeUseCaseSet(null)
        selectedSet(new Set(tierPresets[tierId]))
    }

    const applyUseCase = (useCase: UseCase) => {
        activeUseCaseSet(useCase)
        selectedSet(new Set(Object.keys(useCase.picks) as ServiceId[]))
    }

    const intakeHref = `/custom-builds/start?services=${[...selected].join(",")}`

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* left: presets, chips, service list */}
            <div className="grid content-start gap-6">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wide text-mist">Start from a plan</span>
                    {tiers.map(eachTier => (
                        <button
                            key={eachTier.id}
                            type="button"
                            onClick={() => applyPreset(eachTier.id)}
                            className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${quote.tierId === eachTier.id && activeUseCase === null
                                ? "border-ink bg-ink text-white"
                                : "border-line bg-surface text-ink hover:border-ink"
                                }`}
                        >
                            {eachTier.name} · {usd.format(eachTier.price)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wide text-mist">Or your business type</span>
                    {useCases.map(eachUseCase => (
                        <button
                            key={eachUseCase.id}
                            type="button"
                            onClick={() => applyUseCase(eachUseCase)}
                            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${activeUseCase?.id === eachUseCase.id
                                ? "border-cobalt bg-cobalt text-white"
                                : "border-line bg-surface text-ink hover:border-cobalt"
                                }`}
                        >
                            {eachUseCase.label}
                        </button>
                    ))}
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                    {services.map(eachService => {
                        const isOn = selected.has(eachService.id)
                        const reason = activeUseCase?.picks[eachService.id]

                        return (
                            <li key={eachService.id}>
                                <label
                                    className={`flex h-full cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isOn ? "border-ink bg-surface" : "border-line bg-surface/60 hover:border-mist"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isOn}
                                        onChange={() => toggle(eachService.id)}
                                        className="mt-1 size-4 accent-brand"
                                    />
                                    <span className="grid gap-0.5">
                                        <span className="flex items-baseline justify-between gap-2 font-semibold leading-snug normal-case">
                                            {eachService.label}
                                            <span className="tabularNums whitespace-nowrap text-sm text-mist">{usd.format(eachService.price)}</span>
                                        </span>
                                        <span className="text-sm leading-snug text-mist normal-case font-normal">{eachService.blurb}</span>
                                        {reason !== undefined && isOn && (
                                            <span className="mt-1 w-fit rounded bg-cobalt/10 px-2 py-0.5 text-xs font-medium normal-case text-cobalt">
                                                {reason}
                                            </span>
                                        )}
                                    </span>
                                </label>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* right: live quote */}
            <aside className="lg:sticky lg:top-24 h-fit">
                <div className="cornerTicks grid gap-4 rounded-xl border border-line bg-ink p-6 text-white">
                    <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-semibold uppercase tracking-widest text-white/60">Your build</span>
                        <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold">{tier.name}</span>
                    </div>

                    <p className="text-sm text-white/70">{tier.tagline} · built in {tier.buildTime}</p>

                    <dl className="grid gap-2 border-t border-white/15 pt-4 text-sm">
                        <div className="flex items-baseline justify-between">
                            <dt className="text-white/70">Itemized value ({selected.size} services)</dt>
                            <dd className="tabularNums font-semibold">{usd.format(shownSubtotal)}</dd>
                        </div>

                        {quote.discount > 0 ? (
                            <div className="flex items-baseline justify-between text-emerald-300">
                                <dt>Squaremax flat-rate discount</dt>
                                <dd className="tabularNums font-semibold">−{usd.format(shownDiscount)}</dd>
                            </div>
                        ) : (
                            <div className="text-white/50">
                                <dt>{tier.name} builds are {usd.format(tier.price)} flat, minimum</dt>
                            </div>
                        )}
                    </dl>

                    <div className="flex items-baseline justify-between border-t border-white/15 pt-4">
                        <span className="font-display text-lg font-semibold">Your flat price</span>
                        <span className="tabularNums font-display text-4xl font-bold">{usd.format(shownTotal)}</span>
                    </div>

                    {quote.savings > 0 && (
                        <p className="rounded-md bg-emerald-400/15 px-3 py-2 text-center text-sm font-semibold text-emerald-300">
                            You&apos;re saving {usd.format(quote.savings)}
                        </p>
                    )}

                    <Link
                        href={intakeHref}
                        className="rounded-lg bg-brand px-5 py-3 text-center font-display text-lg font-bold text-white transition-colors hover:bg-brand-deep"
                    >
                        Start my build — {usd.format(quote.tierPrice)} flat
                    </Link>

                    <ul className="grid gap-1.5 border-t border-white/15 pt-4 text-sm text-white/70">
                        {everyTierIncludes.map(eachItem => (
                            <li key={eachItem} className="flex gap-2">
                                <span aria-hidden className="text-emerald-300">✓</span>
                                {eachItem}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    )
}
