import { HomeView } from '@/components/pages/HomeView';
import { apiGet, toGame, toList } from '@/lib/ui-data';

export default async function HomePage() {
  const [gamesResponse, listsResponse] = await Promise.all([
    apiGet<{ games: unknown[] }>('/api/games?limit=20', { games: [] }),
    apiGet<unknown[]>('/api/lists', []),
  ]);

  const games = gamesResponse.games.map(toGame);
  const lists = listsResponse.map(toList);

  return <HomeView games={games} reviews={[]} lists={lists} />;
}
