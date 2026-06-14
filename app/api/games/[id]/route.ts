import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { achievements, game_genres, games, genres } from '@/db/schema'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    const gameRows = await db
      .select()
      .from(games)
      .where(eq(games.game_id, id))
      .limit(1)

    const game = gameRows[0]

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 },
      )
    }

    const [genreRows, achievementRows] = await Promise.all([
      db
        .select({
          genre_id: genres.genre_id,
          genre_name: genres.genre_name,
        })
        .from(game_genres)
        .innerJoin(genres, eq(game_genres.genre_id, genres.genre_id))
        .where(eq(game_genres.game_id, id)),
      db
        .select({
          achievement_id: achievements.achievement_id,
          achievement_name: achievements.achievement_name,
          description: achievements.description,
        })
        .from(achievements)
        .where(eq(achievements.game_id, id)),
    ])

    return NextResponse.json({
      success: true,
      game: {
        ...game,
        genres: genreRows,
        achievements: achievementRows,
      },
    })
  } catch (error) {
    console.error('Get game detail error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const existingGame = await db.select().from(games).where(eq(games.game_id, id)).limit(1)
    if (!existingGame.length) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }

    await db.delete(games).where(eq(games.game_id, id))

    return NextResponse.json({ success: true, message: 'Game deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete game error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete game' }, { status: 500 })
  }
}
