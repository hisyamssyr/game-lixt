import Link from 'next/link';
import { List, ThumbsUp } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { getServerSession } from '@/lib/auth';
import { EditListModal } from '@/components/modals/EditListModal';
import { UpvoteListButton } from '@/components/UpvoteListButton';

import { db } from '@/lib/db';
import { list as listTable, users, list_items, games } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

interface ListDetail {
  list_id: string;
  title: string;
  description: string | null;
  list_cover_url: string | null;
  created_at: string;
  owner: {
    user_id: string;
    username: string;
    avatar_url: string | null;
  };
  vote_score: number;
  has_upvoted: boolean;
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
  const session = await getServerSession();
  const userId = session?.user?.user_id || '00000000-0000-0000-0000-000000000000';

  const listDetails = await db
    .select({
      list_id: listTable.list_id,
      title: listTable.title,
      description: listTable.description,
      list_cover_url: listTable.list_cover_url,
      created_at: listTable.created_at,
      owner: {
        user_id: users.user_id,
        username: users.username,
        avatar_url: users.avatar_url,
      },
      vote_score: sql<number>`count_list_vote(${listTable.list_id})`.as('vote_score'),
      has_upvoted: sql<boolean>`EXISTS(SELECT 1 FROM list_votes WHERE list_id = ${listTable.list_id} AND user_id = ${userId}::uuid AND vote_type = true)`.as('has_upvoted'),
    })
    .from(listTable)
    .innerJoin(users, eq(listTable.user_id, users.user_id))
    .where(eq(listTable.list_id, id))
    .limit(1);

  if (listDetails.length === 0) {
    return <div style={{ minHeight: '70vh', background: 'var(--gl-bg-base)', color: '#F0F0F5', padding: 48 }}>List not found.</div>;
  }

  const items = await db
    .select({
      item_id: list_items.item_id,
      game_id: list_items.game_id,
      title: games.title,
      cover_url: games.cover_url,
      added_at: list_items.added_at,
    })
    .from(list_items)
    .innerJoin(games, eq(list_items.game_id, games.game_id))
    .where(eq(list_items.list_id, id));

  const list: ListDetail = {
    ...listDetails[0],
    created_at: listDetails[0].created_at as unknown as string,
    items: items.map(item => ({
      ...item,
      added_at: item.added_at as unknown as string,
    })),
  };

  const cover = list.list_cover_url ?? list.items[0]?.cover_url ?? 'https://picsum.photos/seed/game-lixt-list/1200/420';
  const ownerAvatar = list.owner.avatar_url ?? 'https://www.nicepng.com/png/detail/115-1150821_default-avatar-comments-sign-in-icon-png.png';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: '#F0F0F5', lineHeight: 1.1 }}>{list.title}</h1>
            {session?.user?.user_id === list.owner.user_id && (
              <EditListModal listId={list.list_id} initialTitle={list.title} initialDescription={list.description || ''} items={list.items} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href={`/profile/${list.owner.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImageWithFallback src={ownerAvatar} alt={list.owner.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.18)' }} />
              <span style={{ color: '#C0C0D0', fontSize: '0.86rem' }}>{list.owner.username}</span>
            </Link>
            <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>{list.items.length} games</span>
            <UpvoteListButton listId={list.list_id} initialScore={list.vote_score || 0} initialUpvoted={list.has_upvoted} />
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
