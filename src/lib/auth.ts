import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  })
} 