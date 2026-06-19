'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, Gamepad2, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { signOut, useSession } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user ?? null;
  const username = currentUser?.username ?? currentUser?.name ?? currentUser?.email ?? 'Player';
  const profilePath = currentUser?.username
    ? `/profile/${encodeURIComponent(currentUser.username)}`
    : currentUser?.email
      ? `/profile/${encodeURIComponent(currentUser.email)}`
      : '/login';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Games', path: '/games' },
    { label: 'Lists', path: '/lists' },
    { label: 'Community', path: '/threads' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(15, 15, 19, 0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 40, flexShrink: 0 }}>
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
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#F0F0F5',
          letterSpacing: '-0.01em',
        }}>
          Game<span style={{ color: '#6C63FF' }}>Lixt</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}
        className="hidden md:flex">
        {navLinks.map((link) => {
          const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path.split('/')[1] ? `/${link.path.split('/')[1]}` : link.path));
          return (
            <Link
              key={link.path}
              href={link.path}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                color: active ? '#F0F0F5' : '#8888A0',
                background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
                fontSize: '0.88rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#F0F0F5'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#8888A0'; }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {/* Search */}
        {searchOpen ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(108,99,255,0.5)',
                borderRadius: 8,
                padding: '6px 14px',
                color: '#F0F0F5',
                fontSize: '0.85rem',
                outline: 'none',
                width: 220,
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginLeft: 4, color: '#8888A0' }}
            >
              <X size={16} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--gl-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8888A0',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F0F5'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(108,99,255,0.4)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8888A0'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gl-border)'; }}
          >
            <Search size={16} />
          </button>
        )}

        {currentUser ? (
          <>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 4px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--gl-border)',
                  cursor: 'pointer',
                }}
              >
                <ImageWithFallback
                  src={(currentUser.avatar_url ?? currentUser.image ?? '/default-avatar.png')}
                  alt={username}
                  style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ color: '#F0F0F5', fontSize: '0.82rem', fontWeight: 500 }}>{username}</span>
                <ChevronDown size={14} color="#8888A0" />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 180,
                  background: 'var(--gl-bg-elevated)',
                  border: '1px solid var(--gl-border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                }}>
                  {[
                    { label: 'My Profile', path: profilePath },
                    { label: 'Edit Profile', path: `${profilePath}/setting` },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.path}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        color: '#C0C0D0',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--gl-border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      color: '#FF4D6A',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '7px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--gl-border)',
                color: '#C0C0D0',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(108,99,255,0.5)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gl-border)'}
              >
                Log In
              </button>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '7px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6C63FF, #3B82F6)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
              >
                Sign Up Free
              </button>
            </Link>
          </>
        )}

        {/* Mobile menu */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--gl-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8888A0',
          }}
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          background: 'rgba(15, 15, 19, 0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--gl-border)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#C0C0D0',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}





