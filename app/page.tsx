import { HomeView } from '@/components/pages/HomeView';
import { toGame, toList } from '@/lib/ui-data';
import { db } from '@/lib/db';
import { games, list, list_items, users } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getServerSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession();
  const userId = session?.user?.user_id || '00000000-0000-0000-0000-000000000000';

  const [gamesRaw, listsRaw] = await Promise.all([
    db
      .select({
        game_id: games.game_id,
        title: games.title,
        developer: games.developer,
        release_date: games.release_date,
        average_rating: games.average_rating,
        cover_url: games.cover_url,
      })
      .from(games)
      .orderBy(desc(games.average_rating))
      .limit(20),
    db
      .select({
        list_id: list.list_id,
        title: list.title,
        description: list.description,
        list_cover_url: list.list_cover_url,
        created_at: list.created_at,
        username: users.username,
        vote_score: sql<number>`count_list_vote(${list.list_id})`.as('vote_score'),
        game_count: sql<number>`CAST(COUNT(DISTINCT ${list_items.item_id}) AS INTEGER)`.as('game_count'),
        covers: sql<string[]>`array_agg(DISTINCT ${games.cover_url}) FILTER (WHERE ${games.cover_url} IS NOT NULL)`.as('covers'),
        has_upvoted: sql<boolean>`EXISTS(SELECT 1 FROM list_votes WHERE list_id = ${list.list_id} AND user_id = ${userId}::uuid AND vote_type = true)`.as('has_upvoted')
      })
      .from(list)
      .innerJoin(users, eq(list.user_id, users.user_id))
      .leftJoin(list_items, eq(list.list_id, list_items.list_id))
      .leftJoin(games, eq(list_items.game_id, games.game_id))
      .groupBy(list.list_id, users.username)
      .orderBy(desc(sql`count_list_vote(${list.list_id})`))
      .limit(20)
  ]);

  const gamesList = gamesRaw.map(toGame);
  const listsList = listsRaw.map(toList);

  return <HomeView games={gamesList} reviews={[]} lists={listsList} />;
}
