-- Multi-month subscription payments: one charge can buy several 30-day
-- periods, so the customer isn't back at the card form every month
-- (additive, idempotent — existing rows are single-month charges).

ALTER TABLE "tenantPayments" ADD COLUMN IF NOT EXISTS "months" integer NOT NULL DEFAULT 1;
