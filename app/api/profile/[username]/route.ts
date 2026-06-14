import { NextRequest, NextResponse } from 'next/server'
import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { list as userLists, reviews, user_achievements, user_library, users } from '@/db/schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const [user] = await db
      .select({
        user_id: users.user_id,
        username: users.username,
        join_date: users.join_date,
        avatar_url: users.avatar_url,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const [{ count: game_count }] = await db
      .select({ count: count() })
      .from(user_library)
      .where(eq(user_library.user_id, user.user_id))

    const [{ count: review_count }] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.user_id, user.user_id))

    const [{ count: list_count }] = await db
      .select({ count: count() })
      .from(userLists)
      .where(eq(userLists.user_id, user.user_id))

    const [{ count: achievement_count }] = await db
      .select({ count: count() })
      .from(user_achievements)
      .where(eq(user_achievements.user_id, user.user_id))

    return NextResponse.json({
      ...user,
      stats: {
        game_count,
        review_count,
        list_count,
        achievement_count,
      },
    })
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
