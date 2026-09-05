"use server"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import sharp from "sharp"
import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { tenantMedia } from "@/db/schema"
import { deleteObject, putObject, storageMode } from "@/lib/storage"
import { getOwnedTenant } from "@/lib/sites/owner"

//============================================================
// Image uploads for a tenant's site (owner-gated). Every image
// is normalized server-side — auto-rotated, capped at 1600px,
// re-encoded as WebP — so a 6 MB phone photo becomes ~150 KB and
// pages stay fast on Jamaican mobile data. A per-tenant quota
// (GROWTH-PLAN: 500 MB included) is enforced from the ledger.
//============================================================

export const MEDIA_QUOTA_BYTES = 500 * 1024 * 1024
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024
const MAX_EDGE = 1600

export type MediaRow = {
    id: string
    url: string
    bytes: number
    width: number
    height: number
    createdAt: string
}

function toRow(row: typeof tenantMedia.$inferSelect): MediaRow {
    return { id: row.id, url: row.url, bytes: row.bytes, width: row.width, height: row.height, createdAt: row.createdAt.toISOString() }
}

export async function uploadImage(tenantId: string, formData: FormData): Promise<MediaRow> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))

    const file = formData.get("file")
    if (!(file instanceof File)) throw new Error("choose an image file")
    if (file.size === 0) throw new Error("that file is empty")
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("images must be under 12 MB")
    if (!file.type.startsWith("image/")) throw new Error("only image files can be uploaded")

    const [{ used }] = await db.select({ used: sql<number>`coalesce(sum(${tenantMedia.bytes}), 0)::int` })
        .from(tenantMedia).where(eq(tenantMedia.tenantId, tenant.id))
    if (used >= MEDIA_QUOTA_BYTES) throw new Error("your media storage is full — delete some images or ask us about a Growth pack")

    const input = Buffer.from(await file.arrayBuffer())
    let output: Buffer
    let width = 0
    let height = 0
    try {
        const processed = await sharp(input, { failOn: "none", animated: false })
            .rotate()
            .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer({ resolveWithObject: true })
        output = processed.data
        width = processed.info.width
        height = processed.info.height
    } catch {
        throw new Error("that image couldn't be read — try a JPG, PNG or WebP")
    }

    const key = `t/${tenant.id}/${randomUUID()}.webp`
    const { url } = await putObject(key, output, "image/webp")

    const [created] = await db.insert(tenantMedia).values({
        tenantId: tenant.id,
        key,
        url,
        bytes: output.byteLength,
        width,
        height,
        contentType: "image/webp",
    }).returning()

    return toRow(created)
}

export async function listMedia(tenantId: string): Promise<{ items: MediaRow[]; usedBytes: number; quotaBytes: number; mode: "r2" | "local" }> {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const rows = await db.query.tenantMedia.findMany({
        where: eq(tenantMedia.tenantId, tenant.id),
        orderBy: [desc(tenantMedia.createdAt)],
        limit: 120,
    })
    const [{ used }] = await db.select({ used: sql<number>`coalesce(sum(${tenantMedia.bytes}), 0)::int` })
        .from(tenantMedia).where(eq(tenantMedia.tenantId, tenant.id))
    return { items: rows.map(toRow), usedBytes: used, quotaBytes: MEDIA_QUOTA_BYTES, mode: storageMode() }
}

//removes the file and its ledger row. Components still pointing at the URL
//show a placeholder — the owner chose to delete it.
export async function deleteMedia(tenantId: string, mediaId: string) {
    const tenant = await getOwnedTenant(z.string().parse(tenantId))
    const row = await db.query.tenantMedia.findFirst({
        where: and(eq(tenantMedia.id, z.string().parse(mediaId)), eq(tenantMedia.tenantId, tenant.id)),
    })
    if (row === undefined) throw new Error("image not found")

    await deleteObject(row.key)
    await db.delete(tenantMedia).where(eq(tenantMedia.id, row.id))
    return { ok: true }
}
