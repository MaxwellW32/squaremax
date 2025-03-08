import { auth } from "@/auth/auth"
import { Session } from "next-auth"

export async function sessionCheckWithError() {
    const session = await auth()

    if (session === null) {
        throw new Error("no session seen")
    } else {
        return session
    }
}
export async function ensureUserCanAccess(session: Session, authorId: string) {
    if (session.user.role !== "admin" && session.user.id !== authorId) {
        throw new Error("no session seen")
    }
}