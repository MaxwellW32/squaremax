import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
    test: {
        include: ["tests/**/*.test.ts"],
        //tests import pure modules that sit behind files validating env at
        //import time (registry -> sections -> islands -> db) — skip validation
        env: {
            SKIP_ENV_VALIDATION: "1",
        },
    },
})
