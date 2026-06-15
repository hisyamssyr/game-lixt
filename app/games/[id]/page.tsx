import { GameDetailView } from '@/components/pages/GameDetailView';
import { apiGet, mapStatus, toGame, toReview, toList } from '@/lib/ui-data';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user_library, list as userLists } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();

  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  const [gameResponse, reviewResponse, featuredListsResponse] = await Promise.all([
    apiGet<{ success?: boolean; game?: unknown }>(`/api/games/${id}`, {}, cookieString),
    apiGet<unknown[]>(`/api/reviews?game_id=${id}`, [], cookieString),
    apiGet<unknown[]>(`/api/lists?game_id=${id}`, [], cookieString),
  ]);

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
  const safeReviews = JSON.parse(JSON.stringify(reviewResponse.map((review) => toReview(review, id))));
  const safeLists = JSON.parse(JSON.stringify(myLists));
  const safeFeaturedLists = JSON.parse(JSON.stringify(featuredListsResponse.map(toList)));

  return <GameDetailView game={safeGame} reviews={safeReviews} initialStatus={initialStatus} myLists={safeLists} featuredLists={safeFeaturedLists} />;
}
