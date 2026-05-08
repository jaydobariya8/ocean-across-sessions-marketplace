'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useRequireAuth(requiredRole?: 'creator' | 'user') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace('/dashboard')
    }
  }, [user, loading, router, requiredRole])

  return { user, loading }
}
