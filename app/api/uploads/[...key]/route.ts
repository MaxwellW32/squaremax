import { readLocalObject } from "@/lib/storage"

//serves locally stored uploads (dev, or production before R2 is configured).
//With R2 set up, media URLs point at the bucket's public host instead and
//this route is never hit.

const contentTypes: Record<string, string> = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
    const { key } = await params
    const joined = key.join("/")
    const bytes = await readLocalObject(joined)
    if (bytes === null) return new Response("not found", { status: 404 })

    const extension = joined.split(".").pop() ?? ""
    return new Response(new Uint8Array(bytes), {
        status: 200,
        headers: {
            "content-type": contentTypes[extension] ?? "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
        },
    })
}
