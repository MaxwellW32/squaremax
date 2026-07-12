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
