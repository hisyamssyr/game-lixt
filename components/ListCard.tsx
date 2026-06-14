'use client';

import Link from 'next/link';
import { ThumbsUp, List } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { CuratedList, Game } from '@/components/types';

interface ListCardProps {
  list: CuratedList;
  games: Game[];
}

export function ListCard({ list, games }: ListCardProps) {
  const listGames = list.gameIds.slice(0, 4).map((id) => games.find((g) => g.id === id)).filter(Boolean) as Game[];

  return (
    <Link href={`/lists/${list.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--gl-bg-surface)',
        border: '1px solid var(--gl-border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gl-border)';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
      >
        {/* Cover mosaic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 140, overflow: 'hidden' }}>
          {listGames.length >= 4 ? (
            listGames.map((game) => (
              <ImageWithFallback
                key={game.id}
                src={game.coverImage}
                alt={game.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ))
          ) : listGames.length > 0 ? (
            <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
              <ImageWithFallback
                src={listGames[0].coverImage}
                alt={listGames[0].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--gl-bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <List size={32} color="#8888A0" />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{
            margin: '0 0 6px',
            color: '#F0F0F5',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {list.title}
          </h3>
          <p style={{
            margin: '0 0 12px',
            color: '#8888A0',
            fontSize: '0.76rem',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {list.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ImageWithFallback
                src={list.avatar}
                alt={list.username}
                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ color: '#8888A0', fontSize: '0.73rem' }}>by {list.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#39FF85', fontSize: '0.76rem', fontWeight: 600 }}>
              <ThumbsUp size={12} />
              {list.upvotes.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


