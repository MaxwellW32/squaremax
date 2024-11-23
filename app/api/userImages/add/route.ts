import path from "path";
import fs from "fs/promises";
import { v4 as uuidV4 } from "uuid"
import { NextResponse } from "next/server";
import { ensureDirectoryExists } from "@/usefulFunctions/fileManagement";

export async function POST(request: Request) {
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    const file = (body.file as File) || null;

    if (!file) {
        throw new Error("didn't see file")
    }

    const id = uuidV4()
    const seenType = file.type.split('/')[1]
    const imageFileName = `${id}.${seenType}`
    const imageDirectory = path.join(process.cwd(), "userUploadedData", "images")
    const imagePath = path.join(imageDirectory, imageFileName)

    //ensure it exists
    await ensureDirectoryExists(imageDirectory)

    const buffer = Buffer.from(await file.arrayBuffer());

    fs.writeFile(imagePath, buffer);

    return NextResponse.json({
        name: imageFileName,
    });
}



