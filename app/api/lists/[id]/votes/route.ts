import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listId } = await params
    const { is_upvote } = await req.json()

    if (typeof is_upvote !== 'boolean') {
      return NextResponse.json({ error: 'is_upvote boolean is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL toggle_list_vote(${userId}::uuid, ${listId}::uuid, ${is_upvote}::boolean)`
    )

    return NextResponse.json({ success: true, message: 'Vote recorded' })
  } catch (error: any) {
    console.error('Error voting on list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record vote' },
      { status: 403 }
    )
  }
}
