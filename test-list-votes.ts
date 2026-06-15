import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const listVotes = await db.execute(sql`SELECT * FROM list_votes`);
    console.log('LIST VOTES:', listVotes);
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
}
main();
