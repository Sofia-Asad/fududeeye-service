import type { ReactNode } from 'react'

import { useAuth } from '@/auth/AuthContext'
import type { Role } from '@/types/auth'

const ROLE_RANK: Record<Role, number> = {
  SALES: 1,
  MANAGER: 2,
  ADMIN: 3,
}

export default function PermissionGate({
  minRole,
  children,
  fallback = null,
}: {
  minRole: Role
  children: ReactNode
  fallback?: ReactNode
}) {
  const { user } = useAuth()
  if (!user || ROLE_RANK[user.role] < ROLE_RANK[minRole]) {
    return fallback
  }
  return children
}
