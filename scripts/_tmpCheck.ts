import "./loadEnv"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { desc } from "drizzle-orm"
import * as schema from "../db/schema"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL, max: 2 }), { schema })

async function main() {
    const rows = await db.query.tenants.findMany()
    for (const t of rows) {
        console.log(`slug=${t.slug} id=${t.id.slice(0,8)} status=${t.status} periodEnd=${t.currentPeriodEnd?.toISOString() ?? "null"} addons=${JSON.stringify(t.config.enabledAddons)}`)
    }
    console.log("--- payments (newest first)")
    const pays = await db.select().from(schema.tenantPayments).orderBy(desc(schema.tenantPayments.createdAt)).limit(25)
    for (const p of pays) {
        console.log(`${p.createdAt.toISOString()} t=${p.tenantId.slice(0,8)} $${(p.amountCents/100).toFixed(2)} ${p.status.padEnd(9)} txn=${(p.gatewayTransactionId ?? "-").slice(0,12)} ${p.periodStart?.toISOString() ?? "-"} -> ${p.periodEnd?.toISOString() ?? "-"}`)
    }
    process.exit(0)
}
main()
