import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import Nodemailer from "next-auth/providers/nodemailer"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"
import { env } from "@/lib/env"
import { sendEmail, smtpServer } from "@/lib/email/transporter"

//============================================================
// Site-owner sign-in. Email magic links are the default (every
// small-business owner has an email address; not everyone wants
// to connect Google), with Google/GitHub as one-click options
// when their credentials are configured. Branded pages live at
// /signin — the Auth.js defaults are never shown.
//============================================================

const providers: Provider[] = [
    Nodemailer({
        server: smtpServer,
        from: env.EMAIL,
        maxAge: 15 * 60, //link valid for 15 minutes
        async sendVerificationRequest({ identifier, url }) {
            const host = new URL(url).host
            await sendEmail({
                to: identifier,
                subject: "Your Squaremax sign-in link",
                text: `Hi,\n\nTap the link below to sign in to Squaremax (${host}):\n\n${url}\n\nThe link works once and expires in 15 minutes. If you didn't ask for it, you can ignore this email.\n\n— Squaremax`,
                html: signInEmailHtml(url, host),
            })
        },
    }),
]

if (env.AUTH_GOOGLE_ID !== undefined && env.AUTH_GOOGLE_SECRET !== undefined) {
    //Google verifies email ownership, so linking an existing magic-link
    //account by email is safe here — it lets a client who first signed in
    //by email use "Continue with Google" next time without an error
    providers.push(Google({ allowDangerousEmailAccountLinking: true }))
}
if (env.AUTH_GITHUB_ID !== undefined && env.AUTH_GITHUB_SECRET !== undefined) {
    providers.push(Github)
}

//which one-click buttons the sign-in page should render
export const oauthProviders = {
    google: env.AUTH_GOOGLE_ID !== undefined && env.AUTH_GOOGLE_SECRET !== undefined,
    github: env.AUTH_GITHUB_ID !== undefined && env.AUTH_GITHUB_SECRET !== undefined,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers,
    pages: {
        signIn: "/signin",
        verifyRequest: "/signin/check-email",
        error: "/signin",
    },
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
    },
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
})

function signInEmailHtml(url: string, host: string): string {
    const safeUrl = url.replace(/"/g, "&quot;")
    return `<!doctype html><html><body style="margin:0;background:#f5f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#141828;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #dfe2e9;border-radius:12px;padding:32px;">
<tr><td style="font-size:20px;font-weight:700;padding-bottom:8px;">squaremax</td></tr>
<tr><td style="font-size:16px;line-height:24px;padding-bottom:20px;">Tap the button to sign in to your Squaremax dashboard on <strong>${host}</strong>.</td></tr>
<tr><td style="padding-bottom:20px;"><a href="${safeUrl}" style="display:inline-block;background:#2b50e8;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:12px 22px;border-radius:8px;">Sign in to Squaremax</a></td></tr>
<tr><td style="font-size:13px;line-height:20px;color:#5c6274;">This link works once and expires in 15 minutes. If you didn't ask for it, you can safely ignore this email.</td></tr>
</table></td></tr></table></body></html>`
}
