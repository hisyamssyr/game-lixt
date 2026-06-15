'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronUp, MessageCircle, MoreHorizontal } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { ForumThread } from '@/components/types';
import { toast } from 'sonner';

export function ThreadCard({ thread, isDetailView = false }: { thread: ForumThread; isDetailView?: boolean }) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(thread.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(thread.hasUpvoted ?? false);
  const [voting, setVoting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);

  const isRoot = thread.replyingTo === null;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (voting || !isRoot) return;
    
    setVoting(true);
    const newUpvotedState = !hasUpvoted;
    
    // Optimistic UI update
    setUpvotes(prev => newUpvotedState ? prev + 1 : prev - 1);
    setHasUpvoted(newUpvotedState);
    
    try {
      const res = await fetch(`/api/threads/${thread.id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_upvote: true }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Please log in to upvote');
        } else {
          toast.error('Failed to update vote');
        }
        // Revert optimistic update
        setUpvotes(prev => newUpvotedState ? prev - 1 : prev + 1);
        setHasUpvoted(!newUpvotedState);
      } else {
        router.refresh(); // Update Next.js Router Cache
      }
    } catch (err) {
      toast.error('Network error while voting');
      setUpvotes(prev => newUpvotedState ? prev - 1 : prev + 1);
      setHasUpvoted(!newUpvotedState);
    } finally {
      setVoting(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: replyText, replying_to: thread.id })
      });
      if (res.ok) {
        setReplyText('');
        setReplyOpen(false);
        toast.success('Reply posted!');
        router.refresh();
      } else {
        if (res.status === 401) toast.error('Please log in to reply');
        else toast.error('Failed to post reply');
      }
    } catch (err) {
      toast.error('Network error while posting');
    } finally {
      setPosting(false);
    }
  };

  const CardWrapper = 'div';
  const wrapperProps = isDetailView ? {} : { 
    onClick: (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, form, textarea')) return;
      router.push(`/threads/${thread.id}`);
    },
    style: { cursor: 'pointer' }
  };

  return (
    // @ts-ignore
    <CardWrapper {...wrapperProps}>
      <div style={{
        background: isDetailView ? 'rgba(20, 20, 28, 0.4)' : 'rgba(20, 20, 28, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
        marginBottom: isDetailView ? 0 : 20,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: isDetailView ? 'none' : '0 4px 24px -12px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
        onMouseEnter={(e) => {
          if (!isDetailView) {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108, 99, 255, 0.3)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px -12px rgba(108, 99, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDetailView) {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
            (e.currentTarget as HTMLDivElement).style.transform = 'none';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px -12px rgba(0,0,0,0.5)';
          }
        }}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Voting Column (Root threads only) */}
          {isRoot && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 48, flexShrink: 0 }}>
              <button 
                onClick={handleUpvote}
                disabled={voting}
                style={{ 
                  background: hasUpvoted ? 'rgba(108, 99, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)', 
                  border: `1px solid ${hasUpvoted ? 'rgba(108, 99, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                  cursor: 'pointer',
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hasUpvoted ? '#8A84FF' : '#8888A0',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  boxShadow: hasUpvoted ? '0 0 16px rgba(108, 99, 255, 0.2)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!hasUpvoted) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.08)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#C0C0D0';
                  }
                }}
                onMouseLeave={e => {
                  if (!hasUpvoted) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.03)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#8888A0';
                  }
                }}
              >
                <ChevronUp size={22} strokeWidth={2.5} style={{ transform: hasUpvoted ? 'translateY(-1px)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 700, 
                color: hasUpvoted ? '#8A84FF' : '#F0F0F5',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                {upvotes}
              </span>
            </div>
          )}

          {/* Main Content Column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header: Author & Date */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <ImageWithFallback 
                    src={thread.avatar} 
                    alt={thread.username} 
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                  />
                  {/* Subtle online indicator ring */}
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#39FF85', border: '2px solid var(--gl-bg-surface)' }} />
                </div>
                <div>
                  <Link href={`/profile/${encodeURIComponent(thread.username)}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#F0F0F5', letterSpacing: '-0.01em', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#8A84FF'}
                      onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = '#F0F0F5'}
                    >
                      {thread.username}
                    </span>
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{new Date(thread.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span>{new Date(thread.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: '#606075', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#C0C0D0'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#606075'}
              >
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Comment Body */}
            <div style={{ 
              color: '#D4D4E0', 
              fontSize: isDetailView && isRoot ? '1.15rem' : '1rem', 
              lineHeight: 1.65, 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word', 
              marginBottom: 20,
              letterSpacing: '-0.01em'
            }}>
              {thread.comment}
            </div>

            {/* Footer Metrics (Reply count, etc.) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderTop: isDetailView && isRoot ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingTop: isDetailView && isRoot ? 16 : 0 }}>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReplyOpen(!replyOpen); }}
                style={{ 
                  background: replyOpen ? 'rgba(108, 99, 255, 0.1)' : 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', gap: 8, 
                  color: replyOpen ? '#8A84FF' : '#8888A0', 
                  fontSize: '0.9rem', fontWeight: 600, 
                  transition: 'all 0.2s', 
                  padding: '6px 12px',
                  borderRadius: 20,
                  marginLeft: -12
                }}
                onMouseEnter={e => {
                  if (!replyOpen) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#C0C0D0';
                  }
                }}
                onMouseLeave={e => {
                  if (!replyOpen) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#8888A0';
                  }
                }}
              >
                <MessageCircle size={18} />
                <span>{thread.replyCount > 0 ? `${thread.replyCount} ` : ''}Reply</span>
              </button>
            </div>

            {/* Inline Reply Form */}
            {replyOpen && (
              <div style={{ marginTop: 20, animation: 'fadeIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handlePostReply}>
                  <div style={{ 
                    position: 'relative',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(108, 99, 255, 0.2)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                    padding: '2px',
                    marginBottom: 16
                  }}>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      autoFocus
                      style={{ 
                        width: '100%', 
                        background: 'transparent', 
                        border: 'none', 
                        padding: '16px', 
                        color: '#F0F0F5', 
                        fontSize: '1rem', 
                        minHeight: 100, 
                        resize: 'vertical', 
                        fontFamily: 'inherit',
                        outline: 'none',
                        lineHeight: 1.5
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" onClick={() => setReplyOpen(false)} style={{ 
                      background: 'transparent', color: '#8888A0', border: 'none', padding: '10px 20px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s' 
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#F0F0F5'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#8888A0'}
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={posting || !replyText.trim()} style={{ 
                      background: 'linear-gradient(135deg, #6C63FF 0%, #8A84FF 100%)', 
                      color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: '0.95rem', fontWeight: 600, 
                      cursor: posting || !replyText.trim() ? 'not-allowed' : 'pointer', 
                      opacity: posting || !replyText.trim() ? 0.5 : 1,
                      boxShadow: posting || !replyText.trim() ? 'none' : '0 4px 14px rgba(108, 99, 255, 0.4)',
                      transition: 'all 0.2s'
                    }}>
                      {posting ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
