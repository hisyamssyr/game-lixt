import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { review_votes } from '@/db/schema'
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

    const { id: reviewId } = await params
    const { vote_type } = await req.json()

    if (vote_type !== 'up' && vote_type !== 'down') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    const userId = session.user.user_id
    const isUpvote = vote_type === 'up'

    // Check if vote already exists
    const existingVote = await db
      .select()
      .from(review_votes)
      .where(and(eq(review_votes.review_id, reviewId), eq(review_votes.user_id, userId)))
      .limit(1)

    if (existingVote.length > 0) {
      if (existingVote[0].vote_type === isUpvote) {
        // Toggle off
        await db
          .delete(review_votes)
          .where(and(eq(review_votes.review_id, reviewId), eq(review_votes.user_id, userId)))
        
        return NextResponse.json({ success: true, message: 'Vote removed' })
      } else {
        // Change vote
        await db
          .update(review_votes)
          .set({ vote_type: isUpvote })
          .where(and(eq(review_votes.review_id, reviewId), eq(review_votes.user_id, userId)))
        
        return NextResponse.json({ success: true, message: 'Vote updated' })
      }
    } else {
      // New vote
      await db
        .insert(review_votes)
        .values({
          review_id: reviewId,
          user_id: userId,
          vote_type: isUpvote,
        })
      
      return NextResponse.json({ success: true, message: 'Vote added' })
    }
  } catch (error: any) {
    console.error('Error voting on review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to vote' },
      { status: 500 }
    )
  }
}
