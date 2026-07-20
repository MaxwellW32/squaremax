-- Squaremax Sites v2: instance-based component model, tenant-scoped
-- customers, inventory add-on, announcement history (additive, idempotent).

DO $$ BEGIN
    CREATE TYPE "componentRegion" AS ENUM ('header', 'main', 'footer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "tenantPages" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "slug" varchar(40) NOT NULL DEFAULT '',
    "title" varchar(120) NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantPageTenantIndex" ON "tenantPages" ("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "tenantPageSlugIndex" ON "tenantPages" ("tenantId", "slug");

CREATE TABLE IF NOT EXISTS "tenantComponents" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "region" "componentRegion" NOT NULL DEFAULT 'main',
    "pageId" varchar(255) REFERENCES "tenantPages"("id") ON DELETE CASCADE,
    "order" integer NOT NULL DEFAULT 0,
    "category" varchar(40) NOT NULL,
    "variantId" varchar(80) NOT NULL,
    "data" json NOT NULL,
    "styles" json NOT NULL DEFAULT '{"tokens":{},"css":""}',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantComponentTenantIndex" ON "tenantComponents" ("tenantId");
CREATE INDEX IF NOT EXISTS "tenantComponentPageIndex" ON "tenantComponents" ("pageId");

CREATE TABLE IF NOT EXISTS "tenantCustomers" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "email" varchar(160) NOT NULL,
    "name" varchar(120) NOT NULL DEFAULT '',
    "phone" varchar(40) NOT NULL DEFAULT '',
    "passwordHash" text NOT NULL,
    "notifyEmail" boolean NOT NULL DEFAULT true,
    "notifyWhatsapp" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantCustomerTenantIndex" ON "tenantCustomers" ("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "tenantCustomerEmailIndex" ON "tenantCustomers" ("tenantId", "email");

CREATE TABLE IF NOT EXISTS "tenantCustomerSessions" (
    "token" varchar(255) PRIMARY KEY,
    "customerId" varchar(255) NOT NULL REFERENCES "tenantCustomers"("id") ON DELETE CASCADE,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "expires" timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "tenantCustomerSessionCustomerIndex" ON "tenantCustomerSessions" ("customerId");

CREATE TABLE IF NOT EXISTS "tenantProducts" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "name" varchar(140) NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "priceCents" integer NOT NULL DEFAULT 0,
    "taxRateBps" integer NOT NULL DEFAULT 0,
    "stock" integer NOT NULL DEFAULT 0,
    "trackStock" boolean NOT NULL DEFAULT true,
    "imageSrc" text NOT NULL DEFAULT '',
    "active" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantProductTenantIndex" ON "tenantProducts" ("tenantId");

CREATE TABLE IF NOT EXISTS "tenantSales" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "items" json NOT NULL,
    "subtotalCents" integer NOT NULL,
    "taxCents" integer NOT NULL,
    "totalCents" integer NOT NULL,
    "customerId" varchar(255) REFERENCES "tenantCustomers"("id") ON DELETE SET NULL,
    "customerName" varchar(120) NOT NULL DEFAULT '',
    "note" text NOT NULL DEFAULT '',
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantSaleTenantIndex" ON "tenantSales" ("tenantId");
CREATE INDEX IF NOT EXISTS "tenantSaleDateIndex" ON "tenantSales" ("tenantId", "createdAt");

CREATE TABLE IF NOT EXISTS "tenantAnnouncements" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "subject" varchar(200) NOT NULL,
    "body" text NOT NULL,
    "sentTo" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantAnnouncementTenantIndex" ON "tenantAnnouncements" ("tenantId");

ALTER TABLE "tenantBookings" ADD COLUMN IF NOT EXISTS "customerId" varchar(255);
