'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [votes, setVotes] = useState({ up: review.upvotes, down: review.downvotes, userVote: review.userVote ?? null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthor = session?.user?.user_id === review.userId;

  const vote = async (type: 'up' | 'down') => {
    if (!session?.user) {
      toast.error('You must be logged in to vote');
      return;
    }

    const previousVotes = { ...votes };
    
    // Optimistic update
    setVotes((prev) => {
      if (prev.userVote === type) return { ...prev, userVote: null, up: type === 'up' ? prev.up - 1 : prev.up, down: type === 'down' ? prev.down - 1 : prev.down };
      const up = type === 'up' ? prev.up + 1 : (prev.userVote === 'up' ? prev.up - 1 : prev.up);
      const down = type === 'down' ? prev.down + 1 : (prev.userVote === 'down' ? prev.down - 1 : prev.down);
      return { up, down, userVote: type };
    });

    try {
      const res = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: type })
      });
      if (!res.ok) {
        throw new Error('Failed to vote');
      }
      router.refresh();
    } catch (e) {
      toast.error('Failed to register vote');
      setVotes(previousVotes);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmDelete(false);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted successfully');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete review');
        setIsDeleting(false);
      }
    } catch (e) {
      toast.error('An error occurred while deleting');
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  return (
    <div style={{
      position: 'relative',
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
        
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid var(--gl-border)',
              color: '#EF4444',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.76rem',
              fontWeight: 500,
              opacity: isDeleting ? 0.5 : 0.8,
              transition: 'all 0.15s',
              marginLeft: 'auto',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--gl-border)'; }}
            title="Delete review"
          >
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>

      {showConfirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 15, 19, 0.8)', backdropFilter: 'blur(4px)',
          padding: 24
        }}>
          <div style={{
            background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)',
            borderRadius: 16, width: '100%', maxWidth: 400,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden', animation: 'glFadeIn 0.2s ease-out', padding: 24
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Delete Review</h3>
            <p style={{ margin: '0 0 24px', color: '#8888A0', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{ padding: '8px 16px', background: '#EF4444', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


