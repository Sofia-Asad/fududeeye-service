import { Lock } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { SITE_NAME } from '@/constants/nav'

/**
 * Full navy background with a centered white card — used for the password
 * recovery and verification flows (forgot/reset password, check email,
 * verify code, success confirmations), matching the approved design.
 */
export default function CenteredAuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center bg-primary px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center gap-3 text-white">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-ink shadow-md">
            <Lock size={24} />
          </span>
          <span className="font-serif text-xl font-semibold">
            {SITE_NAME} <span className="text-gold">Marketplace</span>
          </span>
        </Link>

        <Outlet />
      </div>
    </div>
  )
}
