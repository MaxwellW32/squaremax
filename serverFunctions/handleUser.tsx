"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { newGithubTokenType, updateUser, updateGithubTokenType, updateGithubTokenSchema, updateUserSchema, user, githubTokenSchema, githubTokenType, userSchema, newGithubTokenSchema } from "@/types";
import { sessionCheckWithError } from "@/usefulFunctions/sessionCheck";
import { eq } from "drizzle-orm";
import { getGithubUserFromToken } from "./handleGithub";
import { v4 as uuidV4 } from "uuid";

export async function updateTheUser(userObj: Partial<updateUser>): Promise<user> {
    await sessionCheckWithError()

    const validatedObj = updateUserSchema.partial().parse(userObj)
    if (validatedObj.id === undefined) throw new Error("need to provide id")

    const [result] = await db.update(users)
        .set({
            ...userObj
        })
        .where(eq(users.id, validatedObj.id)).returning()

    return result
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

async function syncWithLatestTokens(userId: user["id"], seenUserGithubTokens: githubTokenType[]) {
    //gets handed the current user tokens ensures it matched with server, if not adds it to latest on server
    userSchema.shape.id.parse(userId)

    const validatedUserGithubTokens = seenUserGithubTokens.map(each => {
        return githubTokenSchema.parse(each)
    })

    //get latest userGithubTokens
    const latestUserGithubTokens = await getUserGithubTokens({ id: userId })

    const userGithubTokensNotInServer: githubTokenType[] = []

    //loop over local list - if not in server add it
    validatedUserGithubTokens.forEach(eachUserGithubToken => {
        const foundInServer = latestUserGithubTokens.find(eachLatestUserGithubTokensFind => eachLatestUserGithubTokensFind.id === eachUserGithubToken.id)

        if (foundInServer === undefined) {
            userGithubTokensNotInServer.push(eachUserGithubToken)
        }
    })

    //update field on latestUser
    const updatedUserGithubTokens = [...latestUserGithubTokens, ...userGithubTokensNotInServer]

    return updatedUserGithubTokens
}

export async function addUserGithubToken(newGithubToken: newGithubTokenType): Promise<githubTokenType> {
    const seenSession = await sessionCheckWithError()

    newGithubTokenSchema.parse(newGithubToken)

    //update usernames
    const seenUser = await getGithubUserFromToken(newGithubToken.token)

    const newFullGithubToken: githubTokenType = {
        ...newGithubToken,
        id: uuidV4(),
        username: seenUser.login
    }

    //validation 
    githubTokenSchema.parse(newFullGithubToken)

    //ensure all tokens are accounted for
    let latestGithubTokens = await syncWithLatestTokens(seenSession.user.id, [newFullGithubToken])

    const activeGithubToken = latestGithubTokens.find(eachGithubToken => eachGithubToken.active)

    //set all to false
    latestGithubTokens = latestGithubTokens.map(eachGithubToken => {
        eachGithubToken.active = false

        // set one to active
        if (activeGithubToken !== undefined && eachGithubToken.id === activeGithubToken.id) {
            eachGithubToken.active = true
        }

        return eachGithubToken
    })

    if (activeGithubToken === undefined) {
        latestGithubTokens[0].active = true
    }

    //update user on server
    await updateTheUser({
        id: seenSession.user.id,
        userGithubTokens: latestGithubTokens
    })

    return newFullGithubToken
}

export async function updateUserGithubToken(githubTokenId: githubTokenType["id"], updatedGithubToken: Partial<updateGithubTokenType>) {
    const seenSession = await sessionCheckWithError()

    //validation
    const validatedUpdatedGithubToken = updateGithubTokenSchema.partial().parse(updatedGithubToken)
    let latestGithubTokens = await getUserGithubTokens({ id: seenSession.user.id })


    //update
    latestGithubTokens = latestGithubTokens.map(eachGithubToken => {
        if (eachGithubToken.id === githubTokenId) {

            return {
                ...eachGithubToken,
                ...validatedUpdatedGithubToken
            }
        }

        return eachGithubToken
    })

    const seeingOneActive = latestGithubTokens.find(eachGithubToken => eachGithubToken.active)

    // set all false 
    latestGithubTokens = latestGithubTokens.map(eachGithubToken => {
        eachGithubToken.active = false

        // set one to active
        if (seeingOneActive !== undefined && eachGithubToken.id === seeingOneActive.id) {
            eachGithubToken.active = true
        }

        return eachGithubToken
    })

    if (seeingOneActive === undefined) {
        latestGithubTokens[0].active = true
    }

    //update user on server
    const updatedUser = await updateTheUser({
        id: seenSession.user.id,
        userGithubTokens: latestGithubTokens
    })

    return updatedUser.userGithubTokens
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

    return latestUserGithubTokens
}
