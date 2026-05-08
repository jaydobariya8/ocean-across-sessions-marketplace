import Cookies from 'js-cookie'
import { api } from './api'
import type { User } from '@/types'

export function getAccessToken(): string | undefined {
  return Cookies.get('access_token')
}

export function setTokens(access: string, refresh: string) {
  Cookies.set('access_token', access, { expires: 1 / 96 }) // 15 min
  Cookies.set('refresh_token', refresh, { expires: 7 })
}

export function clearTokens() {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/user/')
  return data
}

export async function logout() {
  const refresh = Cookies.get('refresh_token')
  if (refresh) {
    await api.post('/auth/logout/', { refresh }).catch(() => {})
  }
  clearTokens()
}
