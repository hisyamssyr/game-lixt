import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { list, users, list_items, games } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await params

    const listDetails = await db
      .select({
        list_id: list.list_id,
        title: list.title,
        description: list.description,
        list_cover_url: list.list_cover_url,
        created_at: list.created_at,
        owner: {
          username: users.username,
          avatar_url: users.avatar_url,
        },
        vote_score: sql<number>`count_list_vote(${list.list_id})`.as('vote_score'),
      })
      .from(list)
      .innerJoin(users, eq(list.user_id, users.user_id))
      .where(eq(list.list_id, listId))
      .limit(1)

    if (listDetails.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const items = await db
      .select({
        item_id: list_items.item_id,
        game_id: list_items.game_id,
        title: games.title,
        cover_url: games.cover_url,
        added_at: list_items.added_at,
      })
      .from(list_items)
      .innerJoin(games, eq(list_items.game_id, games.game_id))
      .where(eq(list_items.list_id, listId))

    return NextResponse.json({
      ...listDetails[0],
      items,
    })
  } catch (error: any) {
    console.error('Error fetching list details:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listId } = await params
    const { title, description, list_cover_url } = await req.json()

    if (!title && description === undefined && list_cover_url === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const userId = session.user.user_id

    const safeTitle = title ?? null;
    const safeDesc = description ?? null;
    const safeCoverUrl = list_cover_url ?? null;

    await db.execute(
      sql`CALL edit_list_details(${userId}::uuid, ${listId}::uuid, ${safeTitle}::varchar, ${safeDesc}::text, ${safeCoverUrl}::varchar)`
    )

    return NextResponse.json({ success: true, message: 'List updated' })
  } catch (error: any) {
    console.error('Error updating list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update list' },
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

    const { id: listId } = await params
    const userId = session.user.user_id

    // Manually validate ownership
    const targetList = await db
      .select({ user_id: list.user_id })
      .from(list)
      .where(eq(list.list_id, listId))
      .limit(1)

    if (targetList.length === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (targetList[0].user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this list' }, { status: 403 })
    }

    await db.delete(list).where(eq(list.list_id, listId))

    return NextResponse.json({ success: true, message: 'List deleted' })
  } catch (error: any) {
    console.error('Error deleting list:', error)
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}
