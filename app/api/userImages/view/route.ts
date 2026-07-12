import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import { z } from "zod";
import { userUploadedImagesDirectory } from "@/types/userUploadedTypes";

//uuid.ext only — blocks path traversal (../../.env) and arbitrary reads
const imageNameSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|gif|webp|avif)$/i);

const contentTypes: { [ext: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const imageNameParsed = imageNameSchema.safeParse(searchParams.get("imageName"));
    if (!imageNameParsed.success) {
        return NextResponse.json({ error: "invalid imageName" }, { status: 400 });
    }

    const baseDir = path.resolve(userUploadedImagesDirectory);
    const imagePath = path.resolve(baseDir, imageNameParsed.data);
    if (!imagePath.startsWith(baseDir + path.sep)) {
        return NextResponse.json({ error: "invalid imageName" }, { status: 400 });
    }

    let imageBuffer: Buffer;
    try {
        imageBuffer = await fs.readFile(imagePath);
    } catch {
        return NextResponse.json({ error: "image not found" }, { status: 404 });
    }

    const ext = path.extname(imagePath).toLowerCase();

    return new Response(new Uint8Array(imageBuffer), {
        status: 200,
        headers: {
            "Content-Type": contentTypes[ext] ?? "application/octet-stream",
            "Content-Length": imageBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
