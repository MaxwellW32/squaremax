-- v3: online orders, uploaded media ledger, renewal-reminder bookkeeping,
-- gateway currency audit columns (additive, idempotent).

-- renewal emails are idempotent per period (see app/api/cron/renewals)
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "renewalReminderFor" timestamp;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "lapseNoticeFor" timestamp;

-- amountCents stays the USD list price; the gateway may be charged in JMD
ALTER TABLE "tenantPayments" ADD COLUMN IF NOT EXISTS "gatewayCurrency" varchar(3) NOT NULL DEFAULT 'usd';
ALTER TABLE "tenantPayments" ADD COLUMN IF NOT EXISTS "gatewayAmountCents" integer;

-- online orders from the shop section (become tenantSales rows when paid)
CREATE TABLE IF NOT EXISTS "tenantOrders" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "items" json NOT NULL,
    "subtotalCents" integer NOT NULL,
    "taxCents" integer NOT NULL,
    "totalCents" integer NOT NULL,
    "status" varchar(16) NOT NULL DEFAULT 'new',
    "fulfillment" varchar(16) NOT NULL DEFAULT 'pickup',
    "customerId" varchar(255) REFERENCES "tenantCustomers"("id") ON DELETE SET NULL,
    "customerName" varchar(120) NOT NULL,
    "customerEmail" varchar(160) NOT NULL DEFAULT '',
    "customerPhone" varchar(40) NOT NULL DEFAULT '',
    "address" text NOT NULL DEFAULT '',
    "note" text NOT NULL DEFAULT '',
    "saleId" varchar(255),
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantOrderTenantIndex" ON "tenantOrders" ("tenantId");
CREATE INDEX IF NOT EXISTS "tenantOrderDateIndex" ON "tenantOrders" ("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "tenantOrderCustomerIndex" ON "tenantOrders" ("customerId");

-- uploaded media ledger (files live in R2 or local disk)
CREATE TABLE IF NOT EXISTS "tenantMedia" (
    "id" varchar(255) PRIMARY KEY,
    "tenantId" varchar(255) NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "key" text NOT NULL,
    "url" text NOT NULL,
    "bytes" integer NOT NULL,
    "width" integer NOT NULL DEFAULT 0,
    "height" integer NOT NULL DEFAULT 0,
    "contentType" varchar(80) NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tenantMediaTenantIndex" ON "tenantMedia" ("tenantId");
