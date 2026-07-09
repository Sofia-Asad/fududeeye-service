import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from '@/auth/AuthContext'
import Logo from '@/components/Logo'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <span className="app-loading-ring" aria-hidden="true" />
            <Logo size={48} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Fududeeye</div>
            <div style={{ marginTop: 3, fontSize: 12, color: 'var(--muted)' }}>Loading your workspace...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
