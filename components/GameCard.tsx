'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { RatingBadge } from '@/components/RatingBadge';
import { GenrePill } from '@/components/GenrePill';
import type { Game, GameStatus } from '@/components/types';

interface GameCardProps {
  game: Game;
  libraryStatus?: GameStatus | null;
  onAddToLibrary?: (gameId: string, status: GameStatus) => void;
  variant?: 'default' | 'compact';
}

const STATUS_OPTIONS: { label: string; value: GameStatus }[] = [
  { label: 'Playing', value: 'playing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Plan to Play', value: 'plan_to_play' },
  { label: 'Dropped', value: 'dropped' },
];

export function GameCard({ game, libraryStatus, onAddToLibrary, variant = 'default' }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--gl-bg-surface)',
        border: '1px solid var(--gl-border)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowDropdown(false); }}
    >
      <Link href={`/games/${game.id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
          <ImageWithFallback
            src={game.coverImage}
            alt={game.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(15,15,19,0.95) 0%, transparent 100%)',
          }} />
          {/* Rating badge */}
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <RatingBadge rating={game.rating} size="sm" />
          </div>
          {/* Library status indicator */}
          {libraryStatus && (
            <div style={{
              position: 'absolute',
              top: 10,
              left: 10,
              padding: '3px 8px',
              borderRadius: 24,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <BookOpen size={12} color="#39FF85" />
            </div>
          )}
          {/* Hover overlay with Add to Library */}
          {hovered && !libraryStatus && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
              }}
              onClick={(e) => e.preventDefault()}
            >
              <button
                onClick={(e) => { e.preventDefault(); setShowDropdown(!showDropdown); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} />
                Add to Library
              </button>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 6,
                  background: 'var(--gl-bg-elevated)',
                  border: '1px solid var(--gl-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={(e) => { e.preventDefault(); onAddToLibrary?.(game.id, opt.value); setShowDropdown(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '9px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#F0F0F5',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(108,99,255,0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {hovered && libraryStatus && (
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}
              onClick={(e) => e.preventDefault()}>
              <button
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(57, 255, 133, 0.1)',
                  color: '#39FF85',
                  border: '1px solid rgba(57,255,133,0.3)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Check size={14} />
                In Library
              </button>
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding: '12px 14px 14px' }}>
        <Link href={`/games/${game.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            margin: 0,
            color: '#F0F0F5',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {game.title}
          </h3>
        </Link>
        <p style={{ margin: '0 0 10px', color: '#8888A0', fontSize: '0.76rem' }}>
          {game.developer}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {game.genres.slice(0, 2).map((g) => (
            <GenrePill key={g} genre={g} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
}


