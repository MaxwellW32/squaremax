import nodemailer from "nodemailer"
import { env } from "@/lib/env"

//server-only module (never a server action) — recipients here come from
//trusted sources: the studio inbox or tenant emails stored in the DB.

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASS,
    },
})

export async function sendEmail(input: {
    to: string
    replyTo?: string
    subject: string
    text: string
}): Promise<void> {
    await transporter.sendMail({
        from: env.EMAIL,
        to: input.to,
        subject: input.subject,
        text: input.text,
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
