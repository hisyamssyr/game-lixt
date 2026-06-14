import { type DefaultSession } from 'next-auth'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      user_id: string
      username: string
      avatar_url?: string | null
    }
  }

  interface User {
    user_id: string
    username: string
    avatar_url?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user_id: string
    username: string
    avatar_url?: string | null
  }
}
