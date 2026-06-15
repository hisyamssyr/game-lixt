import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql, eq } from 'drizzle-orm';
import { thread } from '@/db/schema';
import { toThread } from '@/lib/ui-data';
import { ThreadCard } from '@/components/ThreadCard';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ForumThread } from '@/types/app';

function ThreadNode({ threadNode }: { threadNode: ForumThread }) {
  return (
    <div style={{ marginBottom: threadNode.depth === 0 ? 0 : 16, position: 'relative' }}>
      <ThreadCard thread={threadNode} isDetailView={true} />
      
      {threadNode.replies && threadNode.replies.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          marginLeft: 24, 
          paddingLeft: 24, 
          borderLeft: '2px solid rgba(108, 99, 255, 0.2)',
          position: 'relative'
        }}>
          {threadNode.replies.map(child => (
            <ThreadNode key={child.id} threadNode={child} />
          ))}
        </div>
      )}
    </div>
  );
}

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

    const buildTree = (nodes: any[], parentId: string | null, currentDepth: number): any[] => {
      return nodes
        .filter((n) => n.replying_to === parentId)
        .map((n) => ({
          ...toThread(n),
          depth: currentDepth,
          replies: buildTree(nodes, n.thread_id as string, currentDepth + 1)
        }))
    }

    // @ts-ignore
    const rawRoot = treeNodes.find(n => n.thread_id === id);
    if (rawRoot) {
      rootNode = {
        ...toThread(rawRoot),
        depth: 0,
        replies: buildTree(treeNodes as any[], rawRoot.thread_id as string, 1)
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

  // Count total descendants for the UI
  const countDescendants = (node: any): number => {
    if (!node.replies) return 0;
    return node.replies.length + node.replies.reduce((sum: number, child: any) => sum + countDescendants(child), 0);
  };
  const totalReplies = countDescendants(safeRootThread);

  async function postRootReply(formData: FormData) {
    'use server';
    const comment = formData.get('comment') as string;
    const session = await getServerSession();
    if (!session?.user?.user_id || !comment || comment.trim() === '') return;
    
    await db.execute(
      sql`CALL create_thread_post(${session.user.user_id}, ${id}::uuid, ${comment.trim()})`
    );
    
    revalidatePath(`/threads/${id}`);
  }

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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {safeRootThread.replies && safeRootThread.replies.length > 0 ? (
              safeRootThread.replies.map((reply: any) => (
                <ThreadNode key={reply.id} threadNode={reply} />
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
            <form action={postRootReply}>
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
                  placeholder="Write a direct reply to the original post..."
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
                  Post Reply
                </button>
              </div>
            </form>
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
