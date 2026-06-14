import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_upvote } = body

    if (typeof is_upvote !== 'boolean') {
      return NextResponse.json({ error: 'is_upvote boolean is required' }, { status: 400 })
    }

    try {
      await db.execute(
        sql`CALL toggle_thread_vote(${session.user.user_id}, ${id}::uuid, ${is_upvote})`
      )
      return NextResponse.json({ success: true, message: 'Vote recorded' })
    } catch (dbError: any) {
      console.error('DB Error in toggle_thread_vote:', dbError)
      return NextResponse.json({ error: dbError.message || 'Forbidden' }, { status: 403 })
    }
  } catch (error: any) {
    console.error('Error toggling vote:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
