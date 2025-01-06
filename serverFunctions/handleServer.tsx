"use server"
import fs from "fs/promises"
import path from "path";

export async function checkIfFileExists(filePath: string) {
    const fullFilePath = path.join(process.cwd(), filePath)

    try {
        await fs.access(fullFilePath, fs.constants.F_OK);
        return true;

    } catch (error) {
        //@ts-ignore
        if (error.code === 'ENOENT') {
            return false;

        } else {
            throw error;
        }
    }
}
