import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const procs = await db.execute(sql`
      SELECT prosrc 
      FROM pg_proc 
      WHERE proname = 'count_list_vote'
    `);
    console.log('PROCEDURE:', procs[0]?.prosrc || 'Not found');
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
}
main();
