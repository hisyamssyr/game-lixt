'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronUp, MessageCircle, MoreHorizontal, Edit3, Trash2, Check, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { ForumThread } from '@/types/app';
import { toast } from 'sonner';

export function ThreadCard({ thread, isDetailView = false }: { thread: ForumThread; isDetailView?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthor = session?.user?.user_id === thread.userId;

  const [upvotes, setUpvotes] = useState(thread.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(thread.hasUpvoted ?? false);
  const [voting, setVoting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(thread.comment);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/threads/${thread.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editedText }),
      });
      if (res.ok) {
        toast.success('Thread updated');
        setIsEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update thread');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmDelete(false);
    try {
      const res = await fetch(`/api/threads/${thread.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Thread deleted');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete thread');
        setIsDeleting(false);
      }
    } catch (e) {
      toast.error('Network error while deleting');
      setIsDeleting(false);
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
                    <span suppressHydrationWarning>{new Date(thread.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span suppressHydrationWarning>{new Date(thread.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              {isAuthor && !isEditing && (
                <div style={{ position: 'relative' }} ref={dropdownRef} onClick={e => e.stopPropagation()}>
                  <button style={{ background: isDropdownOpen ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: isDropdownOpen ? '#F0F0F5' : '#606075', cursor: 'pointer', transition: 'all 0.2s', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#C0C0D0'}
                    onMouseLeave={e => { if (!isDropdownOpen) (e.currentTarget as HTMLButtonElement).style.color = '#606075'; }}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 8,
                      background: '#1A1A24', border: '1px solid var(--gl-border)',
                      borderRadius: 8, padding: 6, minWidth: 120, zIndex: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'glFadeIn 0.15s ease-out'
                    }}>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); setIsDropdownOpen(false); }}
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
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirmDelete(true); setIsDropdownOpen(false); }}
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

            {/* Comment Body OR Edit Form */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit} onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={4}
                  required
                  autoFocus
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--gl-border)', borderRadius: 8,
                    color: '#F0F0F5', fontSize: '0.9rem', resize: 'vertical',
                    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
                    lineHeight: 1.6
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'var(--gl-border)'}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditedText(thread.comment); }}
                    style={{
                      padding: '6px 12px', background: 'transparent', border: '1px solid var(--gl-border)',
                      borderRadius: 6, color: '#C0C0D0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit || !editedText.trim()}
                    style={{
                      padding: '6px 16px', background: '#6C63FF', border: 'none',
                      borderRadius: 6, color: '#fff', cursor: isSubmittingEdit ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                      opacity: (isSubmittingEdit || !editedText.trim()) ? 0.6 : 1
                    }}
                  >
                    {isSubmittingEdit ? <><Loader2 size={12} style={{ animation: 'glSpin 1s linear infinite' }} /> Saving</> : <><Check size={12} /> Save</>}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ 
                color: '#D4D4E0', 
                fontSize: isDetailView && isRoot ? '1.15rem' : '1rem', 
                lineHeight: 1.65, 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word', 
                marginBottom: 20,
                letterSpacing: '-0.01em'
              }}>
                {thread.replyingToUsername && (
                  <Link href={`/profile/${encodeURIComponent(thread.replyingToUsername)}`} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                    <span style={{ color: '#6C63FF', fontWeight: 600, marginRight: 6 }}>
                      @{thread.replyingToUsername}
                    </span>
                  </Link>
                )}
                {thread.comment}
              </div>
            )}

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
      
      {showConfirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 15, 19, 0.8)', backdropFilter: 'blur(4px)',
          padding: 24
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)',
            borderRadius: 16, width: '100%', maxWidth: 400,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden', animation: 'glFadeIn 0.2s ease-out', padding: 24
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Delete Thread</h3>
            <p style={{ margin: '0 0 24px', color: '#8888A0', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this thread? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }}
                disabled={isDeleting}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                disabled={isDeleting}
                style={{ padding: '8px 16px', background: '#EF4444', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {isDeleting ? <Loader2 size={14} style={{ animation: 'glSpin 1s linear infinite' }} /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </CardWrapper>
  );
}
