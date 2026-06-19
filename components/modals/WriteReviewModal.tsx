'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StarRating } from '@/components/StarRating';

export function WriteReviewModal({ gameId, gameTitle, isInLibrary, onReviewAdded }: { gameId: string, gameTitle: string, isInLibrary: boolean, onReviewAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) {
      toast.error('Please provide both a rating and a review text');
      return;
    }

    const finalRating = rating === 10 ? 9.99 : rating;

    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, rating: finalRating, review_text: reviewText }),
      });

      if (res.ok) {
        toast.success('Review published successfully!');
        setIsOpen(false);
        setRating(0);
        setReviewText('');
        router.refresh();
        onReviewAdded?.();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to post review');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while posting your review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ width: '100%' }}>
        <button 
          onClick={() => setIsOpen(true)}
          disabled={!isInLibrary}
          style={{ 
            width: '100%', padding: '14px 16px', borderRadius: 10, 
            background: isInLibrary ? 'linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(59, 130, 246, 0.1))' : 'rgba(255,255,255,0.02)', 
            border: isInLibrary ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
            color: isInLibrary ? '#F0F0F5' : '#8888A0', 
            cursor: isInLibrary ? 'pointer' : 'not-allowed', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
            fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
            opacity: isInLibrary ? 1 : 0.6
          }}
        >
          <Edit3 size={18} color={isInLibrary ? "#6C63FF" : "#8888A0"} />
          Write a Review
        </button>
        {!isInLibrary && (
          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#8888A0', textAlign: 'center' }}>
            Add this game to your library first to write a review.
          </p>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 15, 19, 0.8)', backdropFilter: 'blur(4px)',
          padding: 24
        }}>
          <div style={{
            background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)',
            borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden', animation: 'glFadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gl-border)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Write a Review</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#8888A0' }}>for {gameTitle}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#F0F0F5', marginBottom: 12 }}>Your Rating: {rating > 0 ? rating.toFixed(1) : '0.0'} / 10</label>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    style={{
                      width: '100%', maxWidth: '300px', cursor: 'pointer',
                      accentColor: '#FFB547'
                    }}
                  />
                  <div style={{ transform: 'scale(1.5)', marginTop: 8 }}>
                    <StarRating rating={rating} maxRating={10} size={18} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#8888A0', marginBottom: 8 }}>Your Review</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think about the game? Write your thoughts here..."
                  rows={5}
                  required
                  style={{
                    width: '100%', padding: '14px 16px', background: 'var(--gl-bg-base)',
                    border: '1px solid var(--gl-border)', borderRadius: 10,
                    color: '#F0F0F5', fontSize: '0.95rem', boxSizing: 'border-box',
                    outline: 'none', resize: 'vertical', transition: 'border-color 0.2s',
                    fontFamily: 'inherit', lineHeight: 1.5
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gl-border)'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !rating || !reviewText.trim()}
                  style={{ 
                    padding: '10px 24px', background: '#6C63FF', border: 'none', borderRadius: 8, 
                    color: '#fff', cursor: isLoading || !rating || !reviewText.trim() ? 'not-allowed' : 'pointer', 
                    fontWeight: 600, opacity: isLoading || !rating || !reviewText.trim() ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  {isLoading ? (
                    <><Loader2 size={16} style={{ animation: 'glSpin 1s linear infinite' }} /> Publishing...</>
                  ) : (
                    'Publish Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
