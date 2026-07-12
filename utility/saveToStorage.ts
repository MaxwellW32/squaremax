export function saveToLocalStorage(keyName: string, item: unknown) {
    localStorage.setItem(keyName, JSON.stringify(item));
}

export function retreiveFromLocalStorage<T = unknown>(keyName: string): T | null {
    const initialkeyItem = localStorage.getItem(keyName);

    if (initialkeyItem === null) return null

    return JSON.parse(initialkeyItem) as T;
}

export function removeFromLocalStorage(keyName: string): void {
    localStorage.removeItem(keyName);
}
