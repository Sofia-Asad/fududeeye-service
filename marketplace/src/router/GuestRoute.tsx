import { useEffect, type ReactNode } from 'react'

import Spinner from '@/components/ui/Spinner'
import { CRM_URL } from '@/constants/nav'
import { useAuth } from '@/hooks/useAuth'

/** Sends already-authenticated staff straight to the CRM instead of showing the login form again. */
export default function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = CRM_URL
    }
  }, [isLoading, user])

  if (isLoading || user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size={28} label={user ? 'Redirecting to the CRM…' : 'Checking your session'} />
      </div>
    )
  }

  return children
}
