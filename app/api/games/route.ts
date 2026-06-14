import { NextResponse } from 'next/server'
import { and, asc, desc, eq, ilike, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { game_genres, games, genres } from '@/db/schema'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

const sortValues = ['rating', 'release_date', 'title'] as const

const createGameSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
  developer: z.string().trim().max(100, 'Developer must be 100 characters or less').optional().nullable(),
  release_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must use YYYY-MM-DD format')
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  cover_url: z.string().trim().max(255, 'Cover URL must be 255 characters or less').optional().nullable(),
  genre_ids: z.array(z.string().uuid('Invalid genre id')).optional().default([]),
})

function parsePaginationParam(value: string | null, defaultValue: number) {
  if (!value) {
    return defaultValue
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultValue
}

function getSortExpression(sort: (typeof sortValues)[number]) {
  if (sort === 'release_date') {
    return desc(games.release_date)
  }

  if (sort === 'title') {
    return asc(games.title)
  }

  return desc(games.average_rating)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const genre = searchParams.get('genre')?.trim()
    const requestedSort = searchParams.get('sort')
    const sort = sortValues.includes(requestedSort as (typeof sortValues)[number])
      ? (requestedSort as (typeof sortValues)[number])
      : 'rating'
    const limit = Math.min(parsePaginationParam(searchParams.get('limit'), 20), 100)
    const offset = parsePaginationParam(searchParams.get('offset'), 0)

    const filters = []

    if (search) {
      filters.push(ilike(games.title, `%${search}%`))
    }

    if (genre) {
      filters.push(eq(genres.genre_name, genre))
    }

    const selectedGameFields = {
      game_id: games.game_id,
      title: games.title,
      developer: games.developer,
      release_date: games.release_date,
      average_rating: games.average_rating,
      cover_url: games.cover_url,
    }

    const gameRows = genre
      ? await db
          .selectDistinct(selectedGameFields)
          .from(games)
          .innerJoin(game_genres, eq(games.game_id, game_genres.game_id))
          .innerJoin(genres, eq(game_genres.genre_id, genres.genre_id))
          .where(filters.length > 0 ? and(...filters) : undefined)
          .orderBy(getSortExpression(sort))
          .limit(limit)
          .offset(offset)
      : await db
          .select(selectedGameFields)
          .from(games)
          .where(filters.length > 0 ? and(...filters) : undefined)
          .orderBy(getSortExpression(sort))
          .limit(limit)
          .offset(offset)

    const gameIds = gameRows.map((game) => game.game_id)
    const genreRows = gameIds.length
      ? await db
          .select({
            game_id: game_genres.game_id,
            genre_name: genres.genre_name,
          })
          .from(game_genres)
          .innerJoin(genres, eq(game_genres.genre_id, genres.genre_id))
          .where(inArray(game_genres.game_id, gameIds))
      : []

    const genresByGameId = new Map<string, string[]>()

    for (const row of genreRows) {
      const existingGenres = genresByGameId.get(row.game_id) ?? []
      existingGenres.push(row.genre_name)
      genresByGameId.set(row.game_id, existingGenres)
    }

    return NextResponse.json({
      success: true,
      games: gameRows.map((game) => ({
        ...game,
        genres: genresByGameId.get(game.game_id) ?? [],
      })),
      pagination: {
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get games error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const parsed = createGameSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid game data',
        },
        { status: 400 },
      )
    }

    const { genre_ids, ...gameData } = parsed.data

    const createdGame = await db.transaction(async (tx) => {
      const [game] = await tx
        .insert(games)
        .values({
          title: gameData.title,
          developer: gameData.developer ?? null,
          release_date: gameData.release_date ?? null,
          description: gameData.description ?? null,
          cover_url: gameData.cover_url ?? null,
        })
        .returning({
          game_id: games.game_id,
          title: games.title,
        })

      if (genre_ids.length > 0) {
        await tx.insert(game_genres).values(
          genre_ids.map((genreId) => ({
            game_id: game.game_id,
            genre_id: genreId,
          })),
        )
      }

      return game
    })

    return NextResponse.json(
      {
        success: true,
        game: createdGame,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Create game error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 },
    )
  }
}
