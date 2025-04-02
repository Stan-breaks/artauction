import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './db'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable')
}

export interface TokenPayload {
  userId: string
  name: string
  email: string
  role: 'USER' | 'ARTIST' | 'ADMIN'
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as any
    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '7d' })
}

export function getTokenFromCookies(): string | undefined {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value
}

export function parseCookieString(cookieString?: string | null): { [key: string]: string } {
  if (!cookieString) return {}
  return cookieString.split(';')
    .reduce((acc: { [key: string]: string }, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = value
      return acc
    }, {})
}

export async function getUserFromToken(request?: Request): Promise<TokenPayload | null> {
  try {
    let token: string | undefined

    if (request) {
      // For API routes, get token from cookie header
      const cookieHeader = request.headers.get('cookie')
      const cookies = parseCookieString(cookieHeader)
      token = cookies['token']
    } else {
      // For server components, use the cookies() API
      token = getTokenFromCookies()
    }

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        try {
          await connectToDatabase();
          const { User } = await import('@/models/User');
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'USER' | 'ARTIST' | 'ADMIN';
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 