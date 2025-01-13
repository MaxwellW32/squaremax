"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { updateUser, updateUserSchema, user, userSchema } from "@/types";
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck";
import { error } from "console";
import { eq } from "drizzle-orm";
import { getUserFromToken } from "./handleGithub";

export async function updateTheUser(userObj: Partial<updateUser>) {
    await sessionCheckWithError()

    const validatedObj = updateUserSchema.partial().parse(userObj)
    if (validatedObj.id === undefined) throw new Error("need to provide id")

    await db.update(users)
        .set({
            ...userObj
        })
        .where(eq(users.id, validatedObj.id));
}

export async function getUser(userIdObj: Pick<user, "id">): Promise<user | undefined> {
    await sessionCheckWithError()

    userSchema.pick({ id: true }).parse(userIdObj)

    const result = await db.query.users.findFirst({
        where: eq(users.id, userIdObj.id),
    });

    return result
}

export async function getUserGithubTokens(userIdObj: Pick<user, "id">): Promise<user["userGithubTokens"]> {
    //have to have a login yourself
    await sessionCheckWithError()

    //validate
    userSchema.pick({ id: true }).parse(userIdObj)

    //get the latest user
    const result = await db.query.users.findFirst({
        where: eq(users.id, userIdObj.id),
    });

    if (result === undefined) throw new Error("error finding user")

    return result.userGithubTokens
}

async function syncWithLatestTokens(userObj: Pick<user, "id" | "userGithubTokens">) {
    //gets handed the current user tokens ensures it matched with server, if not adds it to latest on server
    userSchema.pick({ id: true, userGithubTokens: true }).parse(userObj)

    //get latest userGithubTokens
    const latestUserGithubTokens = await getUserGithubTokens({ id: userObj.id })

    const userGithubTokensNotInServer: user["userGithubTokens"] = []

    //loop over local list - if not in server add it
    userObj.userGithubTokens.forEach(eachUserGithubTokens => {
        if (latestUserGithubTokens === undefined) return

        const foundInServer = latestUserGithubTokens.find(eachLatestUserGithubTokens => eachLatestUserGithubTokens.id === eachUserGithubTokens.id)

        if (foundInServer === undefined) {
            userGithubTokensNotInServer.push(eachUserGithubTokens)
        }
    })

    //update field on latestUser
    const updatedUserGithubTokens = [...latestUserGithubTokens, ...userGithubTokensNotInServer]

    return updatedUserGithubTokens
}

export async function addUserGithubTokens(userObj: Pick<user, "id" | "userGithubTokens">): Promise<user["userGithubTokens"]> {
    //update usernames
    const updatedUsernameTokens = await Promise.all(
        userObj.userGithubTokens.map(async eachuserGithubTokens => {
            const seenUser = await getUserFromToken(eachuserGithubTokens.token)
            eachuserGithubTokens.username = seenUser.login

            return eachuserGithubTokens
        })
    )

    //asign back to main object
    userObj.userGithubTokens = updatedUsernameTokens

    //ensure all tokens are accounted for
    const updatedUserGithubTokens = await syncWithLatestTokens(userObj)

    //make active if only one
    if (updatedUserGithubTokens.length === 1) {
        updatedUserGithubTokens[0].active = true
    }

    //update user on server
    await updateTheUser({
        id: userObj.id,
        userGithubTokens: updatedUserGithubTokens
    })

    return updatedUserGithubTokens
}

export async function updateUserGithubTokens(userObj: Pick<user, "id" | "userGithubTokens">, option: "setToFalse" | "setToActive", activeTokenId?: user["userGithubTokens"][number]["id"]) {
    let updatedUserGithubTokens = await syncWithLatestTokens(userObj)

    if (option === "setToFalse") {
        // set to false 
        updatedUserGithubTokens = updatedUserGithubTokens.map(eachUserGithubTokensMap => {
            eachUserGithubTokensMap.active = false
            return eachUserGithubTokensMap
        })

    } else if (option === "setToActive") {
        if (activeTokenId === undefined) throw new Error("need to provide activeTokenId")

        updatedUserGithubTokens = updatedUserGithubTokens.map(eachUserGithubTokensMap => {
            eachUserGithubTokensMap.active = false

            // set one to active
            if (eachUserGithubTokensMap.id === activeTokenId) {
                eachUserGithubTokensMap.active = true
            }

            return eachUserGithubTokensMap
        })
    }

    //update user on server
    await updateTheUser({
        id: userObj.id,
        userGithubTokens: updatedUserGithubTokens
    })

    return updatedUserGithubTokens
}

export async function deleteUserGithubTokens(userObj: Pick<user, "id" | "userGithubTokens">) {
    // Ensure sent right object
    userSchema.pick({ id: true, userGithubTokens: true }).parse(userObj);

    // Get latest server userGithubTokens
    let latestUserGithubTokens = await getUserGithubTokens({ id: userObj.id });

    // Filter out the tokens to delete
    latestUserGithubTokens = latestUserGithubTokens.filter(eachLatestUserGithubTokensFilter => {
        // If token found in userObj.userGithubTokens, remove it from the list
        if (userObj.userGithubTokens.findIndex(eachUserGithubTokensFind => eachUserGithubTokensFind.id === eachLatestUserGithubTokensFilter.id) > 0) {//then its found 
            return false

        } else {
            return true
        }
    });

    // Update user on server with the remaining tokens
    await updateTheUser({
        id: userObj.id,
        userGithubTokens: latestUserGithubTokens
    });
}
