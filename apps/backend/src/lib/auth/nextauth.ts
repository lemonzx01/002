/**
 * ============================================================
 * NextAuth Configuration
 * ============================================================
 */

import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

// Mock users for development
const mockUsers = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User'
  }
]

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        // Check mock users
        const user = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
        
        return null
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
