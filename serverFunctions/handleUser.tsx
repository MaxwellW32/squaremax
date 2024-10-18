"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { newUser } from "@/types";
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck";
import { eq } from "drizzle-orm";

export async function updateNewUser(newUser: newUser) {
    const session = await sessionCheckWithError()

    await db.update(users)
        .set({
            ...newUser,
        })
        .where(eq(users.id, session.user.id));
}