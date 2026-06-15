import { GameDetailView } from '@/components/pages/GameDetailView';
import { mapStatus, toGame, toReview, toList } from '@/lib/ui-data';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user_library, list as userLists, games, genres, game_genres, achievements } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const [gameRows] = await db.select().from(games).where(eq(games.game_id, id)).limit(1);
  const [genreRows, achievementRows] = await Promise.all([
    db.select({ genre_id: genres.genre_id, genre_name: genres.genre_name }).from(game_genres).innerJoin(genres, eq(game_genres.genre_id, genres.genre_id)).where(eq(game_genres.game_id, id)),
    db.select().from(achievements).where(eq(achievements.game_id, id)),
  ]);
  const gameResponse = gameRows ? { game: { ...gameRows, genres: genreRows, achievements: achievementRows } } : {};

  const currentUserId = session?.user?.user_id || '00000000-0000-0000-0000-000000000000';
  const { reviews, users, list, list_items } = await import('@/db/schema');
  const { desc, sql } = await import('drizzle-orm');

  const reviewResponse = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      username: users.username,
      avatar_url: users.avatar_url,
      rating: reviews.rating,
      review_text: reviews.review_text,
      created_at: reviews.created_at,
      updated_at: reviews.updated_at,
      upvotes: sql<number>`(SELECT count(*) FROM review_votes WHERE review_id = ${reviews.review_id} AND vote_type = true)::integer`.as('upvotes'),
      downvotes: sql<number>`(SELECT count(*) FROM review_votes WHERE review_id = ${reviews.review_id} AND vote_type = false)::integer`.as('downvotes'),
      userVote: sql<boolean | null>`(SELECT vote_type FROM review_votes WHERE review_id = ${reviews.review_id} AND user_id = ${currentUserId}::uuid LIMIT 1)`.as('userVote'),
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.user_id, users.user_id))
    .where(eq(reviews.game_id, id))
    .orderBy(desc(reviews.created_at));

  const featuredListsResponse = await db
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
      has_upvoted: sql<boolean>`EXISTS(SELECT 1 FROM list_votes WHERE list_id = ${list.list_id} AND user_id = ${currentUserId}::uuid AND vote_type = true)`.as('has_upvoted')
    })
    .from(list)
    .innerJoin(users, eq(list.user_id, users.user_id))
    .leftJoin(list_items, eq(list.list_id, list_items.list_id))
    .leftJoin(games, eq(list_items.game_id, games.game_id))
    .where(sql`EXISTS(SELECT 1 FROM list_items li WHERE li.list_id = ${list.list_id} AND li.game_id = ${id}::uuid)`)
    .groupBy(list.list_id, users.username)
    .orderBy(desc(list.created_at))
    .limit(4);

  let initialStatus = null;
  let myLists: { list_id: string; title: string }[] = [];

  if (session?.user?.user_id) {
    const [lib] = await db
      .select({ play_status: user_library.play_status })
      .from(user_library)
      .where(and(eq(user_library.user_id, session.user.user_id), eq(user_library.game_id, id)))
      .limit(1);
    
    if (lib) {
      initialStatus = mapStatus(lib.play_status);
    }

    myLists = await db
      .select({ list_id: userLists.list_id, title: userLists.title })
      .from(userLists)
      .where(eq(userLists.user_id, session.user.user_id));
  }

  if (!gameResponse.game) {
    return <div style={{ minHeight: '60vh', background: 'var(--gl-bg-base)', color: '#F0F0F5', padding: 48 }}>Game not found.</div>;
  }

  const safeGame = JSON.parse(JSON.stringify(toGame(gameResponse.game)));
  const safeReviews = JSON.parse(JSON.stringify((reviewResponse as unknown[]).map((review) => toReview(review, id))));
  const safeLists = JSON.parse(JSON.stringify(myLists));
  const safeFeaturedLists = JSON.parse(JSON.stringify((featuredListsResponse as unknown[]).map(toList)));

  return <GameDetailView game={safeGame} reviews={safeReviews} initialStatus={initialStatus} myLists={safeLists} featuredLists={safeFeaturedLists} />;
}
