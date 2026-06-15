import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = globalThis._postgresClient ?? postgres(process.env.DATABASE_URL!, {
  prepare: false,   // Required for Supabase Transaction Pooler (PgBouncer)
  max: 5,           // Keep well under Supabase session-mode pool_size of 15
  idle_timeout: 20, // Release idle connections after 20 s
  connect_timeout: 10,
});

// Cache the client globally for warm serverless invocations (dev AND production)
globalThis._postgresClient = client;

export const db = drizzle(client);

declare global {
  var _postgresClient: postgres.Sql<{}> | undefined;
}