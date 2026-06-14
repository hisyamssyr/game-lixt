'use client';

import { useState } from 'react';
import { BookOpen, MessageCircle, Plus } from 'lucide-react';
import { GenrePill } from '@/components/GenrePill';
import { RatingBadge } from '@/components/RatingBadge';
import { ReviewCard } from '@/components/ReviewCard';
import type { Game, GameStatus, Review } from '@/components/types';

const statuses: { label: string; value: GameStatus; api: string }[] = [
  { label: 'Playing', value: 'playing', api: 'Playing' },
  { label: 'Completed', value: 'completed', api: 'Completed' },
  { label: 'Plan to Play', value: 'plan_to_play', api: 'Plan to Play' },
  { label: 'Dropped', value: 'dropped', api: 'Dropped' },
];

export function GameDetailView({ game, reviews }: { game: Game; reviews: Review[] }) {
  const [tab, setTab] = useState<'overview' | 'reviews' | 'discussion'>('overview');
  const [busy, setBusy] = useState(false);

  async function addToLibrary(play_status: string) {
    setBusy(true);
    await fetch('/api/library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game_id: game.id, play_status }) });
    setBusy(false);
  }

  return <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', color: '#F0F0F5' }}><section style={{ position: 'relative', padding: '56px 24px', overflow: 'hidden' }}><div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, var(--gl-bg-base) 0%, rgba(15,15,19,0.82) 55%, var(--gl-bg-base) 100%), url(${game.coverImage}) center/cover`, opacity: 0.42 }} /><div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 36 }}><img src={game.coverImage} alt={game.title} style={{ width: '100%', borderRadius: 14, boxShadow: '0 24px 80px rgba(0,0,0,0.65)' }} /><div><RatingBadge rating={game.rating} /><h1 style={{ margin: '16px 0 8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05 }}>{game.title}</h1><p style={{ margin: '0 0 18px', color: '#8888A0' }}>{game.developer} {game.releaseDate ? `- ${new Date(game.releaseDate).getFullYear()}` : ''}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>{game.genres.map((genre) => <GenrePill key={genre} genre={genre} />)}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{statuses.map((status) => <button key={status.value} disabled={busy} onClick={() => addToLibrary(status.api)} style={{ padding: '10px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700 }}><Plus size={15} /> {status.label}</button>)}</div></div></div></section><section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}><div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--gl-border)', marginBottom: 24 }}>{(['overview', 'reviews', 'discussion'] as const).map((key) => <button key={key} onClick={() => setTab(key)} style={{ padding: '14px 18px', background: 'transparent', border: 0, borderBottom: tab === key ? '2px solid #6C63FF' : '2px solid transparent', color: tab === key ? '#F0F0F5' : '#8888A0', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 700 }}>{key}</button>)}</div>{tab === 'overview' && <div style={panelStyle}><BookOpen size={18} color="#6C63FF" /><p style={{ margin: '12px 0 0', color: '#C0C0D0', lineHeight: 1.8 }}>{game.description || 'No description available yet.'}</p></div>}{tab === 'reviews' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}{reviews.length === 0 && <p style={{ color: '#8888A0' }}>No reviews yet.</p>}</div>}{tab === 'discussion' && <div style={panelStyle}><MessageCircle size={18} color="#39FF85" /><p style={{ margin: '12px 0 0', color: '#8888A0' }}>Discussion threads will appear here when available.</p></div>}</section></div>;
}

const panelStyle: React.CSSProperties = { background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: 22 };
