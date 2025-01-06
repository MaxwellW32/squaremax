export function deepClone(object: unknown) {
    return JSON.parse(JSON.stringify(object))
}