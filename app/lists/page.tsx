import { List } from 'lucide-react';
import { ListCard } from '@/components/ListCard';
import { apiGet, toGame, toList } from '@/lib/ui-data';

export default async function ListsPage() {
  const [listsResponse, gamesResponse] = await Promise.all([
    apiGet<unknown[]>('/api/lists', []),
    apiGet<{ games: unknown[] }>('/api/games?limit=80', { games: [] }),
  ]);
  const lists = listsResponse.map(toList);
  const games = gamesResponse.games.map(toGame);

  return (
    <div style={{ background: 'var(--gl-bg-base)', minHeight: '100vh', paddingBottom: 80 }}>
      <section style={{ background: 'var(--gl-bg-surface)', borderBottom: '1px solid var(--gl-border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 24, background: 'rgba(57,255,133,0.1)', border: '1px solid rgba(57,255,133,0.2)', marginBottom: 12 }}>
            <List size={13} color="#39FF85" />
            <span style={{ color: '#39FF85', fontSize: '0.75rem', fontWeight: 600 }}>Community Curated</span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>Curated Lists</h1>
          <p style={{ margin: 0, color: '#8888A0', fontSize: '0.88rem' }}>{lists.length} lists hand-picked by the community</p>
        </div>
      </section>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {lists.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {lists.map((list) => <ListCard key={list.id} list={list} games={games} />)}
          </div>
        ) : (
          <div style={{ color: '#8888A0', padding: 48, textAlign: 'center', border: '1px solid var(--gl-border)', borderRadius: 12, background: 'var(--gl-bg-surface)' }}>No lists found.</div>
        )}
      </main>
    </div>
  );
}
