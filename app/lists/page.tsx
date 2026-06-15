import { List } from 'lucide-react';
import { CreateListModal } from '@/components/modals/CreateListModal';
import { apiGet, toGame, toList } from '@/lib/ui-data';
import { cookies } from 'next/headers';
import { ListsClientView } from '@/components/ListsClientView';

export default async function ListsPage() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  const [listsResponse, gamesResponse] = await Promise.all([
    apiGet<unknown[]>('/api/lists', [], cookieString),
    apiGet<{ games: unknown[] }>('/api/games?limit=80', { games: [] }, cookieString),
  ]);
  const lists = listsResponse.map(toList);
  const games = gamesResponse.games.map(toGame);

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
        <ListsClientView initialLists={lists} games={games} />
      </main>
    </div>
  );
}
