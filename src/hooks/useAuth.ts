'use client'

import { createContext, useContext } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ARTIST' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { name: string; email: string; password: string; role: 'USER' | 'ARTIST' }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}