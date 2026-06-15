import { NextRequest, NextResponse } from 'next/server'
import { eq, ne, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, avatar_url } = await req.json()

    if (!username || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check uniqueness
    const existingUser = await db
      .select({ user_id: users.user_id })
      .from(users)
      .where(
        and(
          eq(users.username, username.trim()),
          ne(users.user_id, session.user.user_id)
        )
      )
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // Update
    await db
      .update(users)
      .set({
        username: username.trim(),
        avatar_url: avatar_url || null,
      })
      .where(eq(users.user_id, session.user.user_id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
