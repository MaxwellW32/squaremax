"use server"
import { z } from "zod"
import { signIn, signOut } from "@/auth/auth"

//============================================================
// Sign-in actions behind the branded /signin page. Auth.js does
// the redirecting (it throws NEXT_REDIRECT), so these never
// catch — a try/catch here would swallow the navigation.
//============================================================

//only ever send people back to a path on this site, never off-site
export async function safeRedirectTarget(raw: unknown): Promise<string> {
    const value = typeof raw === "string" ? raw : ""
    if (value.startsWith("/") && !value.startsWith("//")) return value
    return "/dashboard"
}

export async function signInWithEmail(formData: FormData) {
    const email = z.email().max(160).parse(String(formData.get("email") ?? "").trim().toLowerCase())
    const redirectTo = await safeRedirectTarget(formData.get("redirectTo"))
    await signIn("nodemailer", { email, redirectTo })
}

export async function signInWithProvider(formData: FormData) {
    const provider = z.enum(["google", "github"]).parse(formData.get("provider"))
    const redirectTo = await safeRedirectTarget(formData.get("redirectTo"))
    await signIn(provider, { redirectTo })
}

export async function signOutEverywhere() {
    await signOut({ redirectTo: "/" })
}
