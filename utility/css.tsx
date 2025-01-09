export function addScopeToCSS(cssString: string, idPrefix: string) {
    return cssString
        .split("\n") // Split CSS into lines
        .map((line) => {
            // Trim leading whitespace to check the first character
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith(".") || trimmedLine.startsWith("#")) {
                // Match the selector and add the prefix
                return line.replace(
                    /^([.#][a-zA-Z_-][a-zA-Z0-9_-]*)/,
                    (match) => `${match[0]}${idPrefix}____${match.slice(1)}`
                );
            }
            // Leave lines that don't start with a selector unchanged
            return line;
        })
        .join("\n"); // Join lines back into a single string
}


