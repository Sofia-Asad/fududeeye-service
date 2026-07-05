import { Mail } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import AuthCard from '@/components/auth/AuthCard'
import EmailSentCard from '@/components/auth/EmailSentCard'
import { buttonVariants } from '@/components/ui/Button'

export default function EmailSent() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  return (
    <AuthCard>
      <EmailSentCard email={email} />

      <div className="mt-8 grid gap-3">
        <a
          href={`mailto:${email}`}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <Mail size={16} />
          Open Email
        </a>
        <Link to="/login" className={buttonVariants({ variant: 'outline' })}>
          Back to Login
        </Link>
      </div>
    </AuthCard>
  )
}
