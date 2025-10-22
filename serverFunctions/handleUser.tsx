"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { newGithubTokenType, updateUserType, updateGithubTokenType, updateGithubTokenSchema, updateUserSchema, userType, githubTokenSchema, githubTokenType, userSchema, newGithubTokenSchema } from "@/types";
import { sessionCheckWithError } from "@/useful/sessionCheck";
import { eq } from "drizzle-orm";
import { getGithubUserFromToken } from "./handleGithub";
import { v4 as uuidV4 } from "uuid";

export async function updateTheUser(userObj: Partial<updateUserType>): Promise<userType> {
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

export async function getUser(userIdObj: Pick<userType, "id">): Promise<userType | undefined> {
    await sessionCheckWithError()

    userSchema.pick({ id: true }).parse(userIdObj)

    const result = await db.query.users.findFirst({
        where: eq(users.id, userIdObj.id),
    });

    return result
}

export async function getUserGithubTokens(userIdObj: Pick<userType, "id">): Promise<userType["userGithubTokens"]> {
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

async function syncWithLatestTokens(userId: userType["id"], seenUserGithubTokens: githubTokenType[]) {
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

export async function deleteUserGithubTokens(userId: userType["id"], githubTokenToDelete: githubTokenType) {
    // Ensure sent right object
    userSchema.shape.id.parse(userId);
    githubTokenSchema.parse(githubTokenToDelete);

    // Get latest server userGithubTokens
    let latestGithubTokens = await getUserGithubTokens({ id: userId });

    // Filter out the tokens to delete
    latestGithubTokens = latestGithubTokens.filter(eachGithubToken => eachGithubToken.id !== githubTokenToDelete.id);

    // Update user on server with the remaining tokens
    await updateTheUser({
        id: userId,
        userGithubTokens: latestGithubTokens
    });

    return latestGithubTokens
}
