import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const res = await db.execute(sql`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'count_list_vote'`);
    return NextResponse.json({ def: res[0]?.pg_get_functiondef });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
