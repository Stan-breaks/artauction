import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

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