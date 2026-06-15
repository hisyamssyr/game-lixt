import { List } from 'lucide-react';
import { CreateListModal } from '@/components/modals/CreateListModal';
import { toGame, toList } from '@/lib/ui-data';
import { ListsClientView } from '@/components/ListsClientView';

import { db } from '@/lib/db';
import { games, list, list_items, users } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getServerSession } from '@/lib/auth';

export default async function ListsPage() {
  const session = await getServerSession();
  const userId = session?.user?.user_id || '00000000-0000-0000-0000-000000000000';

  const [listsRaw, gamesRaw] = await Promise.all([
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
      .orderBy(desc(list.created_at)),
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
      .limit(80),
  ]);

  const lists = listsRaw.map(toList);
  const gamesList = gamesRaw.map(toGame);

  return (
    <div style={{ background: 'var(--gl-bg-base)', minHeight: '100vh', paddingBottom: 80 }}>
      <section style={{ background: 'var(--gl-bg-surface)', borderBottom: '1px solid var(--gl-border)', padding: '40px 24px' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 24, background: 'rgba(57,255,133,0.1)', border: '1px solid rgba(57,255,133,0.2)', marginBottom: 12 }}>
              <List size={13} color="#39FF85" />
              <span style={{ color: '#39FF85', fontSize: '0.75rem', fontWeight: 600 }}>Community Curated</span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>Curated Lists</h1>
            <p style={{ margin: 0, color: '#8888A0', fontSize: '0.88rem' }}>{lists.length} lists hand-picked by the community</p>
          </div>
          <CreateListModal />
        </div>
      </section>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <ListsClientView initialLists={lists} games={gamesList} />
      </main>
    </div>
  );
}
