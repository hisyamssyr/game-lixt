import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { toThread } from '@/lib/ui-data';
import { ThreadCard } from '@/components/ThreadCard';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ThreadsFeedPage() {
  const session = await getServerSession();
  const userId = session?.user?.user_id;

  // Fetch root threads directly
  let rawThreads: Record<string, unknown>[] = [];
  try {
    const res = await db.execute(sql`
      SELECT 
        t.thread_id, 
        t.user_id, 
        u.username, 
        u.avatar_url, 
        t.comment, 
        t.created_at, 
        count_thread_vote(t.thread_id) as vote_score,
        (SELECT COUNT(*) FROM thread r WHERE r.replying_to = t.thread_id) as reply_count
        ${userId ? sql`, EXISTS(SELECT 1 FROM thread_votes tv WHERE tv.thread_id = t.thread_id AND tv.user_id = ${userId}::uuid AND tv.vote_type = true) as has_upvoted` : sql`, false as has_upvoted`}
      FROM thread t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.replying_to IS NULL
      ORDER BY t.created_at DESC
    `);
    rawThreads = res;
  } catch (err) {
    console.error('Error fetching root threads:', err);
  }

  const threads = JSON.parse(JSON.stringify(rawThreads.map(toThread)));

  async function createThread(formData: FormData) {
    'use server';
    const comment = formData.get('comment') as string;
    const session = await getServerSession();
    if (!session?.user?.user_id || !comment || comment.trim() === '') return;
    
    await db.execute(
      sql`CALL create_thread_post(${session.user.user_id}, null, ${comment.trim()})`
    );
    
    revalidatePath('/threads');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', paddingTop: 64, position: 'relative' }}>
      {/* Decorative background glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1000, height: 400, background: 'radial-gradient(circle at top, rgba(108, 99, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontFamily: 'Space Grotesk, sans-serif', 
            color: '#fff', 
            margin: '0 0 16px', 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #FFF 0%, #B4B0FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 24px rgba(108, 99, 255, 0.3)'
          }}>
            Community
          </h1>
          <p style={{ color: '#8888A0', fontSize: '1.15rem', margin: 0, fontWeight: 400 }}>
            Join the conversation. Share your thoughts, ask questions, or just hang out.
          </p>
        </div>

        {/* Create Thread Box */}
        {session ? (
          <div style={{ 
            background: 'rgba(20, 20, 28, 0.6)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: 16, 
            padding: 24, 
            marginBottom: 48,
            boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)'
          }}>
            <form action={createThread}>
              <div style={{ 
                position: 'relative',
                borderRadius: 12,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(108, 99, 255, 0.2)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                padding: '2px',
                marginBottom: 20
              }}>
                <textarea 
                  name="comment"
                  placeholder="What's on your mind?"
                  required
                  style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    border: 'none', 
                    padding: '20px', 
                    color: '#F0F0F5', 
                    fontSize: '1.05rem', 
                    minHeight: 120, 
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: 1.5
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ 
                  background: 'linear-gradient(135deg, #6C63FF 0%, #8A84FF 100%)', 
                  color: '#fff', border: 'none', borderRadius: 8, 
                  padding: '12px 28px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(108, 99, 255, 0.4)'
                }}>
                  Post Thread
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: 32, marginBottom: 40, textAlign: 'center' }}>
            <p style={{ color: '#8888A0', fontSize: '1.05rem', margin: '0 0 16px' }}>Log in to join the conversation.</p>
            <a href="/login" style={{ display: 'inline-block', background: '#6C63FF', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600 }}>Log In</a>
          </div>
        )}

        {/* Threads Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {threads.length > 0 ? (
            threads.map((thread: any) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#8888A0' }}>
              <p>No threads yet. Be the first to start a conversation!</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
