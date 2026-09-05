import { z } from "zod";

//single source of truth for environment variables.
//server-only — never import from client components.

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: z.string().min(1),

    //smtp (contact/intake emails, tenant notifications, sign-in links)
    EMAIL: z.email(),
    EMAIL_PASS: z.string().min(1),
    SMTP_HOST: z.string().min(1).default("smtp.hostinger.com"),
    SMTP_PORT: z.coerce.number().int().positive().default(465),

    //auth.js reads AUTH_* itself; validated here so misconfig fails loudly at boot.
    //Google/GitHub are optional — the sign-in page only shows configured providers;
    //email magic links (SMTP above) always work.
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),

    //billing: PowerTranz hosted-page gateway (cheers pattern) — optional until
    //credentials exist; POWERTRANZ_SIMULATE=1 exercises the flow locally
    POWERTRANZ_ID: z.string().min(1).optional(),
    POWERTRANZ_PASSWORD: z.string().min(1).optional(),
    POWERTRANZ_HPP_PAGESET: z.string().min(1).optional(),
    POWERTRANZ_HPP_PAGENAME: z.string().min(1).optional(),
    POWERTRANZ_BASE_URL: z.url().optional(),
    POWERTRANZ_SIMULATE: z.enum(["0", "1"]).optional(),
    //prices are quoted in USD everywhere; if the merchant account settles in
    //JMD the gateway is charged the converted amount at JMD_PER_USD
    POWERTRANZ_CURRENCY: z.enum(["usd", "jmd"]).default("usd"),
    JMD_PER_USD: z.coerce.number().positive().optional(),

    //daily renewal-reminder cron authenticates with this bearer token
    CRON_SECRET: z.string().min(16).optional(),

    //custom-domain add-on: the IP clients point their A record at (shown in
    //the dashboard instructions and used for the DNS check)
    CUSTOM_DOMAIN_A_RECORD: z.string().min(1).optional(),

    //image uploads: Cloudflare R2 (S3-compatible). Without these, uploads go
    //to local disk (userUploadedData/) — fine for dev and the first clients.
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    R2_PUBLIC_URL: z.url().optional(),

    //marketing-site analytics / ad measurement (never loaded on tenant pages)
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional(),

    //canonical origin for absolute urls (payment callbacks, QR codes, emails).
    //dev default is localhost so simulated payments post back to THIS machine,
    //never to production
    SITE_URL: z.url().default(
        process.env.NODE_ENV === "production" ? "https://squaremaxtech.com" : "http://localhost:3000"
    ),
}).refine(
    value => value.POWERTRANZ_CURRENCY !== "jmd" || value.JMD_PER_USD !== undefined,
    { path: ["JMD_PER_USD"], message: "required when POWERTRANZ_CURRENCY=jmd" },
).refine(
    value => {
        const r2 = [value.R2_ACCOUNT_ID, value.R2_ACCESS_KEY_ID, value.R2_SECRET_ACCESS_KEY, value.R2_BUCKET, value.R2_PUBLIC_URL]
        const set = r2.filter(part => part !== undefined).length
        return set === 0 || set === r2.length
    },
    { path: ["R2_BUCKET"], message: "set all five R2_* variables or none" },
);

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    //escape hatch for CI/builds without secrets: SKIP_ENV_VALIDATION=1 npm run build
    if (process.env.SKIP_ENV_VALIDATION) {
        return { POWERTRANZ_CURRENCY: "usd", SMTP_HOST: "smtp.hostinger.com", SMTP_PORT: 465, ...process.env } as unknown as Env;
    }

    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const issues = parsed.error.issues.map(issue => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
        throw new Error(`Invalid environment variables:\n${issues}`);
    }

    return parsed.data;
}

export const env = loadEnv();
