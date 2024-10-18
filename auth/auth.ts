import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google, Github],
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        }
    },
    pages: {
        signIn: "/login"
    },
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
    }),
})