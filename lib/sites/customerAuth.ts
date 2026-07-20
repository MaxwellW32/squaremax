import { randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { tenantCustomerSessions } from "@/db/schema"

//============================================================
// Customer sessions for CLIENT sites. A customer account lives
// under exactly one tenant (unique per tenantId+email) — the
// same person on two client sites is two unrelated accounts.
// The session cookie name embeds the tenant id, so one browser
// can stay signed in to many tenant sites at once, and a cookie
// set on a custom domain never collides with the platform host.
//============================================================

const SESSION_DAYS = 30

function cookieName(tenantId: string): string {
    return `sqc_${tenantId.replace(/[^a-zA-Z0-9-]/g, "")}`
}

//call from server actions / route handlers only (sets a cookie)
export async function createCustomerSession(tenantId: string, customerId: string) {
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

    await db.insert(tenantCustomerSessions).values({ token, customerId, tenantId, expires })

    const cookieStore = await cookies()
    cookieStore.set(cookieName(tenantId), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires,
    })
}

export async function getCurrentCustomer(tenantId: string) {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName(tenantId))?.value
    if (token === undefined || token === "") return null

    const session = await db.query.tenantCustomerSessions.findFirst({
        where: and(eq(tenantCustomerSessions.token, token), eq(tenantCustomerSessions.tenantId, tenantId)),
        with: { customer: true },
    })
    if (session === undefined) return null
    if (new Date(session.expires).getTime() < Date.now()) return null
    if (session.customer.tenantId !== tenantId) return null

    return session.customer
}

//call from server actions / route handlers only (clears the cookie)
export async function destroyCustomerSession(tenantId: string) {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName(tenantId))?.value
    if (token !== undefined && token !== "") {
        await db.delete(tenantCustomerSessions).where(eq(tenantCustomerSessions.token, token))
    }
    cookieStore.delete(cookieName(tenantId))
}
