'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const result = await signIn('credentials', { email, password, redirect: false });
    setBusy(false);
    if (!result?.ok || result.error) {
      setError(result?.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Unable to log in. Please try again.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return <AuthShell title="Welcome back" subtitle="Log in to keep tracking your games."><form onSubmit={submit} style={formStyle}><input name="email" type="email" required placeholder="Email" style={inputStyle} /><input name="password" type="password" required placeholder="Password" style={inputStyle} />{error && <p style={{ color: '#FF4D6A', margin: 0, fontSize: '0.84rem' }}>{error}</p>}<button disabled={busy} style={buttonStyle}>{busy ? 'Signing in...' : 'Log In'}</button><p style={footStyle}>New here? <Link href="/register" style={linkStyle}>Create an account</Link></p></form></AuthShell>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div style={{ minHeight: '80vh', background: 'var(--gl-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}><div style={{ width: '100%', maxWidth: 420, background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 16, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}><h1 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem' }}>{title}</h1><p style={{ margin: '0 0 24px', color: '#8888A0' }}>{subtitle}</p>{children}</div></div>; }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14 };
const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--gl-border)', borderRadius: 8, color: '#F0F0F5', padding: '12px 14px', outline: 'none' };
const buttonStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #6C63FF, #3B82F6)', border: 0, color: '#fff', cursor: 'pointer', fontWeight: 700 };
const footStyle: React.CSSProperties = { color: '#8888A0', margin: '8px 0 0', textAlign: 'center' };
const linkStyle: React.CSSProperties = { color: '#6C63FF', textDecoration: 'none', fontWeight: 700 };
