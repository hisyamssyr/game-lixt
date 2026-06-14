'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const username = String(form.get('username') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setBusy(false);
      return;
    }

    const body = { username, email, password };
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Registration failed.'); setBusy(false); return; }
    const result = await signIn('credentials', { email: body.email, password: body.password, redirect: false });
    setBusy(false);
    if (!result?.ok || result.error) {
      setError('Account created, but automatic login failed. Please log in.');
      router.push('/login');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return <div style={{ minHeight: '80vh', background: 'var(--gl-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}><div style={{ width: '100%', maxWidth: 420, background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}><h1 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem' }}>Create account</h1><p style={{ margin: '0 0 24px', color: '#8888A0' }}>Start building your GameLixt library.</p><form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><input name="username" required placeholder="Username" style={inputStyle} /><input name="email" type="email" required placeholder="Email" style={inputStyle} /><input name="password" type="password" required minLength={8} placeholder="Password" style={inputStyle} /><input name="confirmPassword" type="password" required minLength={8} placeholder="Confirm password" style={inputStyle} />{error && <p style={{ color: '#FF4D6A', margin: 0, fontSize: '0.84rem' }}>{error}</p>}<button disabled={busy} style={buttonStyle}>{busy ? 'Creating...' : 'Sign Up Free'}</button><p style={{ color: '#8888A0', margin: '8px 0 0', textAlign: 'center' }}>Already have an account? <Link href="/login" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 700 }}>Log in</Link></p></form></div></div>;
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', padding: '12px 14px', outline: 'none' };
const buttonStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', border: 0, color: '#fff', cursor: 'pointer', fontWeight: 700 };
