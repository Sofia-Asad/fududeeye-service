import { Link, Outlet } from 'react-router-dom'

import Logo from '@/components/Logo'
import { SITE_NAME } from '@/constants/nav'

/**
 * Full navy background with a centered white card — used for the password
 * recovery and verification flows (forgot/reset password, check email,
 * verify code, success confirmations), matching the approved design.
 */
export default function CenteredAuthLayout() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-primary px-4 py-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'rgba(242,183,5,.16)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'rgba(255,255,255,.05)' }}
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center gap-3 text-white">
          <Logo size={56} />
          <span className="font-serif text-xl font-semibold">
            {SITE_NAME} <span className="text-gold">Marketplace</span>
          </span>
        </Link>

        <Outlet />
      </div>
    </div>
  )
}
