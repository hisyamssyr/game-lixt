import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.execute(sql`SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%thread%'`);
    console.log('Routines:', res);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
main();
