'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X, Edit2, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { ImageWithFallback } from '@/components/ImageWithFallback';

type ListItem = { item_id: string, game_id: string, title: string, cover_url: string | null };

export function EditListModal({ listId, initialTitle, initialDescription, items = [] }: { listId: string, initialTitle: string, initialDescription: string, items?: ListItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [removedGames, setRemovedGames] = useState<Set<string>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update list details');
      }

      if (removedGames.size > 0) {
        const deletePromises = Array.from(removedGames).map(game_id =>
          fetch(`/api/lists/${listId}/items`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id }),
          }).then(async r => {
            if (!r.ok) {
              const d = await r.json();
              throw new Error(d.error || 'Failed to remove a game');
            }
          })
        );
        await Promise.all(deletePromises);
      }

      setIsOpen(false);
      router.refresh();
      toast.success('List updated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred while updating');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRemove = (gameId: string) => {
    setRemovedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) newSet.delete(gameId);
      else newSet.add(gameId);
      return newSet;
    });
  };

  const confirmDeleteList = async () => {
    setIsLoading(true);
    setShowConfirmDelete(false);
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete list');
      }
      toast.success('List deleted successfully');
      
      if (session?.user?.username) {
        router.push(`/profile/${session.user.username}`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred while deleting');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', 
          background: 'transparent', color: '#F0F0F5', border: '1px solid var(--gl-border)', borderRadius: 8, 
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Edit2 size={14} />
        Edit List
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 15, 19, 0.8)', backdropFilter: 'blur(4px)',
          padding: 24, overflowY: 'auto'
        }}>

          <div style={{
            background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)',
            borderRadius: 16, width: '100%', maxWidth: 460,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden', animation: 'glFadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gl-border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Edit List</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#8888A0', marginBottom: 8 }}>List Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Best RPGs of 2026"
                  required
                  style={{
                    width: '100%', padding: '12px 16px', background: 'var(--gl-bg-base)',
                    border: '1px solid var(--gl-border)', borderRadius: 8,
                    color: '#F0F0F5', fontSize: '0.95rem', boxSizing: 'border-box',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gl-border)'}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#8888A0', marginBottom: 8 }}>Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this list about?"
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', background: 'var(--gl-bg-base)',
                    border: '1px solid var(--gl-border)', borderRadius: 8,
                    color: '#F0F0F5', fontSize: '0.95rem', boxSizing: 'border-box',
                    outline: 'none', resize: 'vertical', transition: 'border-color 0.2s'
                  }}
                  onBlur={(e) => e.target.style.borderColor = 'var(--gl-border)'}
                />
              </div>

              {items.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#8888A0', marginBottom: 8 }}>Games in this List</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', paddingRight: 8 }}>
                    {items.map(item => (
                      <div key={item.game_id} style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', 
                        background: 'var(--gl-bg-base)', border: '1px solid var(--gl-border)', 
                        borderRadius: 8, opacity: removedGames.has(item.game_id) ? 0.4 : 1,
                        transition: 'opacity 0.2s'
                      }}>
                        <ImageWithFallback src={item.cover_url ?? 'https://picsum.photos/seed/game-lixt-item/40/60'} alt={item.title} style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                        <span style={{ color: '#F0F0F5', fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: removedGames.has(item.game_id) ? 'line-through' : 'none' }}>{item.title}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleRemove(item.game_id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: removedGames.has(item.game_id) ? '#6C63FF' : '#FF4747', padding: 4, display: 'flex'
                          }}
                          title={removedGames.has(item.game_id) ? "Undo remove" : "Remove from list"}
                        >
                          {removedGames.has(item.game_id) ? <RotateCcw size={16} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  {removedGames.size > 0 && <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#FFB547' }}>{removedGames.size} game(s) will be removed when you save.</p>}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gl-border)', paddingTop: 16 }}>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmDelete(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                >
                  <Trash2 size={16} /> Delete List
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading || !title.trim()}
                    style={{ 
                      padding: '10px 24px', background: '#6C63FF', border: 'none', borderRadius: 8, 
                      color: '#fff', cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer', 
                      fontWeight: 600, opacity: isLoading || !title.trim() ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    {isLoading && <Loader2 size={16} style={{ animation: 'glSpin 1s linear infinite' }} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110, 
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
            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Delete List</h3>
            <p style={{ margin: '0 0 24px', color: '#8888A0', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this list? This action cannot be undone and will remove all games inside it.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                disabled={isLoading}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteList}
                disabled={isLoading}
                style={{ padding: '8px 16px', background: '#EF4444', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
