import path from "path";
import fs from "fs/promises";
import { v4 as uuidV4 } from "uuid"
import { NextResponse } from "next/server";
import { ensureDirectoryExists } from "@/usefulFunctions/fileManagement";

export async function POST(request: Request) {
    const formData = await request.formData();
    const body = Object.fromEntries(formData);

    const bodyEntries = Object.entries(body)
    const imageDirectory = path.join(process.cwd(), "userUploadedData", "images")

    //ensure it exists
    await ensureDirectoryExists(imageDirectory)

    const addedImageNames = await Promise.all(bodyEntries.map(async eachEntry => {
        const eachEntryValueFile = eachEntry[1]

        const file = eachEntryValueFile as File;
        const id = uuidV4()
        const imageType = file.type.split('/')[1]
        const imageFileName = `${id}.${imageType}`
        const imagePath = path.join(imageDirectory, imageFileName)

        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit

        // Check if file is an image (this will be redundant because of the 'accept' attribute, but can be good for double-checking)
        if (!file.type.startsWith("image/")) {
            throw new Error(`File is not an image.`)
        }

        // Check the file size
        if (file.size > maxSizeInBytes) {
            throw new Error(`File is too large. Maximum size is 5MB.`)
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(imagePath, buffer);

        return imageFileName
    })
    )

    return NextResponse.json({
        imageNames: addedImageNames,
    });
}



