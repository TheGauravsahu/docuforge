import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { ENV } from './env.js';
import * as schema from '../db/schema.js';

// Connection client configured for Neon Serverless / PostgreSQL
const queryClient = postgres(ENV.DATABASE_URL, { max: 10, idle_timeout: 20 });
export const db = drizzle(queryClient, { schema });

export async function verifyDbConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log(`✅ Database connected successfully!`);
    return true;
  } catch (err) {
    console.error(`❌ Database connection failed:`, err.message);
    process.exit(1);
  }
}
