import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { genres } from '@/db/schema'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const allGenres = await db
      .select()
      .from(genres)
      .orderBy(asc(genres.genre_name))

    return NextResponse.json(allGenres)
  } catch (error) {
    console.error('Fetch genres error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch genres' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { genre_name, description } = body

    if (!genre_name) {
      return NextResponse.json({ success: false, error: 'genre_name is required' }, { status: 400 })
    }

    const newGenre = await db.insert(genres).values({
      genre_name,
      description,
    }).returning({
      genre_id: genres.genre_id,
      genre_name: genres.genre_name,
      description: genres.description,
    })

    return NextResponse.json({
      success: true,
      genre: newGenre[0],
    }, { status: 201 })
  } catch (error) {
    console.error('Create genre error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create genre' }, { status: 500 })
  }
}
