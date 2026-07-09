import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AxiosError } from 'axios'

import { api } from '@/api/client'
import type { User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isAuthMiss(error: unknown) {
  return error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await api.get<User>('/me/')
      setUser(response.data)
    } catch (error) {
      if (isAuthMiss(error)) {
        setUser(null)
        return
      }
      throw error
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post<User>('/auth/login/', { email, password })
    setUser(response.data)
    await refreshUser()
  }

  const logout = async () => {
    await api.post('/auth/logout/')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
