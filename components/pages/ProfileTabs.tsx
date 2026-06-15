'use client';

import { useState } from 'react';
import { BookOpen, List, Star } from 'lucide-react';
import Link from 'next/link';
import { CreateListModal } from '@/components/CreateListModal';
import { ListCard } from '@/components/ListCard';
import { ReviewCard } from '@/components/ReviewCard';
import type { CuratedList, Game, Review } from '@/components/types';

const tabs = [
  { key: 'library', label: 'Library', icon: BookOpen, empty: 'Library items will appear here.' },
  { key: 'reviews', label: 'Reviews', icon: Star, empty: 'Reviews will appear here.' },
  { key: 'lists', label: 'Lists', icon: List, empty: 'Curated lists will appear here.' },
] as const;

export interface LibraryItem {
  library_id: string;
  game_id: string;
  play_status: string;
  added_at: Date | string;
  title: string | null;
  cover_url: string | null;
}

export function ProfileTabs({ library = [], lists = [], games = [], reviews = [], gameTitles = {}, isOwnProfile = false }: { library?: LibraryItem[], lists?: CuratedList[], games?: Game[], reviews?: Review[], gameTitles?: Record<string, string>, isOwnProfile?: boolean }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('library');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const ActiveIcon = active.icon;

  const filteredLibrary = selectedStatus === 'All' ? library : library.filter(item => item.play_status === selectedStatus);

  return (
    <div>
      <div style={{ background: 'var(--gl-bg-surface)', borderBottom: '1px solid var(--gl-border)', borderTop: '1px solid var(--gl-border)' }}>
        <div className="no-scrollbar" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, padding: '0 24px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '13px 18px', background: 'transparent', border: 'none', borderBottom: `2px solid ${isActive ? '#6C63FF' : 'transparent'}`, color: isActive ? '#F0F0F5' : '#8888A0', cursor: 'pointer', fontSize: '0.86rem', fontWeight: isActive ? 700 : 500, marginBottom: -1, fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap' }}>
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'lists' && lists.length > 0 ? (
          <div>
            {isOwnProfile && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <CreateListModal />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {lists.map(list => (
                <ListCard key={list.id} list={list} games={games} />
              ))}
            </div>
          </div>
        ) : activeTab === 'library' && library.length > 0 ? (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
              {['All', 'Playing', 'Plan to Play', 'Completed', 'Dropped'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  style={{
                    padding: '6px 14px',
                    background: selectedStatus === status ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                    border: `1px solid ${selectedStatus === status ? 'rgba(108, 99, 255, 0.3)' : 'var(--gl-border)'}`,
                    borderRadius: 20,
                    color: selectedStatus === status ? '#F0F0F5' : '#8888A0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
            
            {filteredLibrary.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {filteredLibrary.map((item) => (
                  <Link href={`/games/${item.game_id}`} key={item.library_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
                      <img src={item.cover_url || 'https://picsum.photos/seed/game/300/400'} alt={item.title || 'Game'} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                      <div style={{ padding: 12 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#F0F0F5' }}>{item.title}</h3>
                        <span style={{ 
                          fontSize: '0.7rem', padding: '4px 8px', borderRadius: 100, 
                          background: item.play_status === 'Playing' ? 'rgba(59, 130, 246, 0.15)' :
                                      item.play_status === 'Completed' ? 'rgba(57, 255, 133, 0.15)' :
                                      item.play_status === 'Plan to Play' ? 'rgba(255, 181, 71, 0.15)' :
                                      item.play_status === 'Dropped' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(108, 99, 255, 0.15)', 
                          color: item.play_status === 'Playing' ? '#3B82F6' :
                                 item.play_status === 'Completed' ? '#39FF85' :
                                 item.play_status === 'Plan to Play' ? '#FFB547' :
                                 item.play_status === 'Dropped' ? '#EF4444' : '#6C63FF', 
                          fontWeight: 600 
                        }}>{item.play_status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: '56px 24px', textAlign: 'center', color: '#8888A0' }}>
                <BookOpen size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.45 }} />
                <h2 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem' }}>No games found</h2>
                <p style={{ margin: 0, fontSize: '0.86rem' }}>There are no games with the status "{selectedStatus}".</p>
              </div>
            )}
          </div>
        ) : activeTab === 'reviews' && reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} gameTitles={gameTitles} showGame={true} />
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: '56px 24px', textAlign: 'center', color: '#8888A0' }}>
            <ActiveIcon size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.45 }} />
            <h2 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem' }}>{active.label}</h2>
            <p style={{ margin: 0, fontSize: '0.86rem', marginBottom: isOwnProfile && activeTab === 'lists' ? 24 : 0 }}>{active.empty}</p>
            {isOwnProfile && activeTab === 'lists' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateListModal />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
