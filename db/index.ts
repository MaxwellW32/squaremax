import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from "./schema"
import { env } from '@/lib/env';

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
});

export const db = drizzle(pool, { schema });
