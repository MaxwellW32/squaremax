import { z } from "zod";

//single source of truth for environment variables.
//server-only — never import from client components.

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: z.string().min(1),

    //smtp (contact/specification emails)
    EMAIL: z.email(),
    EMAIL_PASS: z.string().min(1),

    //auth.js reads AUTH_* itself; validated here so misconfig fails loudly at boot
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),

    //billing + transactional email — optional until Phase 3 goes live
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    RESEND_API_KEY: z.string().min(1).optional(),

    //canonical origin for absolute urls (tenant QR codes, emails)
    SITE_URL: z.url().default("https://squaremaxtech.com"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    //escape hatch for CI/builds without secrets: SKIP_ENV_VALIDATION=1 npm run build
    if (process.env.SKIP_ENV_VALIDATION) {
        return process.env as unknown as Env;
    }

    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const issues = parsed.error.issues.map(issue => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
        throw new Error(`Invalid environment variables:\n${issues}`);
    }

    return parsed.data;
}

export const env = loadEnv();
