'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { CuratedList, Game } from '@/types/app';
import { toast } from 'sonner';

interface ListCardProps {
  list: CuratedList;
  games: Game[];
}

export function ListCard({ list, games }: ListCardProps) {
  const [upvotes, setUpvotes] = useState(list.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(list.hasUpvoted ?? false);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  const covers = list.covers && list.covers.length > 0 
    ? list.covers.slice(0, 4) 
    : list.gameIds.slice(0, 4).map((id) => games.find((g) => g.id === id)?.coverImage).filter(Boolean) as string[];

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
    <Link href={`/lists/${list.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        background: 'var(--gl-bg-surface)',
        border: '1px solid var(--gl-border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gl-border)';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
      >
        {/* Cover mosaic */}
        <div style={{ display: 'flex', height: 140, overflow: 'hidden', background: 'var(--gl-bg-elevated)' }}>
          {covers.length === 0 ? (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <List size={32} color="#8888A0" />
            </div>
          ) : covers.length === 1 ? (
            <div style={{ width: '100%', height: '100%' }}>
              <ImageWithFallback src={covers[0]} alt={list.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : covers.length === 2 ? (
            <div style={{ display: 'flex', width: '100%' }}>
              <ImageWithFallback src={covers[0]} alt={list.title} style={{ width: '50%', height: '100%', objectFit: 'cover', borderRight: '2px solid var(--gl-bg-surface)' }} />
              <ImageWithFallback src={covers[1]} alt={list.title} style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : covers.length === 3 ? (
            <div style={{ display: 'flex', width: '100%' }}>
              <ImageWithFallback src={covers[0]} alt={list.title} style={{ width: '50%', height: '100%', objectFit: 'cover', borderRight: '2px solid var(--gl-bg-surface)' }} />
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                <ImageWithFallback src={covers[1]} alt={list.title} style={{ width: '100%', height: '50%', objectFit: 'cover', borderBottom: '2px solid var(--gl-bg-surface)' }} />
                <ImageWithFallback src={covers[2]} alt={list.title} style={{ width: '100%', height: '50%', objectFit: 'cover' }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
              <ImageWithFallback src={covers[0]} alt={list.title} style={{ width: '50%', height: '50%', objectFit: 'cover', borderRight: '2px solid var(--gl-bg-surface)', borderBottom: '2px solid var(--gl-bg-surface)' }} />
              <ImageWithFallback src={covers[1]} alt={list.title} style={{ width: '50%', height: '50%', objectFit: 'cover', borderBottom: '2px solid var(--gl-bg-surface)' }} />
              <ImageWithFallback src={covers[2]} alt={list.title} style={{ width: '50%', height: '50%', objectFit: 'cover', borderRight: '2px solid var(--gl-bg-surface)' }} />
              <ImageWithFallback src={covers[3]} alt={list.title} style={{ width: '50%', height: '50%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{
            margin: '0 0 6px',
            color: '#F0F0F5',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {list.title}
          </h3>
          <p style={{
            margin: '0 0 12px',
            color: '#8888A0',
            fontSize: '0.76rem',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {list.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ImageWithFallback
                src={list.avatar}
                alt={list.username}
                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ color: '#8888A0', fontSize: '0.73rem' }}>by {list.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                {/* Left side: Arrow */}
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
                
                {/* Right side: Number */}
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


