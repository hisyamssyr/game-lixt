import { GameDetailView } from '@/components/pages/GameDetailView';
import { mapStatus, toGame, toReview, toList } from '@/lib/ui-data';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { user_library, list as userLists } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const [gameResponse, reviewResponse, featuredListsResponse] = await Promise.all([
    fetch(`${baseUrl}/api/games/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({})),
    fetch(`${baseUrl}/api/reviews?game_id=${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => []),
    fetch(`${baseUrl}/api/lists?game_id=${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => []),
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
  const safeReviews = JSON.parse(JSON.stringify((reviewResponse as unknown[]).map((review) => toReview(review, id))));
  const safeLists = JSON.parse(JSON.stringify(myLists));
  const safeFeaturedLists = JSON.parse(JSON.stringify((featuredListsResponse as unknown[]).map(toList)));

  return <GameDetailView game={safeGame} reviews={safeReviews} initialStatus={initialStatus} myLists={safeLists} featuredLists={safeFeaturedLists} />;
}
