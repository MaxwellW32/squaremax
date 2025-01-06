export function addScopeToCSS(cssString: string, scopedClass: string) {
    // Regex to match class (.classname) and ID (#id) selectors
    const classAndIdRegex = /(?<=^|[^a-zA-Z0-9-_.#])([.#][a-zA-Z0-9_-]+)/g;

    // Replace matches with scoped versions
    return cssString.replace(classAndIdRegex, (match) => {
        return `.${scopedClass} ${match}`;
    });
}