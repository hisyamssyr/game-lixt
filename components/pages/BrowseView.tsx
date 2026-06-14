'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { GenrePill } from '@/components/GenrePill';
import type { Game } from '@/components/types';
import { ALL_GENRES, toGame } from '@/lib/ui-data';

export function BrowseView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const genre = searchParams.get('genre') ?? '';
  const sort = searchParams.get('sort') ?? 'rating';

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    if (genre) params.set('genre', genre);
    if (sort) params.set('sort', sort);
    params.set('limit', '60');
    return params.toString();
  }, [searchParams, genre, sort]);

  useEffect(() => {
    fetch(`/api/games?${query}`).then((res) => res.json()).then((data) => setGames((data.games ?? []).map(toGame))).catch(() => setGames([]));
  }, [query]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/games?${params.toString()}`);
  }

  return <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', padding: '40px 24px 80px' }}><div style={{ maxWidth: 1200, margin: '0 auto' }}><div style={{ marginBottom: 32 }}><h1 style={{ margin: '0 0 10px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.4rem', color: '#F0F0F5' }}>Browse Games</h1><p style={{ margin: 0, color: '#8888A0' }}>Search, filter, and sort the GameLixt catalog.</p></div><div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}><aside style={{ position: 'sticky', top: 88, background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, color: '#F0F0F5', fontWeight: 700 }}><Filter size={16} /> Filters</div><form onSubmit={(e) => { e.preventDefault(); updateParam('search', search); }} style={{ display: 'flex', gap: 8, marginBottom: 18 }}><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games" style={{ minWidth: 0, flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', padding: '9px 10px', outline: 'none' }} /><button style={smallButton}><Search size={14} /></button></form><label style={labelStyle}>Sort</label><select value={sort} onChange={(e) => updateParam('sort', e.target.value)} style={selectStyle}><option value="rating">Top Rated</option><option value="release_date">Release Date</option><option value="title">Title</option></select><label style={{ ...labelStyle, marginTop: 18 }}>Genres</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{ALL_GENRES.map((g) => <button key={g} onClick={() => updateParam('genre', g === genre ? '' : g)} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', opacity: genre && genre !== g ? 0.55 : 1 }}><GenrePill genre={g} /></button>)}</div></aside><main><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>{games.map((game) => <GameCard key={game.id} game={game} />)}</div>{games.length === 0 && <div style={{ color: '#8888A0', padding: 40, textAlign: 'center', border: '1px solid var(--gl-border)', borderRadius: 12 }}>No games found.</div>}</main></div></div></div>;
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#F0F0F5', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 };
const selectStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', padding: '9px 10px' };
const smallButton: React.CSSProperties = { width: 38, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
