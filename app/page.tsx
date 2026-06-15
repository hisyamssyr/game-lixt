import { HomeView } from '@/components/pages/HomeView';
import { apiGet, toGame, toList } from '@/lib/ui-data';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  const [gamesResponse, listsResponse] = await Promise.all([
    apiGet<{ games: unknown[] }>('/api/games?limit=20', { games: [] }, cookieString),
    apiGet<unknown[]>('/api/lists', [], cookieString),
  ]);

  const games = gamesResponse.games.map(toGame);
  const lists = listsResponse.map(toList);

  return <HomeView games={games} reviews={[]} lists={lists} />;
}
