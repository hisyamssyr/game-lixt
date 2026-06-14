import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reviewId } = await params
    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    const { rating, review_text } = await req.json()

    if (rating === undefined && !review_text) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL edit_review(${userId}::uuid, ${reviewId}::uuid, ${rating}::numeric, ${review_text}::text)`
    )

    return NextResponse.json({ success: true, message: 'Review updated' })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 403 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reviewId } = await params
    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL delete_review(${userId}::uuid, ${reviewId}::uuid)`
    )

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 403 }
    )
  }
}
