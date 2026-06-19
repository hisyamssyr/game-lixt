import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT 
        t.thread_id, 
        t.user_id, 
        t.comment, 
        t.created_at, 
        count_thread_vote(t.thread_id) as vote_score,
        (SELECT COUNT(*) FROM thread r WHERE r.replying_to = t.thread_id) as reply_count
      FROM thread t
      WHERE t.replying_to IS NULL
      ORDER BY t.created_at DESC
      LIMIT 1
    `);
    console.log('Query success:', res);
    process.exit(0);
  } catch (e) {
    console.error('Error in query:', e);
    process.exit(1);
  }
}
main();
