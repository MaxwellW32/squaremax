import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "public/**",
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        //node entrypoints are CommonJS by design
        files: ["*.config.js"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];

export default config;
