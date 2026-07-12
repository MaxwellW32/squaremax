-- Squaremax Sites: multi-tenant hosted product (additive only, idempotent).
-- Applied 2026-07-12. No existing tables are altered.

DO $$ BEGIN
    CREATE TYPE "tenantStatus" AS ENUM ('draft', 'live', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tenantPaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "tenantBookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "tenants" (
    "id" varchar(255) PRIMARY KEY,
    "slug" varchar(63) NOT NULL,
    "businessName" varchar(160) NOT NULL,
    "ownerUserId" varchar(255) NOT NULL REFERENCES "users"("id"),
    "status" "tenantStatus" NOT NULL DEFAULT 'draft',
    "currentPeriodEnd" timestamp,
    "customDomain" varchar(255),
    "content" json NOT NULL,
    "config" json NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
    CONSTRAINT "tenants_customDomain_unique" UNIQUE("customDomain")
);
CREATE UNIQUE INDEX IF NOT EXISTS "tenantSlugIndex" ON "tenants" ("slug");
CREATE INDEX IF NOT EXISTS "tenantOwnerIndex" ON "tenants" ("ownerUserId");

CREATE TABLE IF NOT EXISTS "tenantPayments" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id"),
    "amountCents" integer NOT NULL,
    "status" "tenantPaymentStatus" NOT NULL DEFAULT 'pending',
    "gatewayTransactionId" text,
    "periodStart" timestamp,
    "periodEnd" timestamp,
    "addonsSnapshot" json NOT NULL DEFAULT '[]',
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantPaymentTenantIndex" ON "tenantPayments" ("tenantId");

CREATE TABLE IF NOT EXISTS "tenantBookings" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id"),
    "serviceName" varchar(120) NOT NULL,
    "customerName" varchar(120) NOT NULL,
    "customerEmail" varchar(160) NOT NULL,
    "customerPhone" varchar(40) NOT NULL DEFAULT '',
    "startsAt" timestamp NOT NULL,
    "endsAt" timestamp NOT NULL,
    "status" "tenantBookingStatus" NOT NULL DEFAULT 'pending',
    "notes" text NOT NULL DEFAULT '',
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantBookingTenantIndex" ON "tenantBookings" ("tenantId");
CREATE INDEX IF NOT EXISTS "tenantBookingStartIndex" ON "tenantBookings" ("tenantId", "startsAt");

CREATE TABLE IF NOT EXISTS "tenantAvailability" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id"),
    "dayOfWeek" integer NOT NULL,
    "openTime" varchar(5) NOT NULL,
    "closeTime" varchar(5) NOT NULL,
    "slotMinutes" integer NOT NULL DEFAULT 30
);
CREATE INDEX IF NOT EXISTS "tenantAvailabilityTenantIndex" ON "tenantAvailability" ("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "tenantAvailabilityDayIndex" ON "tenantAvailability" ("tenantId", "dayOfWeek");

CREATE TABLE IF NOT EXISTS "tenantMessages" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id"),
    "name" varchar(120) NOT NULL,
    "email" varchar(160) NOT NULL,
    "body" text NOT NULL,
    "read" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantMessageTenantIndex" ON "tenantMessages" ("tenantId");
