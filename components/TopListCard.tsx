'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List, Trophy } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { CuratedList } from '@/types/app';
import { toast } from 'sonner';

interface TopListCardProps {
  list: CuratedList;
}

export function TopListCard({ list }: TopListCardProps) {
  const [upvotes, setUpvotes] = useState(list.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(list.hasUpvoted ?? false);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (voting) return;
    
    setVoting(true);
    const newUpvotedState = !hasUpvoted;
    
    setUpvotes(prev => newUpvotedState ? prev + 1 : prev - 1);
    setHasUpvoted(newUpvotedState);
    
    try {
      const res = await fetch(`/api/lists/${list.id}/votes`, {
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
        setUpvotes(prev => newUpvotedState ? prev - 1 : prev + 1);
        setHasUpvoted(!newUpvotedState);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error('Network error while voting');
      setUpvotes(prev => newUpvotedState ? prev - 1 : prev + 1);
      setHasUpvoted(!newUpvotedState);
    } finally {
      setVoting(false);
    }
  };

  return (
    <Link href={`/lists/${list.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: 40, position: 'relative', transition: 'transform 0.2s', cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 220 }}>
          <div style={{ flex: '1 1 300px', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,19,0.4)', position: 'relative' }}>
            {list.covers && list.covers.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {list.covers.slice(0, 3).map((cover, i) => (
                  <div key={i} style={{ 
                    width: 100, height: 140, borderRadius: 8, overflow: 'hidden', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    transform: `translateX(${i === 0 ? 20 : i === 2 ? -20 : 0}px) scale(${i === 1 ? 1.1 : 0.95}) rotate(${i === 0 ? -6 : i === 2 ? 6 : 0}deg)`,
                    zIndex: i === 1 ? 3 : 2,
                    position: 'relative'
                  }}>
                    <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ width: 120, height: 160, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={32} color="#8888A0" opacity={0.5} />
              </div>
            )}
          </div>
          <div style={{ flex: '2 1 400px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 24, background: 'rgba(255, 181, 71, 0.15)', border: '1px solid rgba(255, 181, 71, 0.3)', color: '#FFB547', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content', marginBottom: 16 }}>
              <Trophy size={13} />
              TOP RATED LIST
            </div>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: '#F0F0F5', lineHeight: 1.2 }}>{list.title}</h2>
            <p style={{ margin: '0 0 24px', color: '#8888A0', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{list.description || 'No description provided.'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageWithFallback src={list.avatar} alt={list.username} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ color: '#C0C0D0', fontSize: '0.86rem' }}>{list.username}</span>
              </div>
              <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>•</span>
              <span style={{ color: '#8888A0', fontSize: '0.86rem' }}>{list.gameCount} games</span>
              <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>•</span>
              
              <button
                onClick={handleUpvote}
                disabled={voting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  height: 28,
                  transition: 'opacity 0.2s',
                  opacity: voting ? 0.7 : 1
                }}
              >
                <div style={{
                  background: hasUpvoted ? '#6C63FF' : '#E0E0E0',
                  padding: '0 12px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={hasUpvoted ? '#fff' : '#111'}>
                    <path d="M12 4L22 20H2Z" />
                  </svg>
                </div>
                
                <div style={{
                  background: 'rgba(25, 25, 35, 1)',
                  color: '#fff',
                  padding: '0 12px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  {upvotes.toLocaleString()}
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
