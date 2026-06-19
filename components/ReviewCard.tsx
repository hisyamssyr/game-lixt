'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ThumbsUp, ThumbsDown, Trash2, MoreHorizontal, Edit3, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { RatingBadge } from '@/components/RatingBadge';
import { StarRating } from '@/components/StarRating';
import type { Review } from '@/types/app';

interface ReviewCardProps {
  review: Review;
  gameTitles?: Record<string, string>;
  showGame?: boolean;
}

export function ReviewCard({ review, gameTitles, showGame = false }: ReviewCardProps) {
  const [votes, setVotes] = useState({ up: review.upvotes, down: review.downvotes, userVote: review.userVote ?? null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Edit & Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(review.text);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { data: session } = useSession();

  const isAuthor = session?.user?.user_id === review.userId;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedText.trim() || editedRating === 0) {
      toast.error('Review text and rating cannot be empty');
      return;
    }

    setIsSubmittingEdit(true);
    const finalRating = editedRating === 10 ? 9.99 : editedRating;
    
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: finalRating, review_text: editedText }),
      });
      
      if (res.ok) {
        toast.success('Review updated successfully');
        setIsEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update review');
      }
    } catch (e) {
      toast.error('An error occurred while updating the review');
    } finally {
      setIsSubmittingEdit(false);
    }
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
              {!isEditing && <StarRating rating={review.rating} size={12} />}
              <span style={{ color: '#8888A0', fontSize: '0.72rem' }}>
                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isEditing && <RatingBadge rating={review.rating} size="sm" />}
          
          {isAuthor && !isEditing && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  background: isDropdownOpen ? 'rgba(255,255,255,0.1)' : 'transparent', 
                  border: 'none', 
                  color: isDropdownOpen ? '#F0F0F5' : '#606075', 
                  cursor: 'pointer', 
                  padding: 4, 
                  borderRadius: 6,
                  display: 'flex', 
                  alignItems: 'center',
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C0C0D0'; }}
                onMouseLeave={e => { if (!isDropdownOpen) e.currentTarget.style.color = '#606075'; }}
              >
                <MoreHorizontal size={18} />
              </button>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: '#1A1A24', border: '1px solid var(--gl-border)',
                  borderRadius: 8, padding: 6, minWidth: 120, zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'glFadeIn 0.15s ease-out'
                }}>
                  <button
                    onClick={() => { setIsEditing(true); setIsDropdownOpen(false); }}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'transparent',
                      border: 'none', borderRadius: 6, color: '#C0C0D0',
                      textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { setShowConfirmDelete(true); setIsDropdownOpen(false); }}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'transparent',
                      border: 'none', borderRadius: 6, color: '#EF4444',
                      textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showGame && gameTitles?.[review.gameId] && !isEditing && (
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

      {/* Review content OR Edit Form */}
      {isEditing ? (
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.8rem', color: '#8888A0', fontWeight: 600 }}>Rating: {editedRating.toFixed(1)}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="range" min="0" max="10" step="0.1"
                value={editedRating}
                onChange={(e) => setEditedRating(parseFloat(e.target.value))}
                style={{ width: '100%', maxWidth: 200, accentColor: '#FFB547' }}
              />
              <StarRating rating={editedRating} size={14} />
            </div>
          </div>
          
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={4}
            required
            autoFocus
            style={{
              width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--gl-border)', borderRadius: 8,
              color: '#F0F0F5', fontSize: '0.85rem', resize: 'vertical',
              outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
              lineHeight: 1.6
            }}
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = 'var(--gl-border)'}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditedText(review.text);
                setEditedRating(review.rating);
              }}
              style={{
                padding: '6px 12px', background: 'transparent', border: '1px solid var(--gl-border)',
                borderRadius: 6, color: '#C0C0D0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit || !editedText.trim() || editedRating === 0}
              style={{
                padding: '6px 16px', background: '#6C63FF', border: 'none',
                borderRadius: 6, color: '#fff', cursor: isSubmittingEdit ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                opacity: (isSubmittingEdit || !editedText.trim() || editedRating === 0) ? 0.6 : 1
              }}
            >
              {isSubmittingEdit ? <><Loader2 size={12} style={{ animation: 'glSpin 1s linear infinite' }} /> Saving</> : <><Check size={12} /> Save</>}
            </button>
          </div>
        </form>
      ) : (
        <p style={{
          margin: 0,
          color: '#C0C0D0',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          whiteSpace: 'pre-wrap'
        }}>
          {review.text}
        </p>
      )}

      {/* Footer (Votes) */}
      {!isEditing && (
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
      )}

      {/* Delete Confirmation Modal */}
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
                style={{ padding: '8px 16px', background: '#EF4444', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {isDeleting ? <Loader2 size={14} style={{ animation: 'glSpin 1s linear infinite' }} /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
