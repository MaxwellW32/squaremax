# Overhaul Changelog

One line per behavior-relevant refactor/change, newest last. Audit summary first.

## Phase 0 audit summary (2026-07-12)
- Next.js 14.2.35 App Router, custom `server.js` (Next + raw `ws` websocket rooms per websiteId).
- Two disconnected systems: specifications form (emails only) and template builder (hot-swaps
  template `defaultData`, not form data). "Form → premade design preview" bridge does not exist yet.
- Templates client-only (`ssr:false`), rendered in iframe at internal UUID URLs; every template
  imports `app/globals.css` (the theming entanglement).
- Registry `utility/globalTemplates.tsx` is string-spliced ON DISK at runtime — incompatible with
  immutable deploys/ISR.
- Dead: jotai (unused), socket.io + socket.io-client (real impl is raw ws), testIt prototype page,
  `getTemplatesByFamily` stub, commented Handlebars block in handleNodeEmails.
- Broken: two templates import non-existent `containersType`; hidden because tsconfig excludes
  `websiteTemplates/` from typechecking.
- No Stripe. Email via nodemailer/Hostinger SMTP. DB: Drizzle + pg (websites, pages,
  usedComponents, templates, categories, styles, + next-auth tables).

## Changes
- Upgraded: Next 14.2.35 → 16.2.10 (Turbopack builds), React 18 → 19.2, Zod 3 → 4.4, Tailwind 3 → 4.3
  (CSS-first config; deleted tailwind.config.ts), Drizzle 0.34 → 0.45, drizzle-kit 0.25 → 0.31,
  next-auth beta.22 → beta.31, pg/ws/sharp/octokit/jszip to latest. Added stripe + resend (used from Phase 3).
- TypeScript pinned to 5.9 (TS 7 native compiler not yet supported by Next 16's build integration).
- ESLint 9 + flat config (eslint.config.mjs); ESLint 10 incompatible with eslint-config-next's react plugin.
  Legacy builder dirs have react-compiler rules downgraded to warnings pending Phase 1-4 replacement.
- nodemailer pinned to ^7 (next-auth peer dependency ceiling), not v9.
- Removed dead deps: jotai, socket.io, socket.io-client, react-moment, uuid/@types/uuid
  (uuid → crypto.randomUUID; react-moment → Intl helpers in utility/dates.ts).
- BEHAVIOR: template registry (utility/globalTemplates.tsx) is now static — no runtime file mutation.
  addTemplate/deleteTemplate no longer splice source code; new templates need one registry line + deploy.
  (Old approach broke immutable deploys/ISR; whole flow is superseded by the Phase 4 registry.)
- Migrated 8 pages to Next 15/16 async params/searchParams APIs.
- websiteTemplates/ now typechecked (removed tsconfig exclude); fixed broken containersType imports.
- Fixed saveToStorage anys (generics), @ts-ignore → typed narrow in handleServerFiles,
  require(dotenv) → import in drizzle.config.ts, removed redundant dotenv load in handleNodeEmails.
- package.json: added `typecheck` script; `lint` is now `eslint .` (next lint removed in Next 16).
- Added lib/env.ts: Zod-validated env access (SKIP_ENV_VALIDATION escape hatch for CI); .env.example documents all vars.
- db/index.ts + handleNodeEmails now consume lib/env (no scattered process.env / dotenv loads).
- SECURITY: fixed path traversal in /api/userImages/view (unvalidated imageName reached fs.readFile; no auth). Now uuid.ext regex + resolved-path containment + 400/404 responses + immutable cache header.
- /api/userImages/add: mime allowlist (jpeg/png/gif/webp/avif) + File instance check; extension derived from allowlist, not raw mime split.
- Deleted dead code: app/websites/(hideNav)/testIt (alternate render prototype), utility/globalState.tsx (unused).
