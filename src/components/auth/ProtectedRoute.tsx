'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ARTIST' | 'ADMIN'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/')
    }
  }, [session, status, router, requiredRole])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
} 