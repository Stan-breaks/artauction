import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthResponse {
  user: User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const data = await fetchApi<AuthResponse>('/api/auth/me')
      setUser(data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await fetchApi<AuthResponse>(
        `/api/auth?email=${email}&password=${password}`
      )
      setUser(data.user)
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string = 'USER'
  ) => {
    try {
      const data = await fetchApi<AuthResponse>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      })
      setUser(data.user)
      router.push('/')
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetchApi('/api/auth', {
        method: 'DELETE',
      })
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    login,
    signup,
    logout,
  }
} 