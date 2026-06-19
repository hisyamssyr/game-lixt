import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { thread } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const rootThreads = await db.execute(sql`
      SELECT 
        t.thread_id, 
        t.user_id, 
        u.username, 
        u.avatar_url, 
        t.comment, 
        t.created_at, 
        count_thread_vote(t.thread_id) as vote_score,
        (SELECT COUNT(*) FROM thread r WHERE r.replying_to = t.thread_id) as reply_count
      FROM thread t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.replying_to IS NULL
      ORDER BY t.created_at DESC
    `)

    return NextResponse.json(rootThreads)
  } catch (error: any) {
    console.error('Error fetching threads:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { comment, replying_to } = body

    if (!comment) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    try {
      await db.insert(thread).values({
        user_id: session.user.user_id,
        replying_to: replying_to || null,
        comment: comment
      });
      revalidatePath('/threads');
      if (replying_to) revalidatePath(`/threads/${replying_to}`);
      
      return NextResponse.json({ success: true, message: 'Thread posted' }, { status: 201 })
    } catch (dbError: any) {
      console.error('DB Error in create_thread_post:', dbError)
      return NextResponse.json({ error: 'Parent thread not found or database error' }, { status: 404 })
    }
  } catch (error: any) {
    console.error('Error creating thread:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
