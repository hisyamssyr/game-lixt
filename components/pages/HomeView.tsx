'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, List, Sparkles } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { GenrePill } from '@/components/GenrePill';
import { ListCard } from '@/components/ListCard';
import type { CuratedList, Game, Review } from '@/types/app';
import { ALL_GENRES } from '@/lib/ui-data';

export function HomeView({ games, lists }: { games: Game[]; reviews: Review[]; lists: CuratedList[] }) {
  const listScrollRef = useRef<HTMLDivElement>(null);
  const trendingGames = [...games].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const collageGames = games.slice(0, 5);
  // Duplicate for seamless infinite scroll
  const marqueeGames = [...trendingGames, ...trendingGames];

  return (
    <div style={{ background: 'var(--gl-bg-base)', minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 24px' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.28) 0%, transparent 70%)', top: -200, left: -200 }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', top: 80, right: -100 }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 24, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', marginBottom: 24 }}>
              <Sparkles size={13} color="#6C63FF" />
              <span style={{ color: '#6C63FF', fontSize: '0.78rem', fontWeight: 600 }}>Your personal gaming universe</span>
            </div>
            <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.8rem, 5vw, 4.8rem)', fontWeight: 700, lineHeight: 1.05, color: '#F0F0F5', marginBottom: 24 }}>Your Game.<br />Your List.<br /><span style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 50%, #39FF85 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your World.</span></h1>
            <p style={{ margin: '0 0 36px', color: '#8888A0', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 480 }}>Discover, track, and review games in one place. Build your library, write reviews that matter, and join a community that takes gaming seriously.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/games" style={{ textDecoration: 'none' }}><button style={{ padding: '13px 28px', borderRadius: 8, background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(108,99,255,0.35)' }}>Browse Games <ArrowRight size={16} /></button></Link>
              <Link href="/register" style={{ textDecoration: 'none' }}><button style={{ padding: '13px 28px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#F0F0F5', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}>Sign Up Free</button></Link>
            </div>
          </div>
          <div style={{ position: 'relative', height: 520 }}>
            {collageGames.map((game, i) => {
              const rot = [-8, 5, -3, 11, -6][i] ?? 0;
              return (
                <Link 
                  key={game.id} 
                  href={`/games/${game.id}`} 
                  className="animate-float"
                  style={{ 
                    position: 'absolute', 
                    top: `${(i % 3) * 24 + 4}%`, 
                    left: `${i * 18 % 70}%`, 
                    zIndex: i + 1,
                    animationDelay: `${i * 0.5}s`,
                    '--rotation': `${rot}deg`
                  } as React.CSSProperties}
                >
                  <img src={game.coverImage} alt={game.title} style={{ width: 120 + i * 6, height: 180 + i * 9, objectFit: 'cover', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '2px solid rgba(255,255,255,0.08)' }} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section style={{ padding: '64px 0', maxWidth: 1200, margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, padding: '0 24px' }}>
          <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#F0F0F5' }}>Trending Games</h2>
        </div>
        <div className="animate-marquee-container" style={{ padding: '16px 0' }}>
          <div className="animate-marquee" style={{ gap: 16 }}>
            {marqueeGames.map((game, i) => (
              <div key={`${game.id}-${i}`} style={{ flexShrink: 0, width: 200 }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: '64px 24px', background: 'var(--gl-bg-surface)', borderTop: '1px solid var(--gl-border)', borderBottom: '1px solid var(--gl-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <List size={18} color="#39FF85" />
              <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', color: '#F0F0F5' }}>Top Curated Lists</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => listScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })} style={iconButton}><ChevronLeft size={16} /></button>
              <button onClick={() => listScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })} style={iconButton}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div ref={listScrollRef} style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
            {lists.slice(0, 7).map((list) => (
              <div key={list.id} style={{ flexShrink: 0, width: 320 }}>
                <ListCard list={list} games={games} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}><h2 style={{ margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', color: '#F0F0F5' }}>Popular Genres</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>{ALL_GENRES.map((genre) => <Link key={genre} href={`/games?genre=${encodeURIComponent(genre)}`} style={{ textDecoration: 'none' }}><GenrePill genre={genre} /></Link>)}</div></section>
    </div>
  );
}

const iconButton: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--gl-border)', color: '#8888A0', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
