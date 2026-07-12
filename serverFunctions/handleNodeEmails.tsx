"use server"
import nodemailer from "nodemailer"
import { z } from "zod"
import { env } from "@/lib/env"

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASS,
    },
});

const studioEmailSchema = z.object({
    replyTo: z.email(),
    subject: z.string().min(1).max(200),
    text: z.string().min(1).max(20_000),
})

//recipient is pinned to the studio inbox — this action is client-callable,
//so accepting an arbitrary sendTo would be an open relay.
export async function sendNodeEmail(input: z.infer<typeof studioEmailSchema>) {
    const validated = studioEmailSchema.parse(input)

    await transporter.sendMail({
        from: env.EMAIL,
        to: env.EMAIL,
        subject: validated.subject,
        text: validated.text,
        replyTo: validated.replyTo,
    });
}
