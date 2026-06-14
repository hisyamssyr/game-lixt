import { NextRequest, NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { list, users, list_items } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('user_id')

    let baseQuery = db
      .select({
        list_id: list.list_id,
        title: list.title,
        description: list.description,
        list_cover_url: list.list_cover_url,
        created_at: list.created_at,
        username: users.username,
        vote_score: sql<number>`count_list_vote(${list.list_id})`.as('vote_score'),
        game_count: sql<number>`CAST(COUNT(${list_items.item_id}) AS INTEGER)`.as('game_count')
      })
      .from(list)
      .innerJoin(users, eq(list.user_id, users.user_id))
      .leftJoin(list_items, eq(list.list_id, list_items.list_id))
      .groupBy(list.list_id, users.username)
      .orderBy(desc(list.created_at))

    if (userId) {
      // @ts-ignore
      baseQuery = baseQuery.where(eq(list.user_id, userId))
    }

    const lists = await baseQuery

    return NextResponse.json(lists)
  } catch (error: any) {
    console.error('Error fetching lists:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, list_cover_url } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL create_new_list(${userId}::uuid, ${title}::varchar, ${description || null}::text, ${list_cover_url || null}::varchar)`
    )

    return NextResponse.json({ success: true, message: 'List created' })
  } catch (error: any) {
    console.error('Error creating list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create list' },
      { status: 400 }
    )
  }
}
