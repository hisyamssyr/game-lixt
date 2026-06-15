'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
      setAvatarUrl(session.user.avatar_url || '');
      setFetching(false);
    } else if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar_url: avatarUrl }),
      });

      if (res.ok) {
        toast.success('Profile updated successfully');
        // Update the NextAuth session so it reflects the new username/avatar
        await update({ username: username.trim(), avatar: avatarUrl });
        router.refresh();
        router.push(`/profile/${encodeURIComponent(username.trim())}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8888A0' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F0F0F5', marginBottom: 24 }}>
        Edit Profile
      </h1>
      
      <div style={{ background: 'var(--gl-bg-surface)', padding: 32, borderRadius: 16, border: '1px solid var(--gl-border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label style={{ display: 'block', color: '#F0F0F5', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>
              Username <span style={{ color: '#FFB547' }}>*</span>
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. moba_god"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '1rem', fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#F0F0F5', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>
              Avatar URL
            </label>
            <input 
              type="url" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '1rem', fontFamily: 'inherit'
              }}
            />
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#8888A0' }}>
              Provide an absolute URL to an image for your avatar.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button 
              type="button" 
              onClick={() => router.push(`/profile/${encodeURIComponent(session?.user?.username || '')}`)}
              disabled={loading}
              style={{
                background: 'transparent',
                color: '#F0F0F5', border: '1px solid var(--gl-border)', borderRadius: 8, padding: '12px 24px',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #8A84FF 100%)',
                color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
