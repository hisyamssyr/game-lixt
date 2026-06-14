'use client';

import { useState } from 'react';
import { BookOpen, List, Star } from 'lucide-react';

const tabs = [
  { key: 'library', label: 'Library', icon: BookOpen, empty: 'Library items will appear here.' },
  { key: 'reviews', label: 'Reviews', icon: Star, empty: 'Reviews will appear here.' },
  { key: 'lists', label: 'Lists', icon: List, empty: 'Curated lists will appear here.' },
] as const;

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('library');
  const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const ActiveIcon = active.icon;

  return (
    <div>
      <div style={{ background: 'var(--gl-bg-surface)', borderBottom: '1px solid var(--gl-border)', borderTop: '1px solid var(--gl-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, padding: '0 24px', overflowX: 'auto' }}>
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
        <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: '56px 24px', textAlign: 'center', color: '#8888A0' }}>
          <ActiveIcon size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.45 }} />
          <h2 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem' }}>{active.label}</h2>
          <p style={{ margin: 0, fontSize: '0.86rem' }}>{active.empty}</p>
        </div>
      </div>
    </div>
  );
}
