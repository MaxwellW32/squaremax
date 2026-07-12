import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "websiteBuildsStarter/**",
            "websiteBuildsStagingArea/**",
            "public/**",
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        //node entrypoints are CommonJS by design
        files: ["server.js", "*.config.js"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        //legacy builder UI: replaced during the overhaul (Phases 1-4).
        //react-compiler rules stay visible as warnings but must not block new work.
        files: [
            "components/websites/**",
            "components/templates/**",
            "components/recursiveForm/**",
            "components/imageCarousel/**",
            "components/contactForm/**",
            "components/animateIntroText/**",
            "components/pages/**",
            "components/users/**",
            "components/githubOptions/**",
            "app/(marketing)/websites/**",
            "app/(marketing)/specifications/**",
            "app/(marketing)/projects/**",
            "websiteTemplates/**",
        ],
        rules: {
            "react-hooks/refs": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/purity": "warn",
            "react-hooks/static-components": "warn",
            "react-hooks/use-memo": "warn",
            "react-hooks/preserve-manual-memoization": "warn",
            "react-hooks/incompatible-library": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
        },
    },
];

export default config;
