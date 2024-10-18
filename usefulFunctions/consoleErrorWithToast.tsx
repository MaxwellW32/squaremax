import { toast } from "react-hot-toast";

export function consoleErrorWithToast(error: unknown, userErrorText?: string, name?: string) {
    const seenError = error as Error

    console.log(`$error ${name === undefined ? "" : `with ${name}`}`, seenError);

    toast.error(userErrorText !== undefined ? userErrorText : seenError.message)
}