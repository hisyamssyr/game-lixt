'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { RatingBadge } from '@/components/RatingBadge';
import { StarRating } from '@/components/StarRating';
import type { Review } from '@/components/types';

interface ReviewCardProps {
  review: Review;
  gameTitles?: Record<string, string>;
  showGame?: boolean;
}

export function ReviewCard({ review, gameTitles, showGame = false }: ReviewCardProps) {
  const [votes, setVotes] = useState({ up: review.upvotes, down: review.downvotes, userVote: null as 'up' | 'down' | null });

  const vote = (type: 'up' | 'down') => {
    setVotes((prev) => {
      if (prev.userVote === type) return { ...prev, userVote: null, up: type === 'up' ? prev.up - 1 : prev.up, down: type === 'down' ? prev.down - 1 : prev.down };
      const up = type === 'up' ? prev.up + 1 : (prev.userVote === 'up' ? prev.up - 1 : prev.up);
      const down = type === 'down' ? prev.down + 1 : (prev.userVote === 'down' ? prev.down - 1 : prev.down);
      return { up, down, userVote: type };
    });
  };

  return (
    <div style={{
      background: 'var(--gl-bg-surface)',
      border: '1px solid var(--gl-border)',
      borderRadius: 12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={`/profile/${review.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <ImageWithFallback
              src={review.avatar}
              alt={review.username}
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gl-border)' }}
            />
          </Link>
          <div>
            <Link href={`/profile/${review.username}`} style={{ textDecoration: 'none' }}>
              <span style={{ color: '#F0F0F5', fontSize: '0.85rem', fontWeight: 600 }}>{review.username}</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <StarRating rating={review.rating} size={12} />
              <span style={{ color: '#8888A0', fontSize: '0.72rem' }}>
                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <RatingBadge rating={review.rating} size="sm" />
      </div>

      {showGame && gameTitles?.[review.gameId] && (
        <Link href={`/games/${review.gameId}`} style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '6px 12px',
            background: 'rgba(108,99,255,0.1)',
            borderRadius: 6,
            border: '1px solid rgba(108,99,255,0.2)',
            color: '#6C63FF',
            fontSize: '0.76rem',
            fontWeight: 500,
            display: 'inline-block',
          }}>
            {gameTitles[review.gameId]}
          </div>
        </Link>
      )}

      {/* Review text */}
      <p style={{
        margin: 0,
        color: '#C0C0D0',
        fontSize: '0.85rem',
        lineHeight: 1.7,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
      }}>
        {review.text}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => vote('up')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 6,
            background: votes.userVote === 'up' ? 'rgba(57,255,133,0.12)' : 'transparent',
            border: `1px solid ${votes.userVote === 'up' ? 'rgba(57,255,133,0.3)' : 'var(--gl-border)'}`,
            color: votes.userVote === 'up' ? '#39FF85' : '#8888A0',
            cursor: 'pointer',
            fontSize: '0.76rem',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
        >
          <ThumbsUp size={12} />
          {votes.up}
        </button>
        <button
          onClick={() => vote('down')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 6,
            background: votes.userVote === 'down' ? 'rgba(255,77,106,0.12)' : 'transparent',
            border: `1px solid ${votes.userVote === 'down' ? 'rgba(255,77,106,0.3)' : 'var(--gl-border)'}`,
            color: votes.userVote === 'down' ? '#FF4D6A' : '#8888A0',
            cursor: 'pointer',
            fontSize: '0.76rem',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
        >
          <ThumbsDown size={12} />
          {votes.down}
        </button>
      </div>
    </div>
  );
}


