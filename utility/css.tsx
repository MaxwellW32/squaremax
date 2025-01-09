export function addScopeToCSS(cssString: string, idPrefix: string) {
    // Regex to match class (.classname) and ID (#id) selectors
    const classAndIdRegex = /(?<=^|[^a-zA-Z0-9-_.#])([.#][a-zA-Z0-9_-]+)/g;

    // Replace matches with the ID-prefixed versions
    return cssString.replace(classAndIdRegex, (match) => {
        return match[0] + idPrefix + "____" + match.slice(1);
    });
}
