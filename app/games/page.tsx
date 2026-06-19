import { Suspense } from 'react';
import { BrowseView } from '@/components/pages/BrowseView';
import Loading from '@/app/loading';

export default function BrowsePage() {
  return (
    <Suspense fallback={<Loading />}>
      <BrowseView />
    </Suspense>
  );
}
