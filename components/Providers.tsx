'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { GameStatus } from '@/types/app';
import { toast } from 'sonner';

interface LibraryContextType {
  library: Record<string, GameStatus>;
  addToLibrary: (gameId: string, status: GameStatus | null) => Promise<void>;
  loading: boolean;
}

const LibraryContext = createContext<LibraryContextType>({ library: {}, addToLibrary: async () => {}, loading: true });

export function useLibrary() {
  return useContext(LibraryContext);
}

function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [library, setLibrary] = useState<Record<string, GameStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setLibrary({});
      setLoading(false);
      return;
    }
    fetch('/api/library').then(res => res.json()).then(data => {
      if (data.success) {
        const lib: Record<string, GameStatus> = {};
        data.data.forEach((entry: any) => {
          let st = entry.play_status.toLowerCase().replaceAll(' ', '_');
          if (st === 'playing' || st === 'completed' || st === 'plan_to_play' || st === 'dropped') {
            lib[entry.game_id] = st as GameStatus;
          }
        });
        setLibrary(lib);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [session]);

  const addToLibrary = async (gameId: string, status: GameStatus | null) => {
    if (!session?.user) {
      toast.error('You must be logged in to do that');
      return;
    }

    if (status === null) {
      const prev = { ...library };
      const newLib = { ...library };
      delete newLib[gameId];
      setLibrary(newLib);
      
      try {
        const res = await fetch('/api/library', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_id: gameId })
        });
        if (!res.ok) throw new Error('Failed');
        toast.success('Removed from library');
      } catch {
        setLibrary(prev);
        toast.error('Failed to remove from library');
      }
      return;
    }

    const apiStatusMap: Record<GameStatus, string> = {
      'playing': 'Playing',
      'completed': 'Completed',
      'plan_to_play': 'Plan to Play',
      'dropped': 'Dropped'
    };
    
    const prev = { ...library };
    setLibrary({ ...library, [gameId]: status });
    
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, play_status: apiStatusMap[status] })
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Marked as ${apiStatusMap[status]}`);
    } catch {
      setLibrary(prev);
      toast.error('Failed to update library');
    }
  };

  return <LibraryContext.Provider value={{ library, addToLibrary, loading }}>{children}</LibraryContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LibraryProvider>{children}</LibraryProvider>
    </SessionProvider>
  );
}
