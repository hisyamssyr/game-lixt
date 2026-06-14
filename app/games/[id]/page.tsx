import { GameDetailView } from '@/components/pages/GameDetailView';
import { apiGet, toGame, toReview } from '@/lib/ui-data';

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [gameResponse, reviewResponse] = await Promise.all([
    apiGet<{ success?: boolean; game?: unknown }>(`/api/games/${id}`, {}),
    apiGet<unknown[]>(`/api/reviews?game_id=${id}`, []),
  ]);

  if (!gameResponse.game) {
    return <div style={{ minHeight: '60vh', background: 'var(--gl-bg-base)', color: '#F0F0F5', padding: 48 }}>Game not found.</div>;
  }

  return <GameDetailView game={toGame(gameResponse.game)} reviews={reviewResponse.map((review) => toReview(review, id))} />;
}
