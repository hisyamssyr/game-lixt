'use client';

import Link from 'next/link';
import { Code2, Gamepad2, MessageCircle, Radio, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function Footer() {
  const { data: session } = useSession();
  const profilePath = session?.user?.username ? `/profile/${encodeURIComponent(session.user.username)}` : '/login';

  return (
    <footer style={{
      background: 'var(--gl-bg-surface)',
      borderTop: '1px solid var(--gl-border)',
      padding: '48px 24px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Gamepad2 size={18} color="#fff" />
              </div>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#F0F0F5',
              }}>
                Game<span style={{ color: '#6C63FF' }}>Lixt</span>
              </span>
            </div>
            <p style={{ color: '#8888A0', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>
              Discover, track, and review games in one place. Your gaming life, organized.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 style={{ color: '#F0F0F5', fontSize: '0.84rem', fontWeight: 600, margin: '0 0 16px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Discover
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Browse Games', path: '/games' },
                { label: 'Top Rated', path: '/games' },
                { label: 'Trending Now', path: '/games' },
                { label: 'New Releases', path: '/games' },
              ].map((item) => (
                <Link key={item.label} href={item.path} style={{ color: '#8888A0', textDecoration: 'none', fontSize: '0.82rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0D0'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#8888A0'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 style={{ color: '#F0F0F5', fontSize: '0.84rem', fontWeight: 600, margin: '0 0 16px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Community
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Curated Lists', path: '/lists' },
                { label: 'User Reviews', path: '/games' },
                { label: 'Discussions', path: '/games' },
                { label: 'Leaderboards', path: '/games' },
              ].map((item) => (
                <Link key={item.label} href={item.path} style={{ color: '#8888A0', textDecoration: 'none', fontSize: '0.82rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0D0'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#8888A0'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: '#F0F0F5', fontSize: '0.84rem', fontWeight: 600, margin: '0 0 16px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Sign Up', path: '/register' },
                { label: 'Log In', path: '/login' },
                { label: 'My Profile', path: profilePath },
                { label: 'Edit Profile', path: session ? `${profilePath}/setting` : '/login' },
              ].map((item) => (
                <Link key={item.label} href={item.path} style={{ color: '#8888A0', textDecoration: 'none', fontSize: '0.82rem', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0D0'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#8888A0'}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          borderTop: '1px solid var(--gl-border)',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ color: '#8888A0', fontSize: '0.78rem', margin: 0 }}>
            Â© 2026 GameLixt. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[Send, Code2, MessageCircle, Radio].map((Icon, i) => (
              <button
                key={i}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--gl-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#8888A0',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F0F5'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(108,99,255,0.4)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8888A0'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gl-border)'; }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


