import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { thread } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const treeNodes = await db.execute(sql`
      SELECT 
        gt.*,
        u.avatar_url
      FROM get_thread_tree(${id}::uuid) gt
      JOIN users u ON gt.user_id = u.user_id
      ORDER BY gt.created_at ASC
    `)

    if (treeNodes.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const buildTree = (nodes: any[], parentId: string | null, currentDepth: number): any[] => {
      return nodes
        .filter((n) => n.replying_to === parentId)
        .map((n) => ({
          ...n,
          vote_score: n.net_votes,
          depth: currentDepth,
          replies: buildTree(nodes, n.thread_id as string, currentDepth + 1)
        }))
    }

    const rootNode = treeNodes.find((n: any) => n.thread_id === id) as any
    if (!rootNode) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const result = {
      ...rootNode,
      vote_score: rootNode.net_votes,
      depth: 0,
      replies: buildTree(treeNodes as any[], rootNode.thread_id as string, 1)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching thread tree:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()

    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetThread = await db
      .select()
      .from(thread)
      .where(eq(thread.thread_id, id))
      .limit(1)

    if (targetThread.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    if (targetThread[0].user_id !== session.user.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.delete(thread).where(eq(thread.thread_id, id))

    return NextResponse.json({ success: true, message: 'Thread deleted' })
  } catch (error: any) {
    console.error('Error deleting thread:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
