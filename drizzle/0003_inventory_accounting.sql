-- Inventory accounting upgrade: product costs (COGS), payment methods,
-- discounts, refunds, and a business-expenses ledger (additive, idempotent).

ALTER TABLE "tenantProducts" ADD COLUMN IF NOT EXISTS "costCents" integer NOT NULL DEFAULT 0;

ALTER TABLE "tenantSales" ADD COLUMN IF NOT EXISTS "discountCents" integer NOT NULL DEFAULT 0;
ALTER TABLE "tenantSales" ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(20) NOT NULL DEFAULT 'cash';
ALTER TABLE "tenantSales" ADD COLUMN IF NOT EXISTS "status" varchar(16) NOT NULL DEFAULT 'completed';

CREATE TABLE IF NOT EXISTS "tenantExpenses" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "label" varchar(160) NOT NULL,
    "category" varchar(60) NOT NULL DEFAULT 'general',
    "amountCents" integer NOT NULL,
    "incurredAt" timestamp NOT NULL DEFAULT now(),
    "note" text NOT NULL DEFAULT '',
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantExpenseTenantIndex" ON "tenantExpenses" ("tenantId");
CREATE INDEX IF NOT EXISTS "tenantExpenseDateIndex" ON "tenantExpenses" ("tenantId", "incurredAt");
