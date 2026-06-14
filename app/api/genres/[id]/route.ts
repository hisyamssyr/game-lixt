import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { genres } from '@/db/schema'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const existingGenre = await db.select().from(genres).where(eq(genres.genre_id, id)).limit(1)
    if (!existingGenre.length) {
      return NextResponse.json({ success: false, error: 'Genre not found' }, { status: 404 })
    }

    await db.delete(genres).where(eq(genres.genre_id, id))

    return NextResponse.json({ success: true, message: 'Genre deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Delete genre error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete genre' }, { status: 500 })
  }
}
