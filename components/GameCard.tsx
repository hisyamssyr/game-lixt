'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, BookOpen, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { RatingBadge } from '@/components/RatingBadge';
import { GenrePill } from '@/components/GenrePill';
import type { Game, GameStatus } from '@/types/app';
import { useLibrary } from '@/components/Providers';

interface GameCardProps {
  game: Game;
  libraryStatus?: GameStatus | null;
  onAddToLibrary?: (gameId: string, status: GameStatus) => void;
  variant?: 'default' | 'compact';
}

const STATUS_OPTIONS: { label: string; value: GameStatus; color: string }[] = [
  { label: 'Playing', value: 'playing', color: '#3B82F6' },
  { label: 'Completed', value: 'completed', color: '#39FF85' },
  { label: 'Plan to Play', value: 'plan_to_play', color: '#FFB547' },
  { label: 'Dropped', value: 'dropped', color: '#EF4444' },
];

export function GameCard({ game, libraryStatus: propLibraryStatus, onAddToLibrary: propOnAddToLibrary, variant = 'default' }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { library, addToLibrary } = useLibrary();

  const libraryStatus = propLibraryStatus !== undefined ? propLibraryStatus : library[game.id];
  const onAddToLibrary = propOnAddToLibrary || addToLibrary;

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--gl-bg-surface)',
        border: '1px solid var(--gl-border)',
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-8px) scale(1.08)' : 'none',
        boxShadow: hovered ? '0 24px 48px rgba(0,0,0,0.6)' : 'none',
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
              padding: '4px 10px',
              borderRadius: 24,
              background: 'rgba(15,15,19,0.85)',
              backdropFilter: 'blur(4px)',
              border: `1px solid ${STATUS_OPTIONS.find(s => s.value === libraryStatus)?.color}40`,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_OPTIONS.find(s => s.value === libraryStatus)?.color, boxShadow: `0 0 6px ${STATUS_OPTIONS.find(s => s.value === libraryStatus)?.color}80` }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: STATUS_OPTIONS.find(s => s.value === libraryStatus)?.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {STATUS_OPTIONS.find(s => s.value === libraryStatus)?.label}
              </span>
            </div>
          )}
          {/* Hover overlay with Add to Library */}
          {hovered && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
              }}
              onClick={(e) => e.preventDefault()}
            >
              {(() => {
                const activeStatus = STATUS_OPTIONS.find(s => s.value === libraryStatus);
                return (
                  <button
                    onClick={(e) => { e.preventDefault(); setShowDropdown(!showDropdown); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: activeStatus ? 'rgba(57, 255, 133, 0.15)' : 'linear-gradient(135deg, #6C63FF, #3B82F6)',
                      color: activeStatus ? '#39FF85' : '#fff',
                      border: activeStatus ? '1px solid rgba(57, 255, 133, 0.4)' : 'none',
                      backdropFilter: activeStatus ? 'blur(8px)' : 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {activeStatus ? (
                        <>
                          <Check size={14} />
                          In Library
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Add to Library
                        </>
                      )}
                    </div>
                    {activeStatus && <ChevronDown size={14} />}
                  </button>
                );
              })()}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 6,
                  background: '#1A1A24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={(e) => { e.preventDefault(); onAddToLibrary?.(game.id, opt.value); setShowDropdown(false); }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        padding: '8px 10px',
                        background: libraryStatus === opt.value ? `${opt.color}15` : 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        color: libraryStatus === opt.value ? opt.color : '#F0F0F5',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { if (libraryStatus !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={(e) => { if (libraryStatus !== opt.value) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color, opacity: libraryStatus === opt.value ? 1 : 0.5 }} />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {libraryStatus === opt.value && <Check size={14} color={opt.color} />}
                    </button>
                  ))}
                </div>
              )}
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


