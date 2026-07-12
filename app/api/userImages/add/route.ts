import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import { maxImageUploadSize, userUploadedImagesDirectory } from "@/types/userUploadedTypes";
import { convertBtyes } from "@/useful/usefulFunctions";
import { sessionCheckWithError } from "@/useful/sessionCheck";
import { ensureDirectoryExists } from "@/utility/manageFiles";

const allowedImageTypes: { [mime: string]: string } = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
};

export async function POST(request: Request) {
    await sessionCheckWithError()

    const formData = await request.formData();
    const files = [...formData.values()].filter((value): value is File => value instanceof File);

    if (files.length === 0) {
        return NextResponse.json({ error: "no image files sent" }, { status: 400 });
    }

    //ensure it exists
    await ensureDirectoryExists(userUploadedImagesDirectory)

    const addedImageNames = await Promise.all(files.map(async file => {
        const extension = allowedImageTypes[file.type];
        if (extension === undefined) {
            throw new Error(`File type not supported. Use jpeg, png, gif, webp or avif.`)
        }

        if (file.size > maxImageUploadSize) {
            throw new Error(`File is too large. Maximum size is ${convertBtyes(maxImageUploadSize, "mb")} MB`)
        }

        const imageFileName = `${crypto.randomUUID()}.${extension}`
        const imagePath = path.join(userUploadedImagesDirectory, imageFileName)

        const buffer = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(imagePath, buffer);

        return imageFileName
    }))

    return NextResponse.json({
        imageNames: addedImageNames,
    });
}
