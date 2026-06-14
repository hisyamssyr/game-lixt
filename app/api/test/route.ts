import { db } from '@/lib/db'
import { games } from '@/db/schema'

export async function GET() {
  try {
    const result = await db.select().from(games).limit(1)
    return Response.json({ success: true, data: result })
  } catch (err) {
    return Response.json({ success: false, error: String(err) })
  }
}