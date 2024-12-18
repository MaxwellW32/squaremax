import { toast } from "react-hot-toast";
import { ZodError } from 'zod';

export function consoleAndToastError(error: unknown, userErrorText?: string): void {
    let seenAsZod = false

    //check if zod error
    try {
        JSON.parse(`${error}`)
        seenAsZod = true

    } catch (error) {
    }

    if (seenAsZod) {
        // Handle ZodError
        let combinedErrorStr = ""
        let seenError = error as ZodError

        seenError.issues.forEach((err) => {
            combinedErrorStr += `${err.message}\n`
        });

        toast.error(userErrorText === undefined ? combinedErrorStr : userErrorText)
    } else {
        // Handle standard JavaScript Error
        const seenErr = error as Error
        console.error("$Error", seenErr);
        toast.error(userErrorText === undefined ? seenErr.message : userErrorText)
    }
}