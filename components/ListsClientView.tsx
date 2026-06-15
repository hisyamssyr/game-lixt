'use client';

import { useState } from 'react';
import Link from 'next/link';
import { List, Trophy, ThumbsUp, Search } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ListCard } from '@/components/ListCard';
import type { CuratedList, Game } from '@/types/app';

interface ListsClientViewProps {
  initialLists: CuratedList[];
  games: Game[];
}

export function ListsClientView({ initialLists, games }: ListsClientViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'top_rated' | 'most_games' | 'az'>('top_rated');

  const filteredLists = initialLists.filter(list => 
    list.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLists = [...filteredLists].sort((a, b) => {
    if (sortBy === 'top_rated') return b.upvotes - a.upvotes;
    if (sortBy === 'most_games') return (b.gameCount || 0) - (a.gameCount || 0);
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return 0;
  });

  const topList = sortedLists.length > 0 && searchQuery === '' && sortBy === 'top_rated' 
    ? sortedLists[0] 
    : null;
    
  const otherLists = topList ? sortedLists.slice(1) : sortedLists;

  return (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
          <Search size={16} color="#8888A0" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--gl-border)',
              borderRadius: 8,
              color: '#F0F0F5',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'top_rated', label: 'Top Rated' },
            { id: 'most_games', label: 'Most Games' },
            { id: 'az', label: 'A-Z' }
          ].map(sort => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as any)}
              style={{
                padding: '10px 16px',
                background: sortBy === sort.id ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${sortBy === sort.id ? 'rgba(108, 99, 255, 0.3)' : 'var(--gl-border)'}`,
                borderRadius: 8,
                color: sortBy === sort.id ? '#6C63FF' : '#8888A0',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {topList && (
        <Link href={`/lists/${topList.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: 40, position: 'relative', transition: 'transform 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 220 }}>
              <div style={{ flex: '1 1 300px', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,19,0.4)', position: 'relative' }}>
                {topList.covers && topList.covers.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {topList.covers.slice(0, 3).map((cover, i) => (
                      <div key={i} style={{ 
                        width: 100, height: 140, borderRadius: 8, overflow: 'hidden', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                        transform: `translateX(${i === 0 ? 20 : i === 2 ? -20 : 0}px) scale(${i === 1 ? 1.1 : 0.95}) rotate(${i === 0 ? -6 : i === 2 ? 6 : 0}deg)`,
                        zIndex: i === 1 ? 3 : 2,
                        position: 'relative'
                      }}>
                        <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ width: 120, height: 160, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <List size={32} color="#8888A0" opacity={0.5} />
                  </div>
                )}
              </div>
              <div style={{ flex: '2 1 400px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 24, background: 'rgba(255, 181, 71, 0.15)', border: '1px solid rgba(255, 181, 71, 0.3)', color: '#FFB547', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', marginBottom: 16 }}>
                  <Trophy size={13} />
                  TOP RATED LIST
                </div>
                <h2 style={{ margin: '0 0 12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#F0F0F5', lineHeight: 1.2 }}>{topList.title}</h2>
                <p style={{ margin: '0 0 24px', color: '#8888A0', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{topList.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ImageWithFallback src={topList.avatar} alt={topList.username} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ color: '#C0C0D0', fontSize: '0.86rem' }}>{topList.username}</span>
                  </div>
                  <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>•</span>
                  <span style={{ color: '#8888A0', fontSize: '0.86rem' }}>{topList.gameCount} games</span>
                  <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#39FF85', fontSize: '0.86rem', fontWeight: 600 }}>
                    <ThumbsUp size={14} />
                    {topList.upvotes.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {otherLists.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {otherLists.map((list) => <ListCard key={list.id} list={list} games={games} />)}
        </div>
      ) : (
        <div style={{ color: '#8888A0', padding: 48, textAlign: 'center', border: '1px solid var(--gl-border)', borderRadius: 12, background: 'var(--gl-bg-surface)' }}>
          {searchQuery ? `No lists found matching "${searchQuery}".` : 'No lists found.'}
        </div>
      )}
    </>
  );
}
