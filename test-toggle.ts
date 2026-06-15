import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    // get a user and a list
    const lists = await db.execute(sql`SELECT * FROM list LIMIT 1`);
    const users = await db.execute(sql`SELECT * FROM users LIMIT 1`);
    
    if (lists.length === 0 || users.length === 0) {
      console.log('No lists or users found');
      return;
    }
    
    const listId = lists[0].list_id;
    const userId = users[0].user_id;
    
    console.log(`Testing with user ${userId} and list ${listId}`);
    
    // Call toggle procedure
    await db.execute(sql`CALL toggle_list_vote(${userId}::uuid, ${listId}::uuid, true)`);
    console.log('Call succeeded!');
    
    const votes = await db.execute(sql`SELECT * FROM list_votes WHERE list_id = ${listId} AND user_id = ${userId}`);
    console.log('Votes after toggle:', votes);
    
    // Toggle again
    await db.execute(sql`CALL toggle_list_vote(${userId}::uuid, ${listId}::uuid, true)`);
    const votes2 = await db.execute(sql`SELECT * FROM list_votes WHERE list_id = ${listId} AND user_id = ${userId}`);
    console.log('Votes after second toggle:', votes2);

  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
}
main();
