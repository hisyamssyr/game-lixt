'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Star, Trophy, ChevronDown, Check, Plus, Edit3 } from 'lucide-react';
import { GenrePill } from '@/components/GenrePill';
import { RatingBadge } from '@/components/RatingBadge';
import { ReviewCard } from '@/components/ReviewCard';
import { WriteReviewModal } from '@/components/modals/WriteReviewModal';
import { ListCard } from '@/components/ListCard';
import type { Game, GameStatus, Review, CuratedList } from '@/types/app';
import { toast } from 'sonner';

const statuses: { label: string; value: GameStatus; api: string; color: string }[] = [
  { label: 'Playing', value: 'playing', api: 'Playing', color: '#3B82F6' },
  { label: 'Completed', value: 'completed', api: 'Completed', color: '#39FF85' },
  { label: 'Plan to Play', value: 'plan_to_play', api: 'Plan to Play', color: '#FFB547' },
  { label: 'Dropped', value: 'dropped', api: 'Dropped', color: '#EF4444' },
];
import { useLibrary } from '@/components/Providers';

export function GameDetailView({ game, reviews, initialStatus, myLists = [], featuredLists = [] }: { game: Game; reviews: Review[]; initialStatus?: GameStatus | null; myLists?: { list_id: string; title: string }[], featuredLists?: CuratedList[] }) {
  const { library, addToLibrary: globalAddToLibrary } = useLibrary();
  const [tab, setTab] = useState<'overview' | 'reviews' | 'lists'>('overview');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<GameStatus | null>(initialStatus || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [listDropdownOpen, setListDropdownOpen] = useState(false);
  const [listBusy, setListBusy] = useState(false);

  // Sync local status with global library state if it changes!
  useEffect(() => {
    if (library[game.id]) {
      setStatus(library[game.id]);
    }
  }, [library, game.id]);

  async function addToList(list_id: string, list_title: string) {
    if (listBusy) return;
    setListBusy(true);
    try {
      const res = await fetch(`/api/lists/${list_id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id }),
      });
      if (res.ok) {
        toast.success(`Added to ${list_title}`);
        setListDropdownOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add to list');
      }
    } catch (e) {
      toast.error('Error adding to list');
    } finally {
      setListBusy(false);
    }
  }

  async function addToLibrary(play_status: GameStatus) {
    if (busy) return;
    setBusy(true);
    try {
      await globalAddToLibrary(game.id, play_status);
      setStatus(play_status);
      setDropdownOpen(false);
    } catch (e) {
      // Error is handled by globalAddToLibrary toast
    } finally {
      setBusy(false);
    }
  }

  const activeStatus = statuses.find(s => s.value === status);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const releaseDateString = game.releaseDate ? `${monthNames[new Date(game.releaseDate).getMonth()]} ${new Date(game.releaseDate).getDate()}, ${new Date(game.releaseDate).getFullYear()}` : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', color: '#F0F0F5' }}>
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Banner Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 500, background: `linear-gradient(180deg, rgba(15,15,19,0.3) 0%, var(--gl-bg-base) 100%), url(${game.coverImage}) center/cover`, opacity: 0.3, filter: 'blur(30px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 500, background: 'linear-gradient(0deg, var(--gl-bg-base) 0%, transparent 100%)', zIndex: 1 }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0', position: 'relative', zIndex: 10 }}>
          
          {/* Hero Section */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end', marginBottom: 64 }}>
            <div style={{ width: 260, flexShrink: 0 }}>
              <img src={game.coverImage} alt={game.title} style={{ width: '100%', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)', objectFit: 'cover', aspectRatio: '3/4' }} />
            </div>
            
            <div style={{ flex: 1, paddingBottom: 16 }}>
              <h1 style={{ margin: '0 0 16px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '3.6rem', lineHeight: 1.1, fontWeight: 800, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>{game.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, fontSize: '1.1rem', color: '#C0C0D0' }}>
                <span style={{ fontWeight: 600, color: '#F0F0F5' }}>{game.developer}</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#8888A0' }} />
                <span>{releaseDateString}</span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                {game.genres.map((genre) => <GenrePill key={genre} genre={genre} />)}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div>
                  <RatingBadge rating={game.rating} />
                  {reviews.length > 0 && <div style={{ fontSize: '0.85rem', color: '#8888A0', marginTop: 10, fontWeight: 500 }}>{reviews.length} user reviews</div>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Layout Below Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, paddingBottom: 80 }}>
            
            {/* Left Content Column */}
            <div>
              <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 32, overflowX: 'auto' }} className="no-scrollbar">
                {(['overview', 'reviews', 'lists'] as const).map((key) => (
                  <button 
                    key={key} 
                    onClick={() => setTab(key)} 
                    style={{ 
                      padding: '0 0 16px', background: 'transparent', border: 0, 
                      borderBottom: tab === key ? '2px solid #6C63FF' : '2px solid transparent', 
                      color: tab === key ? '#F0F0F5' : '#8888A0', cursor: 'pointer', 
                      textTransform: 'capitalize', fontWeight: tab === key ? 700 : 500, fontSize: '1.05rem',
                      whiteSpace: 'nowrap', transition: 'color 0.2s'
                    }}
                  >
                    {key} {key === 'reviews' && reviews.length > 0 ? `(${reviews.length})` : ''}
                  </button>
                ))}
              </div>

              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16, marginTop: 0 }}>About</h2>
                    <p style={{ color: '#C0C0D0', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>
                      {game.description || 'No description available yet.'}
                    </p>
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 20 }}>Media</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8888A0', fontSize: '0.9rem' }}>Trailer Placeholder</div>
                      <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8888A0', fontSize: '0.9rem' }}>Screenshot Placeholder</div>
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Trophy size={22} color="#FFB547" />
                      Achievements
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255, 181, 71, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Trophy size={20} color="#FFB547" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>The Awakened</span>
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(255, 181, 71, 0.1)', color: '#FFB547', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legendary</span>
                          </div>
                          <div style={{ color: '#8888A0', fontSize: '0.85rem', lineHeight: 1.4 }}>Discover the true nature of the house</div>
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Trophy size={20} color="#3B82F6" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Keeper of Memories</span>
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rare</span>
                          </div>
                          <div style={{ color: '#8888A0', fontSize: '0.85rem', lineHeight: 1.4 }}>Collect all 37 memory fragments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'reviews' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                  {reviews.length === 0 && <p style={{ color: '#8888A0', fontSize: '1.05rem' }}>No reviews yet. Be the first to write one!</p>}
                </div>
              )}

              {tab === 'lists' && (
                <div>
                  {featuredLists.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {featuredLists.map((list) => <ListCard key={list.id} list={list} games={[game]} />)}
                    </div>
                  ) : (
                    <div style={panelStyle}>
                      <BookOpen size={18} color="#6C63FF" />
                      <p style={{ margin: '12px 0 0', color: '#8888A0' }}>No curated lists feature this game yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Action Box */}
              <div style={{ background: 'rgba(30, 30, 42, 0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700, color: '#F0F0F5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Activity</h3>
                
                {/* Status Dropdown */}
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ 
                      width: '100%', padding: '14px 16px', borderRadius: 10, 
                      background: activeStatus ? `${activeStatus.color}15` : 'var(--gl-bg-surface)', 
                      border: `1px solid ${activeStatus ? `${activeStatus.color}40` : 'var(--gl-border)'}`, 
                      color: activeStatus ? activeStatus.color : '#F0F0F5', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {activeStatus ? (
                        <>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeStatus.color, boxShadow: `0 0 8px ${activeStatus.color}80` }} />
                          {activeStatus.label}
                        </>
                      ) : 'Add to Library'}
                    </div>
                    <ChevronDown size={18} />
                  </button>
                  
                  {dropdownOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropdownOpen(false)} />
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, 
                        background: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, 
                        padding: 8, zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                      }}>
                        {statuses.map(s => (
                          <button 
                            key={s.value} 
                            onClick={() => addToLibrary(s.value)}
                            style={{ 
                              width: '100%', padding: '12px 14px', background: status === s.value ? `${s.color}15` : 'transparent', 
                              border: 'none', borderRadius: 8, color: status === s.value ? s.color : '#F0F0F5', 
                              textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem', fontWeight: 500
                            }}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, opacity: status === s.value ? 1 : 0.5, marginLeft: 4 }} />
                            <span style={{ flex: 1 }}>{s.label}</span>
                            {status === s.value && <Check size={16} color={s.color} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Add to List Dropdown */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <button 
                    onClick={() => setListDropdownOpen(!listDropdownOpen)}
                    style={{ 
                      width: '100%', padding: '14px 16px', borderRadius: 10, 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      color: '#F0F0F5', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s'
                    }}
                  >
                    <Plus size={18} />
                    Add to List
                  </button>
                  
                  {listDropdownOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setListDropdownOpen(false)} />
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, 
                        background: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, 
                        padding: 8, zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                      }}>
                        {myLists.length === 0 ? (
                          <div style={{ padding: '14px', color: '#8888A0', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>You don't have any lists yet. Create one on the Lists page.</div>
                        ) : (
                          myLists.map(list => (
                            <button 
                              key={list.list_id} 
                              onClick={() => addToList(list.list_id, list.title)}
                              disabled={listBusy}
                              style={{ 
                                width: '100%', padding: '12px 14px', background: 'transparent', 
                                border: 'none', borderRadius: 8, color: '#F0F0F5', 
                                textAlign: 'left', cursor: listBusy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem', fontWeight: 500
                              }}
                            >
                              <span>{list.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Write Review Modal */}
                <WriteReviewModal 
                  gameId={game.id} 
                  gameTitle={game.title} 
                  isInLibrary={!!status} 
                />
              </div>

              {/* Information Box */}
              <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', margin: '0 0 20px' }}>
                  Information
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                    <span style={{ color: '#8888A0' }}>Developer</span>
                    <span style={{ fontWeight: 600, color: '#F0F0F5', textAlign: 'right' }}>{game.developer || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                    <span style={{ color: '#8888A0' }}>Publisher</span>
                    <span style={{ fontWeight: 600, color: '#F0F0F5', textAlign: 'right' }}>{game.developer || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                    <span style={{ color: '#8888A0' }}>Release Date</span>
                    <span style={{ fontWeight: 600, color: '#F0F0F5', textAlign: 'right' }}>{releaseDateString || 'TBA'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                    <span style={{ color: '#8888A0' }}>Rating</span>
                    <span style={{ fontWeight: 600, color: '#F0F0F5', textAlign: 'right' }}>{game.rating > 0 ? `${Number(game.rating).toFixed(1)} / 10` : 'Not Rated'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8888A0' }}>Platforms</span>
                    <span style={{ fontWeight: 600, color: '#F0F0F5', textAlign: 'right' }}>PC, PS5, Xbox Series</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const panelStyle: React.CSSProperties = { background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: 22 };
