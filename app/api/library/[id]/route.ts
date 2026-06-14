import { NextRequest } from 'next/server'
import { eq, and } from 'drizzle-orm'

import { db } from '@/lib/db'
import { user_library } from '@/db/schema'
import { getServerSession } from '@/lib/auth'

// ---------------------------------------------------------------------------
// DELETE /api/library/[id]
// Deletes a library entry that belongs to the authenticated user.
// ---------------------------------------------------------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()

  if (!session?.user?.user_id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.user_id
  const { id: libraryId } = await params

  try {
    // Fetch the entry first so we can verify ownership
    const entries = await db
      .select({
        library_id: user_library.library_id,
        user_id: user_library.user_id,
      })
      .from(user_library)
      .where(eq(user_library.library_id, libraryId))
      .limit(1)

    const entry = entries[0]

    if (!entry) {
      return Response.json({ error: 'Library entry not found' }, { status: 404 })
    }

    if (entry.user_id !== userId) {
      return Response.json(
        { error: 'Forbidden: you do not own this library entry' },
        { status: 403 }
      )
    }

    // Safe to delete — user_id matches
    await db
      .delete(user_library)
      .where(and(eq(user_library.library_id, libraryId), eq(user_library.user_id, userId)))

    return Response.json({ success: true, message: 'Game removed from library' })
  } catch (err) {
    console.error('[DELETE /api/library/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
