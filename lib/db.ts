import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase Transaction Pooler (PgBouncer)
})
export const db = drizzle(client)