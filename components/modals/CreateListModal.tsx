'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Loader2 } from 'lucide-react';

export function CreateListModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setIsOpen(false);
        setTitle('');
        setDescription('');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create list');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', 
          background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 8, 
          fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          transition: 'background 0.2s',
          boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
        }}
      >
        <Plus size={16} />
        Create List
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 15, 19, 0.8)', backdropFilter: 'blur(4px)',
          padding: 24
        }}>
          <div style={{
            background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)',
            borderRadius: 16, width: '100%', maxWidth: 460,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            overflow: 'hidden', animation: 'glFadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gl-border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5' }}>Create a New List</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
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
                  disabled={isLoading || !title.trim()}
                  style={{ 
                    padding: '10px 24px', background: '#6C63FF', border: 'none', borderRadius: 8, 
                    color: '#fff', cursor: isLoading || !title.trim() ? 'not-allowed' : 'pointer', 
                    fontWeight: 600, opacity: isLoading || !title.trim() ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  {isLoading && <Loader2 size={16} style={{ animation: 'glSpin 1s linear infinite' }} />}
                  Create List
                </button>
              </div>
            </form>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes glFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes glSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}} />
        </div>
      )}
    </>
  );
}
