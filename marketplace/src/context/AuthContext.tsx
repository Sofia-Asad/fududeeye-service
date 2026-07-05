import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import * as authService from '@/services/auth.service'
import type { LoginPayload, User } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const current = await authService.getCurrentUser()
    setUser(current)
  }

  useEffect(() => {
    let ignore = false
    authService.getCurrentUser().then(current => {
      if (ignore) return
      setUser(current)
      setIsLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [])

  const login = async (payload: LoginPayload) => {
    const loggedInUser = await authService.login(payload)
    setUser(loggedInUser)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = useMemo(() => ({ user, isLoading, login, logout, refreshUser }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
