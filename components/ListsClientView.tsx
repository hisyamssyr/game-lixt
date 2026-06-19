'use client';

import { useState } from 'react';
import Link from 'next/link';
import { List, Trophy, ThumbsUp, Search } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ListCard } from '@/components/ListCard';
import { TopListCard } from '@/components/TopListCard';
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
        <TopListCard list={topList} />
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
