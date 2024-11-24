import fs from "fs/promises";

export async function ensureDirectoryExists(dirPath: string) {

    try {
        // Check if the directory exists by attempting to read it
        await fs.access(dirPath);

        // If no error is thrown, the directory exists
        console.log(`Directory already exists: ${dirPath}`);

    } catch (err) {
        // If an error occurs (e.g., directory does not exist), create the directory
        //@ts-expect-error ts not seeing type
        if (err.code === 'ENOENT') {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`Directory created: ${dirPath}`);

        } else {
            // Handle any other errors that might occur
            console.error('Error checking or creating directory:', err);
        }
    }
}