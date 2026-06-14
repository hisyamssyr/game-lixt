import Link from 'next/link';
import { List, ThumbsUp } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { apiGet } from '@/lib/ui-data';

interface ListDetail {
  list_id: string;
  title: string;
  description: string | null;
  list_cover_url: string | null;
  owner: {
    username: string;
    avatar_url: string | null;
  };
  vote_score: number;
  items: {
    item_id: string;
    game_id: string;
    title: string;
    cover_url: string | null;
    added_at: string;
  }[];
}

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await apiGet<ListDetail | null>(`/api/lists/${id}`, null);

  if (!list) {
    return <div style={{ minHeight: '70vh', background: 'var(--gl-bg-base)', color: '#F0F0F5', padding: 48 }}>List not found.</div>;
  }

  const cover = list.list_cover_url ?? list.items[0]?.cover_url ?? 'https://picsum.photos/seed/game-lixt-list/1200/420';
  const ownerAvatar = list.owner.avatar_url ?? 'https://picsum.photos/seed/game-lixt-owner/80/80';

  return (
    <div style={{ background: 'var(--gl-bg-base)', minHeight: '100vh', paddingBottom: 80 }}>
      <section style={{ position: 'relative', minHeight: 320, overflow: 'hidden' }}>
        <ImageWithFallback src={cover} alt={list.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,15,19,0.25), rgba(15,15,19,0.95))' }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', minHeight: 320, padding: '0 24px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 24, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.28)', color: '#6C63FF', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', marginBottom: 12 }}>
            <List size={13} />
            CURATED LIST
          </div>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: '#F0F0F5', lineHeight: 1.1 }}>{list.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href={`/profile/${list.owner.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImageWithFallback src={ownerAvatar} alt={list.owner.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.18)' }} />
              <span style={{ color: '#C0C0D0', fontSize: '0.86rem' }}>{list.owner.username}</span>
            </Link>
            <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>{list.items.length} games</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#39FF85', fontSize: '0.84rem', fontWeight: 700 }}><ThumbsUp size={14} />{Number(list.vote_score ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </section>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
          <p style={{ margin: 0, color: '#C0C0D0', fontSize: '0.92rem', lineHeight: 1.7 }}>{list.description || 'No description provided.'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.items.map((item, index) => (
            <div key={item.item_id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 16px', background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: index < 3 ? '#6C63FF' : '#8888A0', minWidth: 28, textAlign: 'center' }}>{index + 1}</span>
              <Link href={`/games/${item.game_id}`} style={{ flexShrink: 0 }}>
                <ImageWithFallback src={item.cover_url ?? 'https://picsum.photos/seed/game-lixt-item/120/180'} alt={item.title} style={{ width: 52, height: 76, objectFit: 'cover', borderRadius: 8 }} />
              </Link>
              <div style={{ minWidth: 0 }}>
                <Link href={`/games/${item.game_id}`} style={{ color: '#F0F0F5', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.98rem' }}>{item.title}</Link>
                <p style={{ margin: '6px 0 0', color: '#8888A0', fontSize: '0.76rem' }}>Added {new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
          {list.items.length === 0 && <div style={{ color: '#8888A0', padding: 40, textAlign: 'center', border: '1px solid var(--gl-border)', borderRadius: 12, background: 'var(--gl-bg-surface)' }}>No games in this list yet.</div>}
        </div>
      </main>
    </div>
  );
}
