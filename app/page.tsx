import { HomeView } from '@/components/pages/HomeView';
import { toGame, toList } from '@/lib/ui-data';

export default async function HomePage() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const [gamesRes, listsRes] = await Promise.all([
    fetch(`${baseUrl}/api/games?limit=20`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ games: [] })),
    fetch(`${baseUrl}/api/lists`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => []),
  ]);

  const games = (gamesRes.games ?? []).map(toGame);
  const lists = (Array.isArray(listsRes) ? listsRes : []).map(toList);

  return <HomeView games={games} reviews={[]} lists={lists} />;
}
