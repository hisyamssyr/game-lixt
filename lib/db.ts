import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = globalThis._postgresClient || postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase Transaction Pooler (PgBouncer)
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._postgresClient = client;
}

export const db = drizzle(client);

declare global {
  var _postgresClient: postgres.Sql<{}> | undefined;
}