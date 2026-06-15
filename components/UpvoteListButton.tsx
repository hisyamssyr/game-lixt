'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UpvoteListButton({ listId, initialScore, initialUpvoted = false }: { listId: string, initialScore: number, initialUpvoted?: boolean }) {
  const [score, setScore] = useState(initialScore);
  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isBusy, setIsBusy] = useState(false);
  const router = useRouter();

  const handleUpvote = async () => {
    if (isBusy) return;
    setIsBusy(true);

    try {
      // Toggle logic
      const willUpvote = !isUpvoted;

      const res = await fetch(`/api/lists/${listId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_upvote: true }), // the stored procedure toggle_list_vote takes a boolean. is_upvote: true triggers the toggle.
      });

      if (res.ok) {
        setIsUpvoted(willUpvote);
        setScore(prev => willUpvote ? prev + 1 : prev - 1);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to record vote');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button 
      onClick={handleUpvote}
      disabled={isBusy}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: isBusy ? 'not-allowed' : 'pointer',
        padding: 0,
        height: 32,
        transition: 'opacity 0.2s',
        opacity: isBusy ? 0.7 : 1
      }}
    >
      {/* Left side: Arrow */}
      <div style={{
        background: isUpvoted ? '#6C63FF' : '#E0E0E0',
        padding: '0 14px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isUpvoted ? '#fff' : '#111'}>
          <path d="M12 4L22 20H2Z" />
        </svg>
      </div>
      
      {/* Right side: Number */}
      <div style={{
        background: 'rgba(25, 25, 35, 1)',
        color: '#fff',
        padding: '0 14px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {Number(score).toLocaleString()}
      </div>
    </button>
  );
}
