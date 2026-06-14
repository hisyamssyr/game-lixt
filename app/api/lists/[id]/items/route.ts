import { NextRequest, NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { list_items } from '@/db/schema'
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
    const { game_id } = await req.json()

    if (!game_id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    const [existingItem] = await db
      .select({ item_id: list_items.item_id })
      .from(list_items)
      .where(and(eq(list_items.list_id, listId), eq(list_items.game_id, game_id)))
      .limit(1)

    if (existingItem) {
      return NextResponse.json({ error: 'Game already exists in this list' }, { status: 409 })
    }

    await db.execute(
      sql`CALL add_game_to_list(${userId}::uuid, ${listId}::uuid, ${game_id}::uuid)`
    )

    return NextResponse.json({ success: true, message: 'Game added to list' })
  } catch (error: unknown) {
    console.error('Error adding game to list:', error)
    // Map Drizzle constraint violation or custom exception to appropriate status
    const message = error instanceof Error ? error.message : 'Failed to add game'
    const errorMessage = message.toLowerCase()
    const status = errorMessage.includes('already exists') || errorMessage.includes('duplicate') ? 409 : 403
    return NextResponse.json(
      { error: message },
      { status }
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
    const { game_id } = await req.json()

    if (!game_id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL remove_game_from_list(${userId}::uuid, ${listId}::uuid, ${game_id}::uuid)`
    )

    return NextResponse.json({ success: true, message: 'Game removed from list' })
  } catch (error: unknown) {
    console.error('Error removing game from list:', error)
    const message = error instanceof Error ? error.message : 'Failed to remove game'
    return NextResponse.json(
      { error: message },
      { status: 403 }
    )
  }
}
