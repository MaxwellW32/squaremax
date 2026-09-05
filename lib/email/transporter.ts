import nodemailer from "nodemailer"
import { env } from "@/lib/env"

//server-only module (never a server action) — recipients here come from
//trusted sources: the studio inbox, tenant emails stored in the DB, or the
//address a person just typed to sign in.

export const smtpServer = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASS,
    },
}

const transporter = nodemailer.createTransport(smtpServer)

export async function sendEmail(input: {
    to: string
    replyTo?: string
    subject: string
    text: string
    html?: string
}): Promise<void> {
    await transporter.sendMail({
        from: `Squaremax <${env.EMAIL}>`,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        replyTo: input.replyTo,
    })
}

//fire-and-forget variant for notifications that must never break the
//user-facing flow (booking still succeeds if SMTP hiccups)
export function sendEmailInBackground(input: Parameters<typeof sendEmail>[0]): void {
    sendEmail(input).catch(error => {
        console.error("notification email failed:", error instanceof Error ? error.message : error)
    })
}
