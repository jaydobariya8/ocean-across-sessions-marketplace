'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchCurrentUser, logout as doLogout, isAuthenticated } from '@/lib/auth'
import type { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false)
      return
    }
    try {
      const u = await fetchCurrentUser()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const logout = useCallback(async () => {
    await doLogout()
    setUser(null)
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    loadUser()
  }, [loadUser])

  return {
    user,
    loading,
    logout,
    refresh,
    isAuthenticated: !!user,
    isCreator: user?.role === 'creator',
  }
}
