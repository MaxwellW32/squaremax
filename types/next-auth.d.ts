import type { users } from "@/db/schema"

//the session user IS the row — app code reads session.user.id and .role
type SquaremaxUser = typeof users.$inferSelect

declare module "next-auth" {
  interface Session {
    user: SquaremaxUser
  }
}
