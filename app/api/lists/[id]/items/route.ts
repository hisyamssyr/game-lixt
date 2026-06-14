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
    const { game_id } = await req.json()

    if (!game_id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const userId = session.user.user_id

    await db.execute(
      sql`CALL add_game_to_list(${userId}::uuid, ${listId}::uuid, ${game_id}::uuid)`
    )

    return NextResponse.json({ success: true, message: 'Game added to list' })
  } catch (error: any) {
    console.error('Error adding game to list:', error)
    // Map Drizzle constraint violation or custom exception to appropriate status
    const status = error.message?.includes('already') || error.code === '23505' ? 409 : 403
    return NextResponse.json(
      { error: error.message || 'Failed to add game' },
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
  } catch (error: any) {
    console.error('Error removing game from list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove game' },
      { status: 403 }
    )
  }
}
