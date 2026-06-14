import { NextRequest } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { user_library, games } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

const VALID_STATUSES = ['Playing', 'Completed', 'Dropped', 'Plan to Play'] as const
type PlayStatus = (typeof VALID_STATUSES)[number]

// ---------------------------------------------------------------------------
// GET /api/library
// Returns the authenticated user's library, optionally filtered by status.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.user_id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.user_id

  // Optional ?status= query param
  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')

  if (statusParam && !VALID_STATUSES.includes(statusParam as PlayStatus)) {
    return Response.json(
      {
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  try {
    // Build the WHERE conditions
    const conditions = [eq(user_library.user_id, userId)]
    if (statusParam) {
      conditions.push(eq(user_library.play_status, statusParam))
    }

    const entries = await db
      .select({
        library_id: user_library.library_id,
        game_id: user_library.game_id,
        title: games.title,
        cover_url: games.cover_url,
        average_rating: games.average_rating,
        play_status: user_library.play_status,
        added_at: user_library.added_at,
      })
      .from(user_library)
      .innerJoin(games, eq(user_library.game_id, games.game_id))
      .where(and(...conditions))
      .orderBy(user_library.added_at)

    return Response.json({ success: true, data: entries })
  } catch (err) {
    console.error('[GET /api/library]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/library
// Calls the stored procedure upsert_user_library to add or update an entry.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.user_id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.user_id

  let body: { game_id?: string; play_status?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { game_id, play_status } = body

  if (!game_id || !play_status) {
    return Response.json(
      { error: 'game_id and play_status are required' },
      { status: 400 }
    )
  }

  if (!VALID_STATUSES.includes(play_status as PlayStatus)) {
    return Response.json(
      {
        error: `Invalid play_status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  try {
    // Call the stored procedure — let the DB handle insert-or-update logic
    await db.execute(
      sql`CALL upsert_user_library(${userId}::uuid, ${game_id}::uuid, ${play_status}::varchar)`
    )

    return Response.json({ success: true, message: 'Library updated' })
  } catch (err: unknown) {
    console.error('[POST /api/library]', err)

    // Surface DB-level errors (invalid status, spam trigger, etc.) as 400
    const message =
      err instanceof Error ? err.message : 'Failed to update library'
    return Response.json({ error: message }, { status: 400 })
  }
}
