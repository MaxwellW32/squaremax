export function convertBtyes(bytes: number, option: "kb" | "mb" | "gb") {
    if (option === "kb") {
        return bytes / 1024
    } else if (option === "mb") {
        return (bytes / 1024) / 1024
    } else {
        return ((bytes / 1024) / 1024) / 1024
    }
}