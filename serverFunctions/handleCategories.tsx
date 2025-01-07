"use server"
import { db } from "@/db"
import { category } from "@/types"

export async function getAllCategories(): Promise<category[]> {
    const results = await db.query.categories.findMany()
    return results as category[]
}