"use server"
import { db } from "@/db"
import { categoryType } from "@/types"

export async function getAllCategories(): Promise<categoryType[]> {
    const results = await db.query.categories.findMany()
    return results
}