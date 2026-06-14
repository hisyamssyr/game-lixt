import { getServerSession as nextAuthGetServerSession, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { users } from '@/db/schema'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const existingUsers = await db
          .select({
            user_id: users.user_id,
            username: users.username,
            email: users.email,
            password_hash: users.password_hash,
            avatar_url: users.avatar_url,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        const user = existingUsers[0]

        if (!user) {
          return null
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash)

        if (!passwordMatches) {
          return null
        }

        return {
          id: user.user_id,
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user_id = user.user_id
        token.username = user.username
        token.avatar_url = user.avatar_url
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.user_id = token.user_id
        session.user.username = token.username
        session.user.avatar_url = token.avatar_url
      }

      return session
    },
  },
}

export function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}
