import { NextRequest, NextResponse } from 'next/server'
import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, user_library, reviews, list, user_achievements } from '@/db/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const targetUser = await db
      .select({
        user_id: users.user_id,
        username: users.username,
        join_date: users.join_date,
        avatar_url: users.avatar_url,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (targetUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = targetUser[0].user_id

    // Use separate Drizzle count queries and merge in JavaScript
    const [gameCountResult, reviewCountResult, listCountResult, achievementCountResult] = await Promise.all([
      db.select({ value: count() }).from(user_library).where(eq(user_library.user_id, userId)),
      db.select({ value: count() }).from(reviews).where(eq(reviews.user_id, userId)),
      db.select({ value: count() }).from(list).where(eq(list.user_id, userId)),
      db.select({ value: count() }).from(user_achievements).where(eq(user_achievements.user_id, userId)),
    ])

    const response = {
      ...targetUser[0],
      stats: {
        game_count: gameCountResult[0].value,
        review_count: reviewCountResult[0].value,
        list_count: listCountResult[0].value,
        achievement_count: achievementCountResult[0].value,
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
