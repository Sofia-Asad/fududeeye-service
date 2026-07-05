import { Link } from 'react-router-dom'

import AuthCard from '@/components/auth/AuthCard'
import SuccessState from '@/components/auth/SuccessState'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function PasswordChanged() {
  return (
    <AuthCard>
      <SuccessState
        title="Password Updated Successfully"
        description="Your password has been successfully reset. You can now sign in with your new password."
        action={
          <Link to="/login" className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}>
            Go to Sign In
          </Link>
        }
      />
    </AuthCard>
  )
}
