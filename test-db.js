import postgres from 'postgres';
import fs from 'fs';

// simple dotenv parser
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  console.log("DB URL:", process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'toggle_list_vote'`;
    console.log("toggle_list_vote:", res[0]?.routine_definition);

    const countRes = await sql`SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'count_list_vote'`;
    console.log("count_list_vote:", countRes[0]?.routine_definition);

    const votes = await sql`SELECT * FROM list_votes`;
    console.log("votes in DB:", votes);
    if (votes.length > 0) {
      const listId = votes[0].list_id;
      const countTest = await sql`SELECT count_list_vote(${listId}) as total`;
      console.log("count_list_vote result:", countTest);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
run();
