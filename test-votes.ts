import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const threadVotes = await db.execute(sql`SELECT * FROM thread_votes`);
    console.log('THREAD VOTES:', threadVotes);

    const rootThreads = await db.execute(sql`SELECT * FROM thread WHERE replying_to IS NULL LIMIT 1`);
    console.log('ROOT THREADS:', rootThreads);

    if (rootThreads.length > 0) {
      const threadId = rootThreads[0].thread_id;
      const userId = rootThreads[0].user_id;
      
      console.log(`Calling toggle_thread_vote for user ${userId} and thread ${threadId} with true...`);
      await db.execute(sql`CALL toggle_thread_vote(${userId}::uuid, ${threadId}::uuid, true)`);
      
      const threadVotesAfter = await db.execute(sql`SELECT * FROM thread_votes`);
      console.log('THREAD VOTES AFTER CALL:', threadVotesAfter);
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
main();
