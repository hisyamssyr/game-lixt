'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateThreadForm({ 
  placeholder = "What's on your mind?", 
  replyingTo = null 
}: { 
  placeholder?: string;
  replyingTo?: string | null;
}) {
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || posting) return;
    
    setPosting(true);
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, replying_to: replyingTo })
      });
      
      if (res.ok) {
        setComment('');
        toast.success(replyingTo ? 'Reply posted!' : 'Thread posted!');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to post');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ 
        position: 'relative',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(108, 99, 255, 0.2)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
        padding: '2px',
        marginBottom: 20
      }}>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          required
          style={{ 
            width: '100%', 
            background: 'transparent', 
            border: 'none', 
            padding: '20px', 
            color: '#F0F0F5', 
            fontSize: '1.05rem', 
            minHeight: 120, 
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            lineHeight: 1.5
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={posting || !comment.trim()} style={{ 
          background: 'linear-gradient(135deg, #6C63FF 0%, #8A84FF 100%)', 
          color: '#fff', border: 'none', borderRadius: 8, 
          padding: '12px 28px', fontSize: '1rem', fontWeight: 600, 
          cursor: posting || !comment.trim() ? 'not-allowed' : 'pointer',
          opacity: posting || !comment.trim() ? 0.6 : 1,
          transition: 'all 0.2s',
          boxShadow: posting || !comment.trim() ? 'none' : '0 4px 14px rgba(108, 99, 255, 0.4)'
        }}>
          {posting ? 'Posting...' : (replyingTo ? 'Post Reply' : 'Post Thread')}
        </button>
      </div>
    </form>
  );
}
