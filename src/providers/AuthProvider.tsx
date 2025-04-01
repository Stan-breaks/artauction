'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/hooks/useAuth'
import { fetchApi } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ARTIST' | 'ADMIN'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetchApi<{ user: User }>('/api/auth/me')
      setUser(response.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetchApi<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(response.user)
      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (data: { name: string; email: string; password: string; role: 'USER' | 'ARTIST' }) => {
    try {
      const response = await fetchApi<{ user: User }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setUser(response.user)
      router.push('/')
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}