import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { users } from '@/db/schema'
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

    if (session.user.user_id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const existingUser = await db.select().from(users).where(eq(users.user_id, id)).limit(1)
    if (!existingUser.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    await db.delete(users).where(eq(users.user_id, id))

    return NextResponse.json({ success: true, message: 'Account deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}
