'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { GenrePill } from '@/components/GenrePill';
import type { Game } from '@/types/app';
import { ALL_GENRES, toGame } from '@/lib/ui-data';

export function BrowseView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const selectedGenres = searchParams.getAll('genre');
  const sort = searchParams.get('sort') ?? 'rating';

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    selectedGenres.forEach(g => params.append('genre', g));
    if (sort) params.set('sort', sort);
    params.set('limit', '60');
    return params.toString();
  }, [searchParams, selectedGenres, sort]);

  useEffect(() => {
    fetch(`/api/games?${query}`).then((res) => res.json()).then((data) => setGames((data.games ?? []).map(toGame))).catch(() => setGames([]));
  }, [query]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/games?${params.toString()}`);
  }

  function toggleGenre(g: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('genre');
    params.delete('genre');
    if (current.includes(g)) {
      current.filter(x => x !== g).forEach(x => params.append('genre', x));
    } else {
      current.forEach(x => params.append('genre', x));
      params.append('genre', g);
    }
    router.push(`/games?${params.toString()}`);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.4rem', color: '#F0F0F5' }}>Browse Games</h1>
          <p style={{ margin: 0, color: '#8888A0' }}>Search, filter, and sort the GameLixt catalog.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
          <aside style={{ position: 'sticky', top: 88, background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#F0F0F5', fontWeight: 700, fontSize: '1.1rem' }}>
              <Filter size={18} /> Filters
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); updateParam('search', search); }} style={{ display: 'flex', marginBottom: 24 }}>
              <input 
                suppressHydrationWarning
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search games..." 
                style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gl-border)', borderRadius: '8px 0 0 8px', color: '#F0F0F5', padding: '10px 14px', outline: 'none', fontSize: '0.9rem' }} 
              />
              <button suppressHydrationWarning type="submit" style={{ width: 44, border: 'none', background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '0 8px 8px 0' }}>
                <Search size={16} />
              </button>
            </form>

            <label style={labelStyle}>Sort By</label>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <select suppressHydrationWarning value={sort} onChange={(e) => updateParam('sort', e.target.value)} style={{ ...selectStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="rating" style={{ color: '#0F0F13' }}>Top Rated</option>
                <option value="release_date" style={{ color: '#0F0F13' }}>Release Date</option>
                <option value="title" style={{ color: '#0F0F13' }}>Title</option>
              </select>
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8888A0', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <label style={labelStyle}>Genres</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ALL_GENRES.map((g) => (
                <GenrePill 
                  key={g} 
                  genre={g} 
                  selected={selectedGenres.includes(g)} 
                  onClick={() => toggleGenre(g)} 
                />
              ))}
            </div>
          </aside>
          
          <main>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {games.map((game) => <GameCard key={game.id} game={game} />)}
            </div>
            {games.length === 0 && (
              <div style={{ color: '#8888A0', padding: 60, textAlign: 'center', border: '1px solid var(--gl-border)', borderRadius: 16, background: 'var(--gl-bg-surface)' }}>
                <Filter size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <h3 style={{ color: '#F0F0F5', margin: '0 0 8px' }}>No games found</h3>
                <p style={{ margin: 0 }}>Try adjusting your search or filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#F0F0F5', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 };
const selectStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' };
