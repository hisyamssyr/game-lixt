import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reviews, users } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const gameId = searchParams.get('game_id')

    if (!gameId) {
      return NextResponse.json({ error: 'game_id is required' }, { status: 400 })
    }

    const session = await getServerSession()
    const currentUserId = session?.user?.user_id || '00000000-0000-0000-0000-000000000000'

    const gameReviews = await db
      .select({
        review_id: reviews.review_id,
        user_id: reviews.user_id,
        username: users.username,
        avatar_url: users.avatar_url,
        rating: reviews.rating,
        review_text: reviews.review_text,
        created_at: reviews.created_at,
        updated_at: reviews.updated_at,
        upvotes: sql<number>`(SELECT count(*) FROM review_votes WHERE review_id = ${reviews.review_id} AND vote_type = true)::integer`.as('upvotes'),
        downvotes: sql<number>`(SELECT count(*) FROM review_votes WHERE review_id = ${reviews.review_id} AND vote_type = false)::integer`.as('downvotes'),
        userVote: sql<boolean | null>`(SELECT vote_type FROM review_votes WHERE review_id = ${reviews.review_id} AND user_id = ${currentUserId}::uuid LIMIT 1)`.as('userVote'),
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.user_id))
      .where(eq(reviews.game_id, gameId))
      .orderBy(desc(reviews.created_at))

    return NextResponse.json(gameReviews)
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { game_id, rating, review_text } = await req.json()

    if (!game_id || rating === undefined || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL add_game_review(${userId}::uuid, ${game_id}::uuid, ${rating}::numeric, ${review_text}::text)`
    )

    return NextResponse.json({ success: true, message: 'Review added' })
  } catch (error: any) {
    console.error('Error adding review:', error)
    // The database procedure will throw an error if the user hasn't added the game or already reviewed it
    return NextResponse.json(
      { error: error.message || 'Failed to add review' },
      { status: 400 }
    )
  }
}
