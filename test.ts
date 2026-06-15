import 'dotenv/config';
import { db } from './lib/db';
import { sql } from 'drizzle-orm';
async function run() {
  try {
    const res = await db.execute(sql`SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'toggle_list_vote'`);
    console.log("toggle_list_vote:", res[0]?.routine_definition);
    
    const countRes = await db.execute(sql`SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'count_list_vote'`);
    console.log("count_list_vote:", countRes[0]?.routine_definition);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
