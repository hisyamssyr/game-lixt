import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { genres } from '@/db/schema'

export async function GET() {
  try {
    const allGenres = await db
      .select({
        genre_id: genres.genre_id,
        genre_name: genres.genre_name,
        description: genres.description,
      })
      .from(genres)
      .orderBy(asc(genres.genre_name))

    return NextResponse.json(allGenres)
  } catch (error: any) {
    console.error('Error fetching genres:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
