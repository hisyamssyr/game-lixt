import { Suspense } from 'react';
import { BrowseView } from '@/components/pages/BrowseView';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', color: '#8888A0', padding: 48 }}>Loading games...</div>}>
      <BrowseView />
    </Suspense>
  );
}
