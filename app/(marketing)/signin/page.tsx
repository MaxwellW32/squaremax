import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth, oauthProviders } from "@/auth/auth"
import { safeRedirectTarget, signInWithEmail, signInWithProvider } from "@/serverFunctions/handleAuth"

export const metadata: Metadata = {
    title: "Sign in | Squaremax",
    robots: { index: false },
}

//Auth.js error codes → something a business owner can act on
const errorCopy: Record<string, string> = {
    Verification: "That sign-in link has expired or was already used. Enter your email again for a fresh one.",
    OAuthAccountNotLinked: "That email already has a Squaremax account. Sign in with the email link instead.",
    AccessDenied: "Sign-in was cancelled. Try again whenever you're ready.",
    Configuration: "Sign-in isn't set up correctly on our side yet — email info@squaremaxtech.com and we'll sort it.",
    Default: "Something went wrong signing you in. Try again, or use the email link.",
}

export default async function Page({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
    const { callbackUrl, error } = await searchParams
    const redirectTo = await safeRedirectTarget(callbackUrl)

    const session = await auth()
    if (session !== null) redirect(redirectTo)

    const problem = error !== undefined ? errorCopy[error] ?? errorCopy.Default : null
    const anyOauth = oauthProviders.google || oauthProviders.github

    return (
        <main className="bg-paper text-ink">
            <div className="mx-auto grid max-w-md gap-6 px-4 py-12 md:py-20">
                <div className="grid gap-2">
                    <h1 className="font-display text-3xl font-bold normal-case">Sign in to Squaremax</h1>
                    <p className="text-mist">
                        New here? Same door — an account is created the first time you sign in. No password to remember.
                    </p>
                </div>

                {problem !== null && (
                    <p role="alert" className="rounded-lg border border-brand/40 bg-brand/5 px-4 py-3 text-sm text-ink">{problem}</p>
                )}

                <form action={signInWithEmail} className="grid gap-3 rounded-xl border border-line bg-surface p-5">
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <label className="grid gap-1 text-sm font-semibold">
                        Your email
                        <input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@yourbusiness.com"
                            className="rounded-lg font-normal text-base"
                        />
                    </label>
                    <button type="submit" className="rounded-lg bg-cobalt px-5 py-3 font-display text-lg font-bold text-white transition-colors hover:bg-ink">
                        Email me a sign-in link
                    </button>
                    <p className="text-xs text-mist">We send a one-tap link — it works once and expires in 15 minutes.</p>
                </form>

                {anyOauth && (
                    <div className="grid gap-3">
                        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-mist">
                            <span className="h-px grow bg-line" />or continue with<span className="h-px grow bg-line" />
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {oauthProviders.google && (
                                <form action={signInWithProvider}>
                                    <input type="hidden" name="provider" value="google" />
                                    <input type="hidden" name="redirectTo" value={redirectTo} />
                                    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 font-semibold transition-colors hover:border-ink">
                                        <span aria-hidden className="grid size-5 place-items-center rounded-full bg-paper text-xs font-bold">G</span>
                                        Google
                                    </button>
                                </form>
                            )}
                            {oauthProviders.github && (
                                <form action={signInWithProvider}>
                                    <input type="hidden" name="provider" value="github" />
                                    <input type="hidden" name="redirectTo" value={redirectTo} />
                                    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 font-semibold transition-colors hover:border-ink">
                                        <span aria-hidden className="grid size-5 place-items-center rounded-full bg-ink text-xs font-bold text-white">gh</span>
                                        GitHub
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-xs text-mist">
                    By signing in you agree to our <Link className="underline" href="/privacyPolicy">privacy policy</Link>.
                    Looking for a business&apos;s customer account? Sign in on that business&apos;s own page instead.
                </p>
            </div>
        </main>
    )
}
