import { NextResponse } from 'next/server'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { users } from '@/db/schema'
import { db } from '@/lib/db'

const registerSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(50, 'Username must be 50 characters or less'),
  email: z.string().trim().email('Invalid email address').max(100, 'Email must be 100 characters or less'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
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

    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid registration data',
        },
        { status: 400 },
      )
    }

    const { username, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existingUsers = await db
      .select({
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, normalizedEmail)))
      .limit(1)

    const existingUser = existingUsers[0]

    if (existingUser?.username === username) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken' },
        { status: 409 },
      )
    }

    if (existingUser?.email === normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const createdUsers = await db
      .insert(users)
      .values({
        username,
        email: normalizedEmail,
        password_hash: passwordHash,
      })
      .returning({
        user_id: users.user_id,
        username: users.username,
        email: users.email,
      })

    return NextResponse.json(
      {
        success: true,
        user: createdUsers[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Register error:', error)

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      const constraint = 'constraint_name' in error ? String(error.constraint_name) : ''
      const message = constraint.includes('username')
        ? 'Username is already taken'
        : constraint.includes('email')
          ? 'Email is already taken'
          : 'Username or email is already taken'

      return NextResponse.json(
        { success: false, error: message },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 },
    )
  }
}
