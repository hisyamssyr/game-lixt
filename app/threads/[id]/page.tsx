import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql, eq } from 'drizzle-orm';
import { thread } from '@/db/schema';
import { toThread } from '@/lib/ui-data';
import { ThreadCard } from '@/components/ThreadCard';
import { CreateThreadForm } from '@/components/forms/CreateThreadForm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ForumThread } from '@/types/app';

// Flattened replies don't need a recursive ThreadNode component.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();
  const userId = session?.user?.user_id;

  // Verify the thread exists and is a root thread
  const rootCheck = await db.select().from(thread).where(eq(thread.thread_id, id)).limit(1);
  if (rootCheck.length === 0 || rootCheck[0].replying_to !== null) {
    redirect('/threads');
  }

  // Fetch thread tree
  let rootNode = null;
  let replies = [];

  try {
    const treeNodes = await db.execute(sql`
      SELECT 
        gt.*,
        u.avatar_url,
        ${userId ? sql`EXISTS(SELECT 1 FROM thread_votes tv WHERE tv.thread_id = gt.thread_id AND tv.user_id = ${userId}::uuid AND tv.vote_type = true) as has_upvoted` : sql`false as has_upvoted`}
      FROM get_thread_tree(${id}::uuid) gt
      JOIN users u ON gt.user_id = u.user_id
      ORDER BY gt.created_at ASC
    `);

    const idToUsername: Record<string, string> = {};
    treeNodes.forEach((n: any) => {
      idToUsername[n.thread_id] = n.username;
    });

    // @ts-ignore
    const rawRoot = treeNodes.find(n => n.thread_id === id);
    if (rawRoot) {
      const flatReplies = treeNodes
        .filter((n: any) => n.thread_id !== id)
        .map((n: any) => {
          const t = toThread(n);
          return {
            ...t,
            replyingToUsername: n.replying_to && n.replying_to !== id ? idToUsername[n.replying_to] : null,
          };
        });

      rootNode = {
        ...toThread(rawRoot),
        depth: 0,
        replies: flatReplies
      };
    }
  } catch (err) {
    console.error('Error fetching thread detail:', err);
  }

  if (!rootNode) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', paddingTop: 100, textAlign: 'center', color: '#F0F0F5' }}>
        <h2>Thread not found</h2>
      </div>
    );
  }

  const safeRootThread = JSON.parse(JSON.stringify(rootNode));

  const totalReplies = safeRootThread.replies ? safeRootThread.replies.length : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gl-bg-base)', paddingTop: 64 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        
        {/* Root Thread */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ThreadCard thread={safeRootThread} isDetailView={false} />
        </div>
        
        <div style={{ 
          height: 2, 
          background: 'linear-gradient(90deg, transparent 0%, rgba(108, 99, 255, 0.6) 50%, transparent 100%)', 
          margin: '48px 0',
          boxShadow: '0 0 16px rgba(108, 99, 255, 0.4)'
        }} />

        {/* Nested Replies Section */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'Space Grotesk, sans-serif', color: '#F0F0F5', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            Replies 
            <span style={{ fontSize: '0.9rem', background: 'rgba(108, 99, 255, 0.2)', color: '#8A84FF', padding: '4px 12px', borderRadius: 20 }}>
              {totalReplies}
            </span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {safeRootThread.replies && safeRootThread.replies.length > 0 ? (
              safeRootThread.replies.map((reply: any) => (
                <ThreadCard key={reply.id} thread={reply} isDetailView={true} />
              ))
            ) : (
              <p style={{ color: '#8888A0', fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 24, textAlign: 'center', padding: '40px 0' }}>
                No replies yet. Be the first to join the conversation!
              </p>
            )}
          </div>
        </div>

        {/* Standalone Reply Box to Root Thread */}
        {session ? (
          <div style={{ 
            background: 'rgba(20, 20, 28, 0.6)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: 16, 
            padding: 24, 
            marginTop: 48,
            boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)'
          }}>
            <CreateThreadForm replyingTo={id} placeholder="Write a direct reply to the original post..." />
          </div>
        ) : (
          <div style={{ background: 'var(--gl-bg-surface)', border: '1px solid var(--gl-border)', borderRadius: 12, padding: 24, marginTop: 40, textAlign: 'center' }}>
            <p style={{ color: '#8888A0', fontSize: '1.05rem', margin: '0 0 16px' }}>Log in to reply.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
